'use strict';


// condition assessment menus functions
// user is given their ranking based on number of condition reports created (in comparison to all other users) 
function userRanking(){
    // AJAX call to get the user ranking
    let user_ranking;
    let baseComputerAddress = document.location.origin;
    let dataAddress= "/api/userRanking/"+ userID;
    let layerURL = baseComputerAddress + dataAddress; 
    $.ajax({
        url: layerURL,  
        crossDomain: true, 
        // make the Ajax call synchronous and wait for the response before continuing execution
        async: false,
        success: function(result){
            user_ranking = result.rank;
        },
        error: function(jqXHR, textStatus, errorThrown) {
        console.log("Error getting userID: " + textStatus + ", " + errorThrown);
        }
    });  
    alert("Your ranking based on number of condition reports created "+
        " (in comparison to all other users) : "+ user_ranking)

}

// map layer showing the 5 assets closest to the user’s current location, added by any user.
function addLayerAsset(){
    load5ClosestAssets();
}

// remove the 5 cloest assets layer
function removeLayerAsset(){
    mymap.removeLayer(assetPointsLayer);
    loadConditionAssetPoints(userID);
}

// map showing the last 5 reports created by the specific user
function addLayerReport(){
    loadLastReports(userID);
}

// remove the layer of assets that have the last 5 reports
function removeLayerReport(){
    mymap.removeLayer(assetPointsLayer);
    loadConditionAssetPoints(userID);
}

// map layer that shows the user’s assets that the user hasn't rated in the last 3 days
function addLayerRated(){
    loadAssetWithMissingReport(userID);
}

// remove the layer of assets that the user hasn't rated in the last 3 days
function removeLayerRated(){
    mymap.removeLayer(assetPointsLayer);
    loadConditionAssetPoints(userID);
}




// asset location menus functions
function help(){
    // redirect user to userGuide.html page
    window.location.href = "userGuide.html";
}

// a list of all the assets that have at least one report in the best condition
function assetsInBestCondition(){
    let dataAddress = "/api/assetsInGreatCondition";
    let baseComputerAddress = document.location.origin;
    let serviceURL = baseComputerAddress + dataAddress;
    // make the AJAX call to endpoint and get the asset name list
    let tableHTML;
    $.ajax({
        url: serviceURL,
        type: "GET",
        dataType: "json",
        // make the Ajax call synchronous and wait for the response before continuing execution
        async: false,
        success: function(result) {
            tableHTML = "<table id='data' class='display' style='width:100%'>";
            tableHTML += "<thead><tr><td><h6>Asset ID</h6></td><td><h6>Asset Name</h6></td><td><h6>Installation Date</h6></td><td><h6>Latitude</h6></td><td><h6>Longitude</h6></td><th><button onclick='closeTable()' class='close-button'>X</button></th></tr></thead><tbody>";
            for (let i = 0; i < result.length; i++) {
                tableHTML += "<tr>";
                tableHTML += "<td>" + result[i].id + "</td>";
                tableHTML += "<td>" + result[i].asset_name + "</td>";
                tableHTML += "<td>" + result[i].installation_date + "</td>";
                tableHTML += "<td>" + result[i].location.coordinates[1] + "</td>";
                tableHTML += "<td>" + result[i].location.coordinates[0] + "</td>";
                tableHTML += "<td></td>";
                tableHTML += "</tr>";
            }
            tableHTML += "</tbody></table>";
            document.getElementById("tablediv").innerHTML = tableHTML;
            createDataTable();
        }
    });
}

// create the table for the above asset list
function createDataTable() {
    $("#data").DataTable({
      paging: true,
      pageLength: 12,
      lengthChange: true,
      lengthMenu: [5, 8, 10],
      scrollX: "100%",
      dom: "Bfrtip",
      buttons: ["copyHtml5", "excelHtml5", "csvHtml5", "pdfHtml5"],
      pageResize: true,
    });
  }

// close the table by clicking X button on the table
function closeTable() {
  document.getElementById("tablediv").innerHTML = "";
}

// bar graph showing daily reporting rates for the past week 
// (how many reports have been submitted and how many reports have been submitted with the worst condition values) 
function reportingRatesGraph(){
    loadGraph();
}



