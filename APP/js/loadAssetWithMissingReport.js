'use strict';

// show the user’s assets that the user hasn't rated in the last 3 days
function loadAssetWithMissingReport(userID){
    // remove default asset points layer
    if (assetPointsLayer) {
        mymap.removeLayer(assetPointsLayer);
        assetPointsLayer = null;
    }
    // array of distances to each asset in metres
    let distances = [];
    let baseComputerAddress = document.location.origin;
    let dataAddress= "/api/conditionReportMissing/"+ userID;
    let layerURL = baseComputerAddress + dataAddress; 
    // ajax call to get the closest asset data
    $.ajax({
            url: layerURL,  
            crossDomain: true,
    }).done(function(result){
        if (result.features != null){
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
                    // include a pop-up shows the basic information of the asset
                    // get the required values
                    let asset_name = feature.properties.asset_name;
                    let latest_condition = feature.properties.condition_description;
                    // define the popup message
                    let popup = "<DIV id='popup'>"+ "Asset Name: "+"<b>"+ asset_name + "</b><br>";
                    if (latest_condition == 'Unknown') {
                        popup = popup + "Latest Condition: "+"<b>no condition captured</b><br>";
                    }
                    else {
                        popup = popup + "Latest Condition: "+"<b>"+ latest_condition + "</b><br>";
                    }
                    popup = popup + "<p></p>"+ "<b>You can't provide a condition report for these assets.</b></br>"+"</DIV>"; 
                    return L.marker(latlng, 
                        {icon:redIcon}).bindPopup(popup);
                },  // end of point to layer
            }).addTo(mymap);
        }
        else{
            alert("You don't have any asset that hasn't been rated in the last 3 days.")
        }
    }).fail(function(jqXHR, textStatus, errorThrown){
            console.error(textStatus, errorThrown);
        });
}