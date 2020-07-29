import { select, selectAll } from "d3-selection";
import { csv } from "d3-fetch";
import { extent } from "d3-array";
import { scaleLinear } from "d3-scale";
import { axisLeft, axisRight, axisBottom, axisTop } from "d3-axis";

select("div.chart")
  .append("svg")
  .attr("class", "line-graph")
  .attr("height", "300px")
  .attr("width", "800px");

csv(
  require("./data/189386_422697_bundle_archive/Video_Games_Sales_as_at_22_Dec_2016.csv")
).then((data) => {
  console.log(data);
  lineChart(data);
});

function lineChart(incomingData) {
  let minimoMaximoAnoDeLancamento = extent(incomingData, (d) => {
    return +d.Year_of_Release;
  });

  let minimoMaximoDeVendas = extent(incomingData, (d) => {
    return +d.Global_Sales;
  });

  let xScale = scaleLinear()
    .domain(minimoMaximoAnoDeLancamento)
    .range([90, 720]);

  let yScale = scaleLinear().domain(minimoMaximoDeVendas).range([280, 20]);

  let xAxis = axisBottom(xScale).tickSize(-280).tickPadding(10);
  let yAxis = axisLeft(yScale).tickSize(0);

  select("svg.line-graph")
    .append("g")
    .attr("class", "line-group")
    .attr("transform", "translate(0, 280)")
    .call(xAxis)
    .select(".domain")
    .remove();

  select("svg.line-graph")
    .append("g")
    .attr("class", "line-group")
    .attr("transform", "translate(40, 0)")
    .call(yAxis)
    .select(".domain")
    .remove();

  select("svg.line-graph")
    .selectAll("circle")
    .data(incomingData)
    .enter()
    .append("circle")
    .attr("class", "scatterplot")
    .attr("cx", (d) => {
      if (isNaN(+d.Year_of_Release)) {
        return xScale(1980);
      }
      return xScale(+d.Year_of_Release);
    })
    .attr("cy", (d) => {
      return yScale(+d.Global_Sales);
    })
    .attr("r", 5)
    .attr("fill", "white");
}
