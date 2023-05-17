'use strict';

let express = require('express');
let pg = require('pg');
let geoJSON = require('express').Router();
let fs = require('fs');
let os = require('os');

// get the username
const username = os.userInfo().username;
console.log(username);
// locate the database login details
const configtext = ""+
fs.readFileSync("/home/"+username+"/certs/postGISConnection.js");


// convert the configuration file into the correct format - a name/value pair array
const configarray = configtext.split(",");
let config = {};
for (let i = 0; i < configarray.length; i++) {
    let split = configarray[i].split(':');
    config[split[0].trim()] = split[1].trim();
 }
const pool = new pg.Pool(config);
console.log(config);


// Core Functionality 1
// load asset points
geoJSON.get('/userAssets/:user_id', function(req, res){
    pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }

        var colnames = "asset_id, asset_name, installation_date, latest_condition_report_date, condition_description";
        // now use the inbuilt geoJSON functionality
        // and create the required geoJSON format using a query adapted from here:
        // http://www.postgresonline.com/journal/archives/267-Creating-GeoJSON-Feature-Collections-with-JSON-and-PostGIS-functions.html, accessed 4th January 2018
        var querystring = " SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features  FROM ";
        querystring += "(SELECT 'Feature' As type     , ST_AsGeoJSON(lg.location)::json As geometry, ";
        querystring += "row_to_json((SELECT l FROM (SELECT "+colnames + " ) As l      )) As properties";
        querystring += "   FROM cege0043.asset_with_latest_condition As lg ";
        querystring += " where user_id = $1 limit 100  ) As f ";

        client.query(querystring,[req.params.user_id], function(err,result){
            //call `done()` to release the client back to the pool
            done(); 
            if(err){
                console.log(err);
                res.status(400).send(err);
            }
            let geoJSONData = JSON.stringify(result.rows);
            // remove the extra [ ] from the GeoJSON as this won't work with QGIS
            geoJSONData = geoJSONData.substring(1); 
            geoJSONData = geoJSONData.substring(0, geoJSONData.length - 1);         
            res.status(200).send(JSON.parse(geoJSONData));
        }); // end of the geoJSON query
    }); // end of the pool
}); // end of the functionality

// get condition options
geoJSON.get('/conditionDetails', function(req, res){
    pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }

        var querystring = " select * from cege0043.asset_condition_options;";
        client.query(querystring, function(err,result){
            //call `done()` to release the client back to the pool
            done(); 
            if(err){
                console.log(err);
                res.status(400).send(err);
            }
            res.status(200).json(JSON.stringify(result.rows));
        }); // end of the JSON query
    }); // end of the pool
}); // end of the functionality


// Advanced Functionality 1
// show how many reports the user is getting
geoJSON.get('/userConditionReports/:user_id', function(req, res){
    pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }

        var querystring = "select array_to_json (array_agg(c)) from";
        querystring += "(SELECT COUNT(*) AS num_reports ";
        querystring += " from cege0043.asset_condition_information where user_id = $1) c;";

        client.query(querystring,[req.params.user_id], function(err,result){
            //call `done()` to release the client back to the pool
            done(); 
            if(err){
                console.log(err);
                res.status(400).send(err);
            }
            let geoJSONData = result.rows[0]['array_to_json'][0];
            let numReports = geoJSONData['num_reports'];
            res.status(200).send({'num_reports': numReports});
        }); // end of the geoJSON query
    }); // end of the pool
}); // end of the functionality

// user ranking
geoJSON.get('/userRanking/:user_id', function(req, res){
    pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }

        var querystring = "select array_to_json (array_agg(hh)) from";
        querystring += "(select c.rank from (SELECT b.user_id, rank()over (order by num_reports desc) as rank";
        querystring += " from (select COUNT(*) AS num_reports, user_id";
        querystring += " from cege0043.asset_condition_information";
        querystring += " group by user_id) b) c";
        querystring += " where c.user_id = $1) hh";

        client.query(querystring,[req.params.user_id], function(err,result){
            //call `done()` to release the client back to the pool
            done(); 
            if(err){
                console.log(err);
                res.status(400).send(err);
            }
            let jsonData = result.rows[0]['array_to_json'][0];
            let userRank = jsonData['rank'];
            res.status(200).send({'rank': userRank});
        }); // end of the JSON query
    }); // end of the pool
}); // end of the functionality


// Advanced Function 2
// get list of assets with at least one report in the best condition
geoJSON.get('/assetsInGreatCondition', function(req, res){
    pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }

        var querystring = " select array_to_json (array_agg(d)) from";
        querystring += "(select c.* from cege0043.asset_information c";
        querystring += " inner join";
        querystring += " (select count(*) as best_condition, asset_id";
        querystring += " from cege0043.asset_condition_information where condition_id in";
        querystring += " (select id from cege0043.asset_condition_options"
        querystring += " where condition_description like '%very good%')";
        querystring += " group by asset_id";
        querystring += " order by best_condition desc) b";
        querystring += " on b.asset_id = c.id) d";

        client.query(querystring, function(err,result){
            //call `done()` to release the client back to the pool
            done(); 
            if(err){
                console.log(err);
                res.status(400).send(err);
            }
            let jsonData = result.rows[0]['array_to_json'];
            res.status(200).send(jsonData);
        }); // end of the JSON query
    }); // end of the pool
}); // end of the functionality

// graph showing daily reporting rates for the past week
geoJSON.get('/dailyParticipationRates', function(req, res){
    pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }

        var querystring = "select array_to_json (array_agg(c)) from";
        querystring += "(select day, sum(reports_submitted) as reports_submitted, ";
        querystring += " sum(not_working) as reports_not_working";
        querystring += " from cege0043.report_summary";
        querystring += " group by day) c";

        client.query(querystring, function(err,result){
            //call `done()` to release the client back to the pool
            done(); 
            if(err){
                console.log(err);
                res.status(400).send(err);
            }

            let jsonData = result.rows[0]['array_to_json'];
            console.log(jsonData);
            // Format the data as a GeoJSON FeatureCollection
            let features = jsonData.map(function(row) {
                return {
                    "type": "Feature",
                    "properties": {
                        "day": row.day,
                        "reports_submitted": row.reports_submitted,
                        "reports_not_working": row.reports_not_working
                    }
                };
            });

            let json = {
                "type": "FeatureCollection",
                "features": features
            };

            res.status(200).send(json);
        }); // end of the geoJSON query
    }); // end of the pool
}); // end of the functionality
  
// map layer showing the 5 assets cloest to the user's current location
geoJSON.get('/userFiveClosestAssets/:latitude/:longitude', function(req, res){
    pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }

        let querystring = "SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features  FROM ";
        querystring += "(SELECT 'Feature' As type     , ST_AsGeoJSON(lg.location)::json As geometry,";
        querystring += "row_to_json((SELECT l FROM (SELECT id, asset_name, installation_date) As l )) As properties";
        querystring += " FROM   (select c.* from cege0043.asset_information c ";
        querystring += " inner join (select id, st_distance(a.location, st_geomfromtext('POINT("+req.params.longitude+" "+req.params.latitude+")',4326)) as distance ";
        querystring += " from cege0043.asset_information a";
        querystring += " order by distance asc limit 5) b on c.id = b.id ) as lg) As f";

        client.query(querystring, function(err,result){
            //call `done()` to release the client back to the pool
            done(); 
            if(err){
                console.log(err);
                res.status(400).send(err);
            }

            let jsonArray = result.rows[0].features;
            let features = jsonArray;
            let geoJSONData = {
                type: "FeatureCollection",
                features
            };
            geoJSONData = JSON.stringify(geoJSONData);
            console.log(geoJSONData);
            res.status(200).send(JSON.parse(geoJSONData));
        }); // end of the geoJSON query
    }); // end of the pool
}); // end of the functionality


// map layer showing the last 5 reports that the user created
geoJSON.get('/lastFiveConditionReports/:user_id', function(req, res){
    pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }

        let querystring = "SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features  FROM  ";
        querystring += "(SELECT 'Feature' As type     , ST_AsGeoJSON(lg.location)::json As geometry,";
        querystring += "row_to_json((SELECT l FROM (SELECT id,user_id, asset_name, condition_description";
        querystring += " ) As l )) As properties FROM ";
        querystring += " (select * from cege0043.condition_reports_with_text_descriptions";
        querystring += " where user_id = $1 order by timestamp desc limit 5) as lg) As f";

        client.query(querystring,[req.params.user_id], function(err,result){
            //call `done()` to release the client back to the pool
            done(); 
            if(err){
                console.log(err);
                res.status(400).send(err);
            }

            let jsonArray = result.rows[0].features;
            let features = jsonArray;
            let geoJSONData = {
                type: "FeatureCollection",
                features
            };
            geoJSONData = JSON.stringify(geoJSONData);
            console.log(geoJSONData);
            res.status(200).send(JSON.parse(geoJSONData));
        }); // end of the geoJSON query
    }); // end of the pool
}); // end of the functionality

// map layer showing the last 5 reports that the user created
geoJSON.get('/lastFiveConditionReports/:user_id', function(req, res){
    pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }

        let querystring = "SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features  FROM  ";
        querystring += "(SELECT 'Feature' As type     , ST_AsGeoJSON(lg.location)::json As geometry,";
        querystring += "row_to_json((SELECT l FROM (SELECT id,user_id, asset_name, condition_description";
        querystring += " ) As l )) As properties FROM ";
        querystring += " (select * from cege0043.condition_reports_with_text_descriptions";
        querystring += " where user_id = $1 order by timestamp desc limit 5) as lg) As f";

        client.query(querystring,[req.params.user_id], function(err,result){
            //call `done()` to release the client back to the pool
            done(); 
            if(err){
                console.log(err);
                res.status(400).send(err);
            }

            let jsonArray = result.rows[0].features;
            let features = jsonArray;
            let geoJSONData = {
                type: "FeatureCollection",
                features
            };
            geoJSONData = JSON.stringify(geoJSONData);
            console.log(geoJSONData);
            res.status(200).send(JSON.parse(geoJSONData));
        }); // end of the geoJSON query
    }); // end of the pool
}); // end of the functionality

// map layer showing assets that the user hasn’t already given a condition report for in the last 3 days
geoJSON.get('/conditionReportMissing/:user_id', function(req, res){
    pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }

        let querystring = "SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features  FROM  ";
        querystring += "(SELECT 'Feature' As type     , ST_AsGeoJSON(lg.location)::json As geometry,";
        querystring += "row_to_json((SELECT l FROM (SELECT asset_id, asset_name, installation_date, ";
        querystring += " latest_condition_report_date, condition_description) As l )) As properties from ";
        querystring += " (select * from cege0043.asset_with_latest_condition where user_id = $1 and asset_id not in ";
        querystring += " (select asset_id from cege0043.asset_condition_information";
        querystring += " where user_id = $1 and ";
        querystring += " timestamp > NOW()::DATE-EXTRACT(DOW FROM NOW())::INTEGER-3)  ) as lg) As f";

        client.query(querystring,[req.params.user_id], function(err,result){
            //call `done()` to release the client back to the pool
            done(); 
            if(err){
                console.log(err);
                res.status(400).send(err);
            }

            let jsonArray = result.rows[0].features;
            let features = jsonArray;
            let geoJSONData = {
                type: "FeatureCollection",
                features
            };
            geoJSONData = JSON.stringify(geoJSONData);
            console.log(geoJSONData);
            res.status(200).send(JSON.parse(geoJSONData));
        }); // end of the geoJSON query
    }); // end of the pool
}); // end of the functionality

module.exports = geoJSON;