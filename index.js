import { select, selectAll } from "d3-selection";

select("div.chart")
  .append("svg")
  .attr("class", "line-graph")
  .attr("height", "300px")
  .attr("width", "800px");
