// D3 Homework - Data Journalism and D3

// Section 1: set-up width, height, margins, canvas, text, etc...
// ======================================================

var width = 960;
var height = 500;
var margin = 20;
var labelArea = 110;
var tPadBot = 40;
var tPadLeft = 40;
var circRadius = 10;

// Canvas for the Graph
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "chart");

// Section 1.1: X Axis

// Section 1.1.1: SVG X Axis
svg.append("g").attr("class", "xText");

var xText = d3.select(".xText");

function xTextRefresh() {
  xText.attr(
    "transform",
    "translate(" +
      ((width - labelArea) / 2 + labelArea) +
      ", " +
      (height - margin - tPadBot) +
      ")"
  );
}
xTextRefresh();

// Section 1.1.2: Poverty
xText.append("text")
  .attr("y", -30)
  .attr("data-name", "poverty")
  .attr("data-axis", "x")
  .attr("class", "aText active x")
  .text("In Poverty (%)");

// Section 1.1.3: Age
xText.append("text")
  .attr("y", 0)
  .attr("data-name", "age")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Age (Median)");

// Section 1.1.4: Income
xText.append("text")
  .attr("y", 30)
  .attr("data-name", "income")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Household Income (Median)");

// Section 1.2: Y Axis

// Section 1.2.1: SVG Y Axis
svg.append("g").attr("class", "yText");

var yText = d3.select(".yText");

function yTextRefresh() {
  yText.attr(
    "transform",
    "translate(" + 
        (margin + tPadLeft) + 
        ", " + 
        ((height + labelArea) / 2 - labelArea) + 
        ")rotate(-90)"
  );
}
yTextRefresh();

// Section 1.2.2: Obesity
yText.append("text")
  .attr("y", -30)
  .attr("data-name", "obesity")
  .attr("data-axis", "y")
  .attr("class", "aText active y")
  .text("Obese (%)");

// Section 1.2.3: Smokes
yText.append("text")
  .attr("x", 0)
  .attr("data-name", "smokes")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Smokes (%)");

// Section 1.2.3: Lacks Healthcare
yText.append("text")
  .attr("y", 30)
  .attr("data-name", "healthcare")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Lacks Healthcare (%)");

// Section 2: Import our CSV file
// ======================================================

d3.csv("assets/data/data.csv").then(function(data) {
  visualization(data);
});

// Section 3: Visualization function
// ======================================================

function visualization(theData) {

  // Defaults values
  var dataX = "poverty";
  var dataY = "obesity";
  var xMin;
  var xMax;
  var yMin;
  var yMax;

  // For this function see: https://github.com/caged/d3-tip
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([40, -60])
    .html(function(d) {
      console.log(d)
      
      var theX;
      var theState = "<div>" + d.state + "</div>";
      var theY = "<div>" + dataY + ": " + d[dataY] + "%</div>";
      
      if (dataX === "poverty") {
        theX = "<div>" + dataX + ": " + d[dataX] + "%</div>";
      }
      else {
        theX = "<div>" + dataX + ": " + parseFloat(d[dataX]).toLocaleString("en") +  "</div>";
      }
      return theState + theX + theY;
    });
  svg.call(toolTip);

  function xMinMax() {
    xMin = d3.min(theData, function(d) {
      return parseFloat(d[dataX]) * 0.95;
    });
    xMax = d3.max(theData, function(d) {
      return parseFloat(d[dataX]) * 1.05;
    });
  }

  function yMinMax() {
    yMin = d3.min(theData, function(d) {
      return parseFloat(d[dataY]) * 0.95;
    });
    yMax = d3.max(theData, function(d) {
      return parseFloat(d[dataY]) * 1.15;
    });
  }

  function labelChange(axis, clickedText) {
    d3.selectAll(".aText")
      .filter("." + axis)
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);
    clickedText.classed("inactive", false)
    .classed("active", true);
  }

  xMinMax();
  yMinMax();

  var xScale = d3.scaleLinear()
    .domain([xMin, xMax])
    .range([margin + labelArea, width - margin]);

  var yScale = d3.scaleLinear()
    .domain([yMin, yMax])
    .range([height - margin - labelArea, margin]);

  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);

  function tickCount() {
    if (width <= 500) {
      xAxis.ticks(5);
      yAxis.ticks(5);
    }
    else {
      xAxis.ticks(10);
      yAxis.ticks(10);
    }
  }
  tickCount();

  svg.append("g")
    .call(xAxis)
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + (height - margin - labelArea) + ")");

  svg.append("g")
    .call(yAxis)
    .attr("class", "yAxis")
    .attr("transform", "translate(" + (margin + labelArea) + ", 0)");

  var theCircles = svg.selectAll("g theCircles").data(theData).enter();

  theCircles.append("circle")
    .attr("cx", function(d) {
      return xScale(d[dataX]);
    })
    .attr("cy", function(d) {
      return yScale(d[dataY]);
    })
    .attr("r", circRadius)
    .attr("class", function(d) {
      return "stateCircle " + d.abbr;
    })
    .on("mouseover", function(d) {
      toolTip.show(d, this);
      d3.select(this).style("stroke", "red");
    })
    .on("mouseout", function(d) {
      toolTip.hide(d);
      d3.select(this).style("stroke", "white");
    });

  theCircles.append("text")
    .text(function(d) {
      return d.abbr;
    })
    .attr("dx", function(d) {
      return xScale(d[dataX]);
    })
    .attr("dy", function(d) {
      return yScale(d[dataY]) + circRadius / 2.5;
    })
    .attr("font-size", circRadius)
    .attr("class", "stateText")
    .on("mouseover", function(d) {
      toolTip.show(d);
      d3.select("." + d.abbr).style("stroke", "red");
    })
    .on("mouseout", function(d) {
      toolTip.hide(d);
      d3.select("." + d.abbr).style("stroke", "white");
    });

  d3.selectAll(".aText").on("click", function() {
    var self = d3.select(this);

    if (self.classed("inactive")) {
      var axis = self.attr("data-axis");
      var name = self.attr("data-name");

      if (axis === "x") {
        dataX = name;
        xMinMax();

        xScale.domain([xMin, xMax]);

        svg.select(".xAxis").transition().duration(300).call(xAxis);

        d3.selectAll("circle").each(function() {
            d3.select(this)
            .transition()
            .attr("cx", function(d) {
              return xScale(d[dataX]);
            })
            .duration(300);
        });

        d3.selectAll(".stateText").each(function() {
            d3.select(this)
            .transition()
            .attr("dx", function(d) {
              return xScale(d[dataX]);
            })
            .duration(300);
        });

        labelChange(axis, self);
      }
      else {
        dataY = name;

        yMinMax();

        yScale.domain([yMin, yMax]);

        svg.select(".yAxis").transition().duration(300).call(yAxis);

        d3.selectAll("circle").each(function() {
            d3.select(this)
            .transition()
            .attr("cy", function(d) {
              return yScale(d[dataY]);
            })
            .duration(300);
        });

        d3.selectAll(".stateText").each(function() {
            d3.select(this)
            .transition()
            .attr("dy", function(d) {
              return yScale(d[dataY]) + circRadius / 3;
            })
            .duration(300);
        });

        labelChange(axis, self);
      }
    }
  });
}