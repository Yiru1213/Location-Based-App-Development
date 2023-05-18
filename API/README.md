# **Data API of the Asset Condition Assessment Tool**

A technical guide for the data API of the asset condition assessment tool. This API allows the user to get asset data from the database and post/insert asset data to the database.

## Table of Contents

1.  System Requirement

2.  Deployment

3.  Testing

4.  File Description

5.  Code reference

## 1. System Requirement

-   To enable the full functionality of this API, a browser that supports geolocation access via an HTTP connection is required. Some browsers (such as Safari) may block geolocation access via HTTP connection. As a result, the app cannot locate and zoom into user positions if it is opened in those browsers. Therefore, it is recommended to use the latest Chrome (Version 112.0.5615.138) for this API.

-   This API requires making connections to a Ubuntu Server (Virtual Machine). Cyberduck (Version 8.5.8 or above) or other SSH software can be used to connect to the Ubuntu Server.

## 2. Deployment

1\. Clone the source code of this API from GitHub to the your server by typing in the command line (terminal) window for Ubuntu:

`git clone https://github.com/Yiru1213/Location-Based-App-Development.git`

2\. Start the Node JS server.

`pm2 start dataAPI.js`

3\. Make sure the Node JS server is successfully started. If any error occurs, you can enter the debug mode through the command line window by typing:

`node dataAPI.js`

## 3. Testing

-   **Procedures**

1.  Make sure the Node JS server is active.

2.  Type the endpoints to the browser with the exact end points in the routes to test the functionality of the API. An example of such a test could be: [[https://\<\<your]{.underline}](https://%3C%3Cyour) [server IP address\>\>/api/userID]{.underline}

3.  While testing this API functionality, use Inspect or Developer mode of the browser to see if any error occurs.

-   **Details**

1.  Delete all of your dictionaries in the database before testing.

2.  Clone the main branch of the API repositories to the test server (code in last section).

3.  Start the node server by running dataAPI.js file for the API.

4.  Test the functionality of the API using the exact endpoints as specified in the routes files.

    If it is a GET end point you can type the URL into a browser. Examples are give below.

    `https://<<your server IP address>>/api/conditionDetails`

    `https://<<your server IP address>>/api/userRanking/:user_id`

    (change the ':user_id' to your own user ID)

    If it is a POST end point you can adapt an ajax html using JQuery so that you can type a string of name/value parameters into a second box and then send that to the API endpoint. Example of the html is given as follows.

    (Referenced from the example codes of CEGE 0043 Web and Mobile GIS by Claire Ellul).

    `<DOCTYPE html>`

    `<head>`

    `<title>AJAX example</title>`

    `</head>`

    `<body>`

    `<h2>This page uses native Javascript AJAX to load the Centennial room data automatically when the page is loaded. They results are displayed in a DIV</h2>`

    `<div id="roomdiv"></div>`

    `<br>`

    `<br>`

    `<h2 > You can also type any URL into this box and the results of the AJAX query will be displayed in a second DIV</h2>`

    `<br><input id="ajaxURL" type="text" style="width:500px">`

    `<button id="ajaxButton" onclick="getData()">Click here to load the data</button>`

    `<div id="ajaxDIV"></div>`

    `</body>`

    `<!-- use JQuery as it makes AJAX easy -->`

    `<!-- JQuery takes time to load so put it after the body of the page has loaded -->`

    `<script`

    `src="https://code.jquery.com/jquery-3.4.1.min.js"`

    `integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo="`

    `crossorigin="anonymous"></script>`

    `<!-- now get the script to run the AJAX requests and process the results -->`

    `<script src="js/ajaxRequestsResponses.js"></script>`

    `<script>`

    `// code below runs once the page has loaded`

    `// NB this is not in a function so it will run without needed a call to a function`

    `document.addEventListener('DOMContentLoaded', function() {`

    `console.log("listener domcontentloaded");`

    `startPage();`

    `}, false);`

    `</script>`

    `</html>`

## 4. Files

| File name                          | Description                                                                                  |
|------------------------------------|------------------------------------|
| dataAPI                            | A http server to server files                                                                |
| geoJSON (in the routes sub-folder) | A route to handle http requests to get geoJSONdata from the database                         |
| crud (in the routes sub-folder)    | A route to handle http request to get data from the database and post data into the database |

## 5. Code Reference

A large proportion of codes are adapted from the example codes by Calire Ellul, including:

1.  Basic construction of the dataAPI http server

2.  Setting up the configuration file in the two routes (geoJSON and crud)

3.  SQL codes for endpoint queries

4.  JavaScript codes to send data back in correct format

In addition, to the codes adapted from Calire Ellul, this API also utilizes several NPM libraries to implement various functionalities. These libraries are listed as follows:

-   express: A Node.js framework that provides features for web and mobile applications, such as routing, middleware, and templates.

-   pg: A Node.js client for PostgreSQL allows Node.js applications to interact with PostgreSQL databases.

-   fs: A Node.js built-in module for working with the file system. It allows reading, writing, and manipulating files and directories.

-   os: A Node.js built-in module that provides operating system-related utility methods and properties, such as retrieving information about the computer's memory, CPU, network interfaces, and more.
