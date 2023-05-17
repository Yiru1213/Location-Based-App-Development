'use strict';


// proximity alert function
// define a global variable to store the closest asset id
let lastOpenAssetID = "";
function proximityAlert() {
    // define a variable to store the array of distances
    let distances = [];
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
            let geojsonData = result;
            navigator.geolocation.getCurrentPosition(position => {
                // get the current user location
                let currentLat = position.coords.latitude;
                let currentLng = position.coords.longitude;
                // loop through the asset points and calculate the distance from the user's current position
                geojsonData.features.forEach(feature => {
                    let assetLat = feature.geometry.coordinates[1];
                    let assetLng = feature.geometry.coordinates[0];
                    let distance = getDistanceFromPoint(currentLat, currentLng, assetLat, assetLng, 'K');
                    distances.push(distance);  
                });
                // find the index of the minimum distance (cloest asset)
                let minIndex = distances.indexOf(Math.min(...distances));
                // get the corresponding asset data from the GeoJSON data
                let cloestAsset = geojsonData.features[minIndex];
                // get the marker for the closest asset
                let closestMarker = markerById[cloestAsset.properties.asset_id];
                // open the popup for the closest asset that is less than 25m away from the user
                if (Math.min(...distances) <= 25){
                    // make the form popup only once if the user stays at one position
                    if (lastOpenAssetID != cloestAsset.properties.asset_id){
                        closestMarker.openPopup();  
                        lastOpenAssetID = cloestAsset.properties.asset_id;
                    }
                }
            }, error => {
                console.error(error);
            });
        }
    })   
}

function getDistanceFromPoint(currentLat, currentLng, assetLat, assetLng){
    //return the distance in metres
    let distan = calculateDistance(currentLat, currentLng, assetLat, assetLng,'K');
    return distan;
}

//haversine formula to calculate the distance
function calculateDistance(lat1, lon1, lat2, lon2, unit) {
    let radlat1 = Math.PI * lat1/180;
    let radlat2 = Math.PI * lat2/180;
    let radlon1 = Math.PI * lon1/180;
    let radlon2 = Math.PI * lon2/180;
    let theta = lon1-lon2;
    let radtheta = Math.PI * theta/180;
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + 
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    // convert the degree value returned by acos back to degrees from radians
    dist = dist * 180/Math.PI; 
    // ((subtended angle in degrees)/360) * 2 * pi * radius )
    // where radius of the earth is 3956 miles
    dist = dist * 60 * 1.1515 
    // convert miles to metres
    if (unit=="K") { dist = dist * 1.609344 * 1000 }
    // convert miles to nautical miles
    if (unit=="N") { dist = dist * 0.8684 * 1852 } 
    return dist;
}

 