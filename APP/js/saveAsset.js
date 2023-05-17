'use strict';

// upload user's new asset information into the database
function saveAsset(latitude, longitude) {
    // get the input box values
    let asset_name = document.getElementById("asset_name").value;
    let installation_date = document.getElementById("installation_date").value;
    let postString = "asset_name="+asset_name+"&installation_date="+installation_date;
    // get the geometry values
    let lat = latitude;
    let lng = longitude;

    // error handling for empty asset name and installation date
    // asset_name or the installation is empty
    if (asset_name.trim() === '' || installation_date.trim() === ''){
        alert("The asset name and the installation date cannot be empty.")
    }
    else {
        postString = postString + "&latitude=" + lat + "&longitude=" + lng;
        processAssetData(postString);

        // close the popup after saving the asset
        mymap.closePopup();
    }
}

function processAssetData(postString) {
    let serviceUrl=  document.location.origin + "/api/insertAssetPoint/";
   $.ajax({
    url: serviceUrl,
    // allow request to other servers
    crossDomain: true,
    type: "POST",
    data: postString,
    // if the response is successful
    success: function(data){assetDataUploaded(data);}
    }); 
}


// create the code to process the response from the data server
function assetDataUploaded(data) {
    // show the response as an alert
    let geojsonFeature = JSON.stringify(data);
    console.log(geojsonFeature);
    loadAssetAssetPoints(userID);
}
