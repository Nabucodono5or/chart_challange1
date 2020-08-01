import { select, selectAll } from "d3-selection";
import { csv } from "d3-fetch";
import { extent } from "d3-array";
import { scaleLinear } from "d3-scale";
import { axisLeft, axisRight, axisBottom, axisTop } from "d3-axis";
import { line, curveNatural } from "d3-shape";
import { randomLogNormal } from "d3";

select("div.chart")
  .append("svg")
  .attr("class", "line-graph")
  .attr("height", "300px")
  .attr("width", "800px");

csv(
  require("./data/189386_422697_bundle_archive/Video_Games_Sales_as_at_22_Dec_2016.csv")
).then((data) => {
  lineChart(data);
});

function lineChart(incomingData) {
  let dadosMedidos = medindoVendasAnuais(incomingData);
  console.log(dadosMedidos);

  let minimoMaximoAnoDeLancamento = extent(dadosMedidos, (d) => {
    return d.ano;
  });

  let minimoMaximoDeVendas = extent(dadosMedidos, (d) => {
    return d.total;
  });

  let xScale = scaleLinear()
    .domain(minimoMaximoAnoDeLancamento)
    .range([90, 720]);
  let yScale = scaleLinear().domain(minimoMaximoDeVendas).range([280, 20]);
  let xAxis = axisBottom(xScale).tickSize(-280).tickPadding(10);
  let yAxis = axisLeft(yScale).tickSize(0);
  let globalSales = globalSalesLine(xScale, yScale);

  globalSales.curve(curveNatural);

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
    .data(dadosMedidos)
    .enter()
    .append("circle")
    .attr("class", "scatterplot")
    .attr("cx", (d) => {
      return xScale(d.ano);
    })
    .attr("cy", (d) => {
      return yScale(d.total);
    })
    .attr("r", 5)
    .attr("fill", "white");

  desenhandoLinha(dadosMedidos, globalSales);

  // criar os eventos

  select(".na-sales").on("click", (d) => {
    northAmericanSales(dadosMedidos, xScale, yScale);
  });

  select(".global-sales").on("click", (d) => {
    globalSalesData(dadosMedidos, xScale, yScale);
  });

  select(".eu-sales").on("click", (d) => {
    europeanSales(dadosMedidos, xScale, yScale);
  });
}

function globalSalesLine(xScale, yScale) {
  let globalSales = line()
    .x((d) => {
      return xScale(d.ano);
    })
    .y((d) => {
      return yScale(d.total);
    });

  return globalSales;
}

function naSalesLine(xScale, yScale) {
  let naSales = line()
    .x((d) => {
      return xScale(d.ano);
    })
    .y((d) => {
      return yScale(d.na);
    });

  return naSales;
}

function euSalesLine(xScale, yScale) {
  let euSales = line()
    .x((d) => {
      return xScale(d.ano);
    })
    .y((d) => {
      return yScale(d.eu);
    });

  return euSales;
}

function desenhandoLinha(dadosMedidos, sales) {
  select("svg.line-graph")
    .append("path")
    .attr("class", "line-globalsales")
    .attr("d", sales(dadosMedidos));
}

function alterandoLinha(dadosMedidos, sales) {
  select("path").transition().duration(1000).attr("d", sales(dadosMedidos));
}

function medindoVendasAnuais(data) {
  let dadosMedidos = [];
  data.forEach((element) => {
    let resultado;
    resultado = dadosMedidos.find((el) => {
      return el.ano == +element.Year_of_Release;
    });

    if (resultado) {
      resultado.total += +element.Global_Sales;
      resultado.na += +element.NA_Sales;
      resultado.eu += +element.EU_Sales;
    } else if (!isNaN(+element.Year_of_Release)) {
      resultado = {};
      resultado.total = +element.Global_Sales;
      resultado.ano = +element.Year_of_Release;
      resultado.na = +element.NA_Sales;
      resultado.eu = +element.EU_Sales;
      dadosMedidos.push(resultado);
    }
  });

  dadosMedidos = dadosMedidos.sort((a, b) => {
    return a.ano > b.ano;
  });
  return dadosMedidos;
}

function northAmericanSales(incomingData, xScale, yScale) {
  select("svg.line-graph")
    .selectAll("circle.scatterplot")
    .transition()
    .duration(1000)
    .attr("cy", (d) => {
      return yScale(d.na);
    });

  let naSales = naSalesLine(xScale, yScale);

  alterandoLinha(incomingData, naSales);
}

function globalSalesData(incomingData, xScale, yScale) {
  select("svg.line-graph")
    .selectAll("circle.scatterplot")
    .transition()
    .duration(1000)
    .attr("cy", (d) => {
      return yScale(d.total);
    });

  let globalSales = globalSalesLine(xScale, yScale);

  alterandoLinha(incomingData, globalSales);
}

function europeanSales(incomingData, xScale, yScale) {
  select("svg.line-graph")
    .selectAll("circle.scatterplot")
    .transition()
    .duration(1000)
    .attr("cy", (d) => {
      return yScale(d.eu);
    });

  let euSales = euSalesLine(xScale, yScale);

  alterandoLinha(incomingData, euSales);
}
