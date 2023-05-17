'use strict';



function trackLocation(){
    if (navigator.geolocation){
        // test to see if there is an active tracking and clear it if so
        // so that we don't have to multiple tracking going on
        try{
            navigator.geolocation.clearWatch(geoLocationID)
        }
        catch(e){
            console.log(e)
        }
        // clear any existing data from the map
        removeTracks()
        // tell the tracker what to do with the coordinates – showPosition 
        // what to do if there is an error – errorPosition
        // set some parameters – e.g how often to renew, what timeout to set
        const options = {
            enableHighAccuracy: true,
            maximumAge: 30000,
            timeout: 27000
        }
        geoLocationID = navigator.geolocation.watchPosition(showPosition, errorPosition, options) 
    }
    else{
        document.getElementById('showLocation').innerHTML = 
        "Geolocation is not supported by this browser."
    }
}


function showPosition(position){
    // add the new point into the array
    // the 'push' command
    trackLocationLayer.push(L.marker([position.coords.latitude,position.coords.longitude]).addTo(mymap));
    // activate proximity alert checking
    proximityAlert();
}


function errorPosition(){
    alert(error)
}


function removePositionPoints(){
    // disable the location tracking 
    // so that a new point won't be added while removing the old points
    navigator.geolocation.clearWatch(geoLocationID);
    removeTracks()
}


function removeTracks(){
    // loop through the trackLocationLayer array and remove any points
    for (let i=trackLocationLayer.length-1; i > -1;i--){
        mymap.removeLayer(trackLocationLayer[i])
        // totally remove the points from the array
        trackLocationLayer.pop();
    }
}