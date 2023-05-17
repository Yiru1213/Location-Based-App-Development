'use strict';

// show the last 5 reports created by the specific user
function loadLastReports(userID){
    // remove the deafult asset points layer
    if (assetPointsLayer) {
        mymap.removeLayer(assetPointsLayer);
        assetPointsLayer = null;
    }
    let baseComputerAddress = document.location.origin;
    let dataAddress= "/api/lastFiveConditionReports/"+ userID;
    let layerURL = baseComputerAddress + dataAddress; 
    // ajax call to get the closest asset data
    $.ajax({
            url: layerURL,  
            crossDomain: true, 
    }).done(function(result){
        // load the geoJSON layer
        assetPointsLayer = L.geoJSON(result,{
            // use point to layer to create the points
            pointToLayer: function(feature, latlng){
                // get the required values
                let asset_name = feature.properties.asset_name;
                let latest_condition = feature.properties.condition_description;
                // define a popup
                let popup = "<DIV id='popup'>"+ "Asset Name: "+"<b>"+ asset_name + "</b><br>";
                if (latest_condition == 'Unknown') {
                    popup = popup + "Latest Condition: "+"<b>no condition captured</b><br>";
                }
                else {
                    popup = popup + "Latest Condition: "+"<b>"+ latest_condition + "</b><br>";
                }
                popup = popup + "<p></p>"+ "<b>You can't provide a condition report for these assets.</b></br>"+"</DIV>";
                // get the marker color
                let color = getMarkerColor(feature.properties.condition_description); 
                let markerColor = L.AwesomeMarkers.icon({
                        icon:'play',
                        markerColor:color});
                // create asset markers
                let marker = L.marker(latlng, {icon:markerColor});
                // store the marker by ID
                markerById[feature.properties.asset_id] = marker; 
                marker.bindPopup(popup);
                // add event listener to show the popup when the marker is clicked
                marker.on('click', function() {
                    marker.openPopup();
                });
                return marker;
            },  // end of point to layer
        }).addTo(mymap);
        }).fail(function(jqXHR, textStatus, errorThrown){
            console.error(textStatus, errorThrown);
    });
}