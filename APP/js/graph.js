'use strict';


function closeAssetData(){
    let mapCollapse = document.getElementById('mapWrapper');
    let bsMapCollapse = new bootstrap.Collapse(mapCollapse,{
        toggle: false, show:false
    });
    bsMapCollapse.show();

    let adwCollapse = document.getElementById('assetDataWrapperWrapper');
    let bsAdwCollapse = new bootstrap.Collapse(adwCollapse,{
        toggle: false, show:true
    });
    bsAdwCollapse.hide();
}


function loadGraph(){
    let mapCollapse = document.getElementById('mapWrapper');
    let bsMapCollapse = new bootstrap.Collapse(mapCollapse, {
        toggle: false, show:false
    });
    bsMapCollapse.hide();
    let adwCollapse = document.getElementById('assetDataWrapperWrapper');
    let bsAdwCollapse = new bootstrap.Collapse(adwCollapse, {
        toggle: false, show:true
    });
    bsAdwCollapse.show();

    // dynamically size the Graph DIV
    let widtha = document.getElementById("assetDataWrapper").offsetWidth;
    let heighta = document.getElementById("assetDataWrapper").offsetHeight;

    // Add the close button and an SVG element for the graph
    document.getElementById("assetDataWrapper").innerHTML=`<div class="h-75 w-75">
    <button type="button" class="btn-close float-end" aria-label="Close" onclick="closeAssetData()"></button>
    <svg fill="blue" width="`+widtha+`" height="`+heighta+`" id="svg1">
    </svg>
    </div>`

    // create an SVG container for the graph
    // g is a grouping element
    let marginTop = 30;
    let marginBottom = 60;
    let marginLeft = 50;
    let marginRight=20;
    let dataAddress = "/api/dailyParticipationRates";
    let baseComputerAddress = document.location.origin;
    let serviceURL = baseComputerAddress + dataAddress;
    let dataURL = serviceURL;


    // download the data and create the graph
    let svg = d3.select("#svg1");
    d3.json(dataURL).then(data => {
        data = data.features;
        // loop through the data and get the length of the x axis titles
        let xLen = 0;
        data.forEach(feature => {
            if (xLen < feature.properties.day.length) {
            xLen = feature.properties.day.length;
            }
        });

        // adjust the space available for the x-axis titles, depending on the length of the text
        if (xLen > 100) {
            marginBottom = Math.round(xLen/3,0);
        }
        else {
        marginBottom = xLen + 20;  // the 20 allows for the close button
        } //rough approximation for now
        // determine the maximum value for the y-axis scale
        let maxReports = d3.max(data, d => d.properties.reports_submitted + d.properties.reports_not_working);
        let margin = {top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft},
            width  = svg.attr("width") - marginLeft - marginRight,
            height = svg.attr("height") - marginTop - marginBottom,
            x      = d3.scaleBand().rangeRound([0, width]).padding(0.2),
            // define the y-axis scale
            y      = d3.scaleLinear().rangeRound([height, 0]).domain([0, maxReports]),
            g      = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        x.domain(data.map(d => d.properties.day));

        // adapted from: https://bl.ocks.org/mbostock/7555321 10th March 2021/
        // create the x-axis
        g.append("g")
          .attr("class", "axis axis-x")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x))
          .selectAll(".tick text")
          .call(wrap,x.bandwidth());
        // create the y-axis
        g.append("g")
          .attr("class", "axis axis-y")   
          .call(d3.axisLeft(y).ticks(10).tickSize(8));

        // create the bars for property reports_submitted
        g.selectAll(".barA")
        .data(data)
        .enter().append("rect")
        .attr("class", "barA")
        .attr("x", d => x(d.properties.day) - x.bandwidth() / 4)
        .attr("y", d => y(d.properties.reports_submitted))
        .attr("width", x.bandwidth() / 2)
        .attr("height", d => height - y(d.properties.reports_submitted))
        .style('fill', '#5BFA73')
        .append("text")
        .attr("x", d => x(d.properties.day))
        .attr("y", d => y(d.properties.reports_submitted) - 5)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .text("reports_submitted");
       // create the bars for property reports_not_working
    try {
        g.selectAll(".barB")
            .data(data)
            .enter().append("rect")
            .attr("class", "barB")
            .attr("x", d => x(d.properties.day) + x.bandwidth() / 4)
            .attr("y", d => y(d.properties.reports_not_working))
            .attr("width", x.bandwidth() / 2)
            .attr("height", d => height - y(d.properties.reports_not_working))
            .style('fill', '#FBAA62')
            .append("text")
            .attr("x", d => x(d.properties.day))
            .attr("y", d => y(d.properties.reports_not_working) - 5)
            .attr("dy", "0.35em")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .text("reports_not_working");
    } catch (err) {
        svg.append("text")
            .attr("y", 20)
            .attr("text-anchor", "left")
            .style("font-size", "10px")
            .style("font-weight", "bold")
            .text(`Couldn't create the bars for property reports_not_working: "${err}".`);
    }
    // create a legend
    let legend = g.append("g")
    .attr("transform", "translate(" + (width - 200) + ", 20)");
    // add a rectangle for reports_submitted
    legend.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", "#5BFA73");
    // add text for reports_submitted
    legend.append("text")
    .attr("x", 15)
    .attr("y", 10)
    .style("font-size", "16px")
    .style('fill','black')
    .text("Reports Submitted");

    // add a rectangle for reports_not_working
    legend.append("rect")
    .attr("x", 0)
    .attr("y", 20)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", "#FBAA62");
    // add text for reports_not_working
    legend.append("text")
    .attr("x", 15)
    .attr("y", 30)
    .style("font-size", "16px")
    .style('fill','black')
    .text("Reports Not Working");
}).catch(err => {
    svg.append("text")
        .attr("y", 20)
        .attr("text-anchor", "left")
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .text(`Couldn't open the data file: "${err}".`);
    })
} //end of loadGraph

// separate function to wrap the legend entries
// in particular if the place name where the earthquake happened is long
function wrap(text, width) {
  text.each(function() {
    let text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        let new_y = ++lineNumber * lineHeight + dy + "em";
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", new_y + "em");
      }
    }
  })
}