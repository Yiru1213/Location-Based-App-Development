'use strict';

let express = require('express');
let pg = require('pg');
let crud = require('express').Router();
let fs = require('fs');
let os = require('os');

// get the username - ensure that it can be used on multiple machines
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

const bodyParser = require('body-parser');
crud.use(bodyParser.urlencoded({ extended: true }));

// GET Functionality
// get userID 
crud.get('/userID', function (req, res){
    pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }
        let querystring = 'select user_id from ucfscde.users where user_name = current_user;'
        client.query(querystring, 
            function(err,result) {
                done(); 
                if(err){
                    console.log(err);
                    res.status(400).send(err);
                }
                let userID = JSON.stringify(result.rows);
                // remove the extra [ ] from the GeoJSON as this won't work with QGIS
                userID = userID.substring(1); 
                userID = userID.substring(0, userID.length - 1);     
                res.status(200).send(userID);
            });
    });
});


// Core Functionality 1
// insert asset point
crud.post('/insertAssetPoint/',function (req,res) {
    pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }

        var asset_name = req.body.asset_name;
        var installation_date = req.body.installation_date;
        var geometrystring = "st_geomfromtext('POINT("+req.body.longitude+ " "+req.body.latitude +")',4326)";
        var querystring = "INSERT into cege0043.asset_information (asset_name,installation_date, location) values ";
        querystring += "($1,$2,";
        querystring += geometrystring + ")";

        client.query(querystring, [asset_name,installation_date], function(err,result) {
            done();
            if(err){
                console.log(err);
                res.status(400).send(err);
            }
            res.json({message:req.body});
        });
    });
});
// insert asset condition information
crud.post('/insertConditionInformation/',function (req,res) {
    pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }

        var asset_name = req.body.asset_name;
        var condition_description = req.body.condition_description;
        var querystring = "INSERT into cege0043.asset_condition_information (asset_id, condition_id) values (";
        querystring += "(select id from cege0043.asset_information where asset_name = $1),"
        querystring += "(select id from cege0043.asset_condition_options where condition_description = $2))";
        client.query(querystring, [asset_name,condition_description], function(err,result) {
            done();
            if(err){
                console.log(err);
                res.status(400).send(err);
            }
            res.json({message:req.body});
        });
    });
});


module.exports = crud;