'use strict';

// upload user's condition report to the database
function saveCondition(assetID, assetName, previousCondition, conditionDescription) {

    // get the radio button/condition values
    if (document.getElementById(assetID+"_1").checked) {
        var current_condition = conditionDescription[1];
    }
    if (document.getElementById(assetID+"_2").checked) {
        var current_condition = conditionDescription[2];
    }
    if (document.getElementById(assetID+"_3").checked) {
        var current_condition = conditionDescription[3];
    }
    if (document.getElementById(assetID+"_4").checked) {
        var current_condition = conditionDescription[4];
    }
    if (document.getElementById(assetID+"_5").checked) {
        var current_condition = conditionDescription[5];
    }
    if (document.getElementById(assetID+"_6").checked) {
        var current_condition = conditionDescription[6];
    }
    
   
    let postString = "asset_name=" + assetName + "&condition_description=" + current_condition;

    // compare with the previous condition
    if (previousCondition == current_condition) {
        alert('This condition matches the previous condition.\nYou have submitted '+conditionReportNumber+' condition reports so far.')
    }
    else {
        alert("This condition doesn't match the previous condition.\nYou have submitted "+conditionReportNumber+" condition reports so far.") 
    }
   
    processConditionData(postString);
    
    let asset_point = markerById[assetID];
    // close the popup associated with the asset point
    if (asset_point && asset_point.getPopup() && asset_point.getPopup().isOpen()) {
        asset_point.closePopup();
    };
}

// upload the data into the database
function processConditionData(postString) {
    let serviceUrl=  document.location.origin + "/api/insertConditionInformation/";
    $.ajax({
    url: serviceUrl,
    // allow request to other servers
    crossDomain: true,
    type: "POST",
    data: postString,
    // if the response is successful
    success: function(data){conditionDataUploaded(data);}
    }); 
}

// create the code to process the response from the data server
function conditionDataUploaded(data) {
    // show the response as an alert
    let geojsonFeature = JSON.stringify(data);
    console.log(geojsonFeature);
    loadConditionAssetPoints(userID);
}
