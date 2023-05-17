"use strict";

// express is the server that forms part of the nodejs program
let express = require('express');
let path = require("path");
let fs = require('fs');
let app = express();

console.log('data API has started');

// add an https server to serve files
let http = require('http');
let httpServer = http.createServer(app);
let port = 4480
httpServer.listen(port);

// a route for handling http get request to the / path
app.get('/',function (req,res) {
    res.send("Hello World from the Data API on port: "+ port +
    ' The current timestamp is:' + Date.now());
});


// adding functionality to allow cross-origin queries 
app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
});


// adding functionality to log the requests on the console for debugging
app.use(function (req, res, next) {
    let filename = path.basename(req.url);
    let extension = path.extname(filename);
    console.log("The file " + filename + " was requested.");
    next();
});


// define middleware - i.e. the geoJSON router
const geoJSON = require('./routes/geoJSON');
// a route to handle all http requests to the /geoJSON path
app.use('/', geoJSON);
 

// define middleware - i.e. the crud router
const crud = require('./routes/crud');
// a route to handle all http requests to the /crud path
app.use('/', crud);