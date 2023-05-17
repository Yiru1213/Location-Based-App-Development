"use strict";

// create a global variable to store the map
let mymap; 
mymap = L.map("mapid").setView([51.505, -0.09], 13);
// create a global variable to customize popup
let popup;
//add the map when the page is loaded
document.addEventListener('DOMContentLoaded', function(){loadMap()}, false)


// define a global variable to store location layer
// so that it can be removed when the screen size is large
let trackLocationLayer = [];
// store the ID of the location tracker 
// so that it can be used to switch the location tracking off
let geoLocationID;

// define  a global variable to store the asset points
// so that the popup of the asset can be removed after submitting the forms
let markerById = {};
// define a global variable to store the asset points layer 
// so that asset points can be removed when the sceen size is changed
let assetPointsLayer;

// a function to get the userID
function getUserID(){
    // AJAX call to get the userID
    let userID;
    let userIDURL = "/api/userID";
    let baseComputerAddress = document.location.origin;
    let serviceURL = baseComputerAddress + userIDURL;
    // make the AJAX call to the /userID endpoint and get the userID
    $.ajax({
        url: serviceURL,
        type: "GET",
        dataType: "json",
        // make the Ajax call synchronous and wait for the response before continuing execution
        async: false,
        success: function(result) {
            // store the userID in a global variable
            // and remove quotes from the response string
            userID = result.user_id;
        },
        error: function(jqXHR, textStatus, errorThrown) {
        console.log("Error getting userID: " + textStatus + ", " + errorThrown);
        }
    }); 
    return userID;  
}
// define a global variable to store the userID
let userID = getUserID();


// a function to get the condition reports number
function getConditionReports(){
    // AJAX call to get the userID
    let reports_number;
    let baseComputerAddress = document.location.origin;
    let dataAddress= "/api/userConditionReports/"+ userID;
    let layerURL = baseComputerAddress + dataAddress; 
    $.ajax({
        url: layerURL,  
        crossDomain: true, 
        // make the Ajax call synchronous and wait for the response before continuing execution
        async: false,
        success: function(result){
            // store the condition report number in a global variable
            // and remove quotes from the response string
            reports_number = result.num_reports;
        },
        error: function(jqXHR, textStatus, errorThrown) {
        console.log("Error getting userID: " + textStatus + ", " + errorThrown);
        }
    }); 
    return reports_number;  
}
// define a global variable to store the condition reports number
let conditionReportNumber = getConditionReports();




function loadMap(){
    // load the basic map
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution : '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mymap);
 
    // set map click event switcher
    window.addEventListener('resize', setMapClickEvent);
    setMapClickEvent(); 
}


// asset creation component
// define a global variable to store the screen size
let width; 
function setMapClickEvent() {
    // get the window width
    width = $(window).width();
    // bootstrap small and XS options for condition assessment
    if (width < 992) { 
        // cancel the map onclick event
        mymap.off('click', onMapClick);
        // the click functionality of the points should pop up a blank condition assessment form
        setUpPointClick();     
    }
    // bootstrap medium and Large options for asset creation
    else { 
        // load the existing asset points 
        loadAssetAssetPoints(userID);

        // the click functionality of the map should pop up a blank asset creation form
        mymap.on('click', onMapClick); 
    }
    
    // create an event listener to wait for the user's click event 
    // and then use the popup to show them where they clicked
    function onMapClick(e) {
        let latitude = e.latlng.lat;
        let longitude = e.latlng.lng;
        let formHTML = assetFormHtml(latitude,longitude);
        let popup = L.popup();
        popup
            .setLatLng(e.latlng)
            .setContent(formHTML)
            .openOn(mymap);
    }
}


// asset creation form html
function assetFormHtml(latitude,longitude) {
    let myvar =  "<h3>" + "Asset Creation" + "</h3><br>" + 
    // a hidden element with the userID 
    "<div id='user_id' hidden>"+"User ID: "+ userID + "</div>"+ 
    '<label for="asset_name"><b>Asset Name</b></label><input type="text" size="25" id="asset_name"/><br />'+
    '<label for="installation"><b>Installation Date</b></label><input type="text" size="25" id="installation_date"/><br />'+
    '<p></p>'+
    '<div id="latitude"><b>Latitude: </b>'+ latitude + '</div>'+
    '<div id="longitude"><b>Longitude: </b>'+ longitude + '</div>'+
    '<p><button id="saveAsset" onclick="saveAsset('+latitude+','+longitude+')">Save Asset</button></p>';
    return myvar;
}



// load the asset points by default for the asset creation component
function loadAssetAssetPoints(userID){
    // remove the tracking layer
    if (trackLocationLayer.length > 0) {
        removePositionPoints();
    }
    // remove original asset points layer
    if (assetPointsLayer) {
        mymap.removeLayer(assetPointsLayer);
        assetPointsLayer = null;
    }
    let baseComputerAddress = document.location.origin;
    let dataAddress= "/api/userAssets/"+ userID;
    let layerURL = baseComputerAddress + dataAddress; 
    $.ajax({
        url: layerURL,  
        crossDomain: true, 
        // make the Ajax call synchronous and wait for the response before continuing execution
        async: false,
        success: function(result){
            // define a red marker icon
            let redIcon = L.icon({
                iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                tooltipAnchor: [16, -28],
                shadowSize: [41, 41]
            });
            // load the geoJSON layer
            assetPointsLayer = L.geoJSON(result,{
                // use point to layer to create the points
                pointToLayer: function(feature, latlng){
                    // include a pop-up shows the baasic information of the asset 
                    return L.marker(latlng, {icon: redIcon}).bindPopup(getAssetPopupHTML(feature,latlng));
                },  // end of point to layer
            }).addTo(mymap);
            //change the map zoom so that all the data is shown
            mymap.fitBounds(assetPointsLayer.getBounds());
        } // end of inner function
    }) // end of ajax request
} // end of load asset points function


// asset points' read-only popup message 
function getAssetPopupHTML(feature, latlng){
    // get the required values
    let asset_name = feature.properties.asset_name;
    let installation_date = feature.properties.installation_date;
    let latest_condition = feature.properties.condition_description;

    let htmlString =  "<h4>" + "Asset Condition" + "</h4><br>";
    htmlString = htmlString + "<DIV id='popup'>" + "Asset Name: "+"<b>"+ asset_name + "</b><br>";
    htmlString = htmlString + "Installation Date: "+"<b>"+ installation_date + "</b><br>";

    if (latest_condition == 'Unknown') {
        htmlString = htmlString + "Latest Condition: "+"<b>no condition captured</b><br>";
    }
    else {
        htmlString = htmlString + "Latest Condition: "+"<b>"+ latest_condition + "</b><br>";
    }
   
    htmlString = htmlString + "</div>";

    return htmlString;
}



// condition assessment component
function setUpPointClick(){
    trackLocation();
    loadConditionAssetPoints(userID);
} 


// load the asset points by default for the condition assessment component
function loadConditionAssetPoints(userID){
    if (assetPointsLayer) {
        mymap.removeLayer(assetPointsLayer);
        assetPointsLayer = null;
    }
    // ajax call to get the assets created by the user
    let baseComputerAddress = document.location.origin;
    let dataAddress= "/api/userAssets/"+ userID;
    let layerURL = baseComputerAddress + dataAddress; 
    $.ajax({
        url: layerURL,  
        crossDomain: true, 
        // make the Ajax call synchronous and wait for the response before continuing execution
        async: false,
        success: function(result){
            // load the geoJSON layer
            assetPointsLayer = L.geoJSON(result,{
                // use point to layer to create the points
                pointToLayer: function(feature, latlng){
                    // get the marker color
                    let color = getMarkerColor(feature.properties.condition_description); 
                    let markerColor = L.AwesomeMarkers.icon({
                        icon:'play',
                        markerColor:color});
                    // create asset markers
                    let marker = L.marker(latlng, {icon:markerColor});
                    // store the marker by ID
                    markerById[feature.properties.asset_id] = marker; 
                    // create a popup and attach it to the marker
                    let popup = getConditionPopupHTML(feature,latlng);
                    marker.bindPopup(popup);
                    // add event listener to show the popup when the marker is clicked
                    marker.on('click', function() {
                        marker.openPopup();
                    });
                    return marker;
                },  // end of point to layer
            }).addTo(mymap);
        } // end of inner function
    }) // end of ajax request
} // end of load asset points function

// condition assessment form html 
function getConditionPopupHTML(feature, latlng){
    // get the required values
    let asset_id = feature.properties.asset_id; 
    let asset_name = feature.properties.asset_name;
    let previous_condition = feature.properties.condition_description;
    // Use a regular expression to replace any single quotes with escaped single quotes
    let installation_date = feature.properties.installation_date;
    // make an AJAX call to get condition option lists
    let userIDURL = "/api/conditionDetails";
    let baseComputerAddress = document.location.origin;
    let serviceURL = baseComputerAddress + userIDURL;
    let htmlString = "";
    $.ajax({
        url: serviceURL,
        type: "GET",
        dataType: "json",
        // make the Ajax call synchronous and wait for the response before continuing execution
        async: false,
        success: function(result) {
            let descriptionsById = getConditionOptions(result);
            
            htmlString = htmlString + "<DIV id='popup'>";
            htmlString = htmlString + "<h3>" + "Condition Assessment" + "</h3><br>";
            htmlString = htmlString +"Asset Name: "+"<b>"+ asset_name + "</b><br>";
            // a hidden element with the asset id
            htmlString = htmlString + "<div id='asset_id' hidden>"+asset_id+"</div>";
             // a hidden element with the user id
            htmlString = htmlString + "<div id='user_id' hidden>"+ userID +"</div>";
            htmlString = htmlString + "<p>Installation Date: "+"<b>"+ installation_date + "</b></p><br>";
            htmlString = htmlString + 
            "<input type='radio' name='condition_answer' id ='"+asset_id+"_1'/>" + descriptionsById[1] +"<br>";
            htmlString = htmlString + 
            "<input type='radio' name='condition_answer' id ='"+asset_id+"_2'/>" + descriptionsById[2] +"<br>";
            htmlString = htmlString + 
            "<input type='radio' name='condition_answer' id ='"+asset_id+"_3'/>" + descriptionsById[3] +"<br>";
            htmlString = htmlString + 
            "<input type='radio' name='condition_answer' id ='"+asset_id+"_4'/>" + descriptionsById[4] +"<br>";
            htmlString = htmlString +
            "<input type='radio' name='condition_answer' id ='"+asset_id+"_5'/>" + descriptionsById[5] +"<br>";
            htmlString = htmlString +
            "<input type='radio' name='condition_answer' id ='"+asset_id+"_6'/>" + descriptionsById[6] +"<br>";
            htmlString = htmlString +
            "<p><button id = 'saveCondition' onclick='saveCondition("+asset_id+",\""+asset_name+"\",\""+previous_condition+"\","+JSON.stringify(descriptionsById)+");return false;'>Save Condition</button></p>";
            htmlString = htmlString + "</DIV>";
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("Error getting condition options: " + textStatus + ", " + errorThrown);
        }
    });
    return htmlString;
}

// get the condition options from the database
function getConditionOptions(jsonResult){
    // parse the JSON string into a JavaScript object
    let parsedResult = JSON.parse(jsonResult);
    // define a condition description array
    let descriptionsById = {};
    // forEach loop iterates through the parsed result array 
    // and adds each condition_description text to the corresponding id
    // reference from : https://www.w3schools.com/jsref/jsref_foreach.asp
    parsedResult.forEach((obj) => {
        let { id, condition_description } = obj;
        if (descriptionsById[id]) {
            descriptionsById[id].push(condition_description);
        } 
        else {
            descriptionsById[id] = [condition_description];
        }
    });
     return descriptionsById;
}

// define marker color according to different condition descriptions
function getMarkerColor(condition_description) {
    // make an AJAX call to get condition option lists
    let userIDURL = "/api/conditionDetails";
    let baseComputerAddress = document.location.origin;
    let serviceURL = baseComputerAddress + userIDURL;
    let descriptionsById = {};
    $.ajax({
        url: serviceURL,
        type: "GET",
        dataType: "json",
        // make the Ajax call synchronous and wait for the response before continuing execution
        async: false,
        success: function(result) {
            descriptionsById = getConditionOptions(result);
        }
    });
    let colorByCondition = {
        // the color goes from cold to warm with the condition deteriorates
        // and gray color for no condition
        [descriptionsById[1]]: "green",
        [descriptionsById[2]]: "blue",
        [descriptionsById[3]]: "orange",
        [descriptionsById[4]]: "pink",
        [descriptionsById[5]]: "red",
        [descriptionsById[6]]: "gray"
    };
    return colorByCondition[condition_description];
}

