import { select, selectAll } from "d3-selection";
import { scaleOrdinal } from "d3-scale";
import { csv } from "d3-fetch";
import { extent } from "d3-array";
import { scaleLinear, scaleBand } from "d3-scale";
import { axisLeft, axisRight, axisBottom, axisTop } from "d3-axis";
import { line, curveNatural } from "d3-shape";
import { randomLogNormal, max } from "d3";

const widthChart = 800;
const heightChart = 300;
const widthSmallBlock = 250;
const heightSmallBlock = 250;
const margin = { top: 10, left: 30, right: 10, bottom: 40 };

select("div.chart")
  .append("svg")
  .attr("class", "line-graph")
  .attr("height", heightChart)
  .attr("width", widthChart);

select("div.chart-line-small")
  .append("svg")
  .attr("class", "line-graph-small")
  .attr("height", heightSmallBlock)
  .attr("width", widthSmallBlock);

select("div.char-histogram")
  .append("svg")
  .attr("class", "bar-graph")
  .attr("height", heightSmallBlock)
  .attr("width", widthSmallBlock);

select("div.chart-line-small-second")
  .append("svg")
  .attr("class", "line-graph-second")
  .attr("height", heightSmallBlock)
  .attr("width", widthSmallBlock);

csv(
  require("./data/189386_422697_bundle_archive/Video_Games_Sales_as_at_22_Dec_2016.csv")
).then((data) => {
  lineChart(data);
  litleLineChart(data);
  barChart(data);
  litleLineChartB(data);
});

function lineChart(incomingData) {
  let xValue = (d) => xScale(d.ano);
  let yValueTotal = (d) => yScale(d.total);
  let yValueEu = (d) => yScale(d.eu);
  let yValueNa = (d) => yScale(d.na);

  let dadosMedidos = medirVendasAnuais(incomingData);
  let minimoMaximoAnoDeLancamento = medirAnoDeLancamento(dadosMedidos);
  let minimoMaximoDeVendas = medirTotalDeVendas(dadosMedidos);
  let xScale = scaleLinear()
    .domain(minimoMaximoAnoDeLancamento)
    .range([90, 720]);
  let yScale = scaleLinear().domain(minimoMaximoDeVendas).range([280, 20]);
  let xAxis = axisBottom(xScale).tickSize(-280).tickPadding(10);
  let yAxis = axisLeft(yScale).tickSize(0);
  let globalSales = globalSalesLine(xValue, yValueTotal);

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
    .attr("cx", xValue)
    .attr("cy", yValueTotal)
    .attr("r", 3)
    .attr("fill", "white");

  desenhandoLinha(dadosMedidos, globalSales);

  // criar os eventos

  select(".na-sales").on("click", (d) => {
    northAmericanSales(dadosMedidos, xValue, yValueNa);
    destacandoButton(".na-sales", [".eu-sales", ".global-sales"]);
  });

  select(".global-sales").on("click", (d) => {
    globalSalesData(dadosMedidos, xValue, yValueTotal);
    destacandoButton(".global-sales", [".eu-sales", ".na-sales"]);
  });

  select(".eu-sales").on("click", (d) => {
    europeanSales(dadosMedidos, xValue, yValueEu);
    destacandoButton(".eu-sales", [".global-sales", ".na-sales"]);
  });
}

function medirVendasAnuais(data) {
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
    return a.ano - b.ano;
  });

  return dadosMedidos;
}

function medirAnoDeLancamento(dadosMedidos) {
  let minimoMaximoAnoDeLancamento = extent(dadosMedidos, (d) => {
    return d.ano;
  });

  return minimoMaximoAnoDeLancamento;
}

function medirTotalDeVendas(dadosMedidos) {
  let minimoMaximoDeVendas = extent(dadosMedidos, (d) => {
    return d.total;
  });

  return minimoMaximoDeVendas;
}

function desenhandoLinha(dadosMedidos, sales) {
  select("svg.line-graph")
    .append("path")
    .attr("class", "line-globalsales")
    .attr("d", sales(dadosMedidos));
  select(".global-sales").classed("selected", true);
}

function globalSalesData(incomingData, xValue, yValue) {
  select("svg.line-graph")
    .selectAll("circle.scatterplot")
    .transition()
    .duration(1000)
    .attr("cy", yValue);

  let globalSales = globalSalesLine(xValue, yValue);

  alterandoLinha(incomingData, globalSales);
}

function northAmericanSales(incomingData, xValue, yValue) {
  select("svg.line-graph")
    .selectAll("circle.scatterplot")
    .transition()
    .duration(1000)
    .attr("cy", yValue);

  let naSales = naSalesLine(xValue, yValue);

  alterandoLinha(incomingData, naSales);
}

function europeanSales(incomingData, xValue, yValue) {
  select("svg.line-graph")
    .selectAll("circle.scatterplot")
    .transition()
    .duration(1000)
    .attr("cy", yValue);

  let euSales = euSalesLine(xValue, yValue);

  alterandoLinha(incomingData, euSales);
}

function globalSalesLine(xValue, yValue) {
  let globalSales = line().x(xValue).y(yValue);

  return globalSales;
}

function naSalesLine(xValue, yValue) {
  let naSales = line().x(xValue).y(yValue);

  return naSales;
}

function euSalesLine(xValue, yValue) {
  let euSales = line().x(xValue).y(yValue);

  return euSales;
}

function alterandoLinha(dadosMedidos, sales) {
  select("path.line-globalsales")
    .transition()
    .duration(1000)
    .attr("d", sales(dadosMedidos));
}

function destacandoButton(alvo, anteriores) {
  select(alvo).classed("selected", true);
  anteriores.forEach((el) => {
    select(el).classed("selected", false);
  });
}

// ---------------------------------------------------------------------------//
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ---------------------- litle line chart ------------------------------------//

function litleLineChart(incomingData) {
  let valoresDoObjeto = [];
  let propriedadesDoObjeto = ["Global", "NA", "EU", "JP"];
  let dado = medirVendasDasPublicadoras("Capcom", incomingData);
  let xScale = scaleBand().domain(propriedadesDoObjeto).range([10, 200]);
  let yScale = scaleLinear().domain([0, 2000]).range([180, 10]);
  let xAxis = axisBottom(xScale).tickSize(-180);
  let yAxis = axisLeft(yScale).tickSize(0);
  let xValue = (d, i) => xScale(propriedadesDoObjeto[i]) + 65;
  let yValue = (d) => yScale(d);

  let everySales = line().x(xValue).y(yValue);

  select("svg.line-graph-small")
    .append("g")
    .attr("class", "line-group")
    .attr("transform", "translate(40, 180)")
    .call(xAxis)
    .select(".domain")
    .remove();

  select("svg.line-graph-small")
    .append("g")
    .attr("class", "line-group")
    .attr("transform", "translate(50, 0)")
    .call(yAxis)
    .select(".domain")
    .remove();

  for (let property in dado) {
    if (!isNaN(+dado[property])) {
      valoresDoObjeto.push(dado[property]);
    }
  }

  select("svg.line-graph-small")
    .selectAll("circle")
    .data(valoresDoObjeto)
    .enter()
    .append("circle")
    .attr("class", "scatterplot")
    .attr("cx", xValue)
    .attr("cy", yValue)
    .attr("r", 5)
    .attr("fill", "white");

  everySales.curve(curveNatural);

  select("svg.line-graph-small")
    .append("path")
    .attr("class", "line-every-sales")
    .attr("d", everySales(valoresDoObjeto));

  addEventToSelect(incomingData, yValue, everySales, dado);
}

function addEventToSelect(incomingData, yValue, everySales, dado) {
  let selectElement = document.querySelector(".publicadoras");

  selectElement.addEventListener("change", (event) => {
    let publicadora = event.target.value;
    let novoValoresDoObjeto = [];

    dado = medirVendasDasPublicadoras(publicadora, incomingData);

    for (let property in dado) {
      if (!isNaN(+dado[property])) {
        novoValoresDoObjeto.push(dado[property]);
      }
    }

    select("svg.line-graph-small")
      .selectAll("circle")
      .data(novoValoresDoObjeto)
      .transition()
      .duration(1000)
      .attr("cy", yValue)
      .attr("r", 5)
      .attr("fill", "white");

    select(".line-every-sales")
      .transition()
      .duration(1000)
      .attr("d", everySales(novoValoresDoObjeto));
  });
}

function medirVendasDasPublicadoras(publicadora, incomingData) {
  let resultado = {
    publicadora: publicadora,
    global: 0,
    eu: 0,
    na: 0,
    jp: 0,
  };

  incomingData.forEach((element) => {
    if (element.Publisher == publicadora) {
      resultado.global += Math.round(+element.Global_Sales);
      resultado.na += Math.round(+element.NA_Sales);
      resultado.eu += Math.round(+element.EU_Sales);
      resultado.jp += Math.round(+element.JP_Sales);
    }
  });

  return resultado;
}

// ---------------------------------------------------------------------------//
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ---------------------- histogram chart ------------------------------------//

function barChart(incomingData) {
  let valoresDoObjeto = [];
  let publicadoras = ["Ubisoft", "Nintendo", "Sega", "Capcom"];

  valoresDoObjeto = mapeandoPublicadoras(incomingData, publicadoras);

  let maximoGlobalSales = max(valoresDoObjeto, (d) => d.global);

  let xScale = scaleBand().domain(publicadoras).range([10, 200]);
  let yScale = scaleLinear()
    .domain([maximoGlobalSales, 0])
    .range([10, 180])
    .nice();

  let xAxis = axisBottom(xScale).tickSize(-widthSmallBlock).tickPadding(10);
  let yAxis = axisLeft(yScale).tickSize(-heightSmallBlock).tickPadding(8);
  let xValue = (d, i) => xScale.bandwidth() * i + 65;
  let yValue = (d) => yScale(d.global);

  let xAxisG = select("svg.bar-graph")
    .append("g")
    .attr("class", "bar-group")
    .attr("transform", "translate(40, 180)")
    .call(xAxis);

  xAxisG.select(".domain").remove();

  let yAxisG = select("svg.bar-graph")
    .append("g")
    .attr("class", "bar-group")
    .attr("transform", "translate(50, 0)")
    .call(yAxis);

  yAxisG.select(".domain").remove();

  xAxisG
    .selectAll(".tick")
    .selectAll("text")
    // .attr("transform", "rotate(45)")
    .attr("class", "label-bar");

  select("svg.bar-graph")
    .selectAll("rect")
    .data(valoresDoObjeto)
    .enter()
    .append("rect")
    .attr("x", xValue)
    .attr("y", (d) => 180 - yValue(d))
    .attr("width", 15)
    .attr("height", yValue)
    .attr("class", "rectangle-bar");
}

function mapeandoPublicadoras(incomingData, publicadoras) {
  let valoresDoObjeto = [];

  publicadoras.map((p) => {
    let dado = medirVendasDasPublicadoras(p, incomingData);
    valoresDoObjeto.push(dado);
  });

  return valoresDoObjeto;
}

// ---------------------------------------------------------------------------//
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ---------------------- line chart second chart ------------------------------------//

function litleLineChartB(incomingData) {
  let dado = medirMediaDasPublicadoras("Capcom", incomingData);

  let valoresDoObjeto = [];
  let propriedadesDoObjeto = ["Global", "NA", "EU", "JP"];
  let innerHeight = heightSmallBlock - margin.top - margin.bottom;
  let innerWidth = widthSmallBlock - margin.left - margin.right;

  let xScale = scaleBand().domain(propriedadesDoObjeto).range([0, innerWidth]);
  let yScale = scaleLinear().domain([0, 3]).range([innerHeight, 0]);

  let xAxis = axisBottom(xScale).tickSize(-innerWidth).tickPadding(10);
  let yAxis = axisLeft(yScale).ticks(8).tickSize(0);

  let xValue = (d, i) => xScale(propriedadesDoObjeto[i]) + margin.left - 3;
  let yValue = (d) => yScale(d);

  let everySales = line().x(xValue).y(yValue);

  const g = select("svg.line-graph-second")
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  g.append("g")
    .attr("class", "line-group-second")
    .attr("transform", `translate(${0}, ${innerHeight})`)
    .call(xAxis)
    .select(".domain")
    .remove();

  g.append("g")
    .attr("class", "line-group-second")
    .attr("transform", `translate(${0}, ${0})`)
    .call(yAxis)
    .select(".domain")
    .remove();

  valoresDoObjeto = criarArrayDasMedias(dado);

  g.selectAll("circle")
    .data(valoresDoObjeto)
    .enter()
    .append("circle")
    .attr("class", "scatterplot")
    .attr("cx", xValue)
    .attr("cy", yValue)
    .attr("r", 5)
    .attr("fill", "white");

  everySales.curve(curveNatural);

  g.append("path")
    .attr("class", "line-every-sales")
    .attr("d", everySales(valoresDoObjeto));

  let selectElement = document.querySelector(".publicadoras-2");

  selectElement.addEventListener("change", (event) => {
    let publicadora = event.target.value;

    dado = medirMediaDasPublicadoras(publicadora, incomingData);
    valoresDoObjeto = criarArrayDasMedias(dado);

    console.log(valoresDoObjeto);
    g.selectAll("circle")
      .data(valoresDoObjeto)
      .transition()
      .duration(1000)
      .attr("cy", yValue);

    g.select(".line-every-sales")
      .transition()
      .duration(1000)
      .attr("d", everySales(valoresDoObjeto));
  });
}

function medirMediaDasPublicadoras(publicadora, incomingData) {
  let dado = medirVendasDasPublicadoras(publicadora, incomingData);
  let novoDado = {};
  novoDado.total = 0;
  novoDado.mediaGlobal = 0;
  novoDado.mediaNa = 0;
  novoDado.mediaEu = 0;
  novoDado.mediaJp = 0;

  incomingData.forEach((element) => {
    if (element.Publisher == publicadora) {
      novoDado.total += 1;
    }
  });

  novoDado.mediaGlobal = dado.global / novoDado.total;
  novoDado.mediaEu = dado.eu / novoDado.total;
  novoDado.mediaNa = dado.na / novoDado.total;
  novoDado.mediaJp = dado.jp / novoDado.total;

  return novoDado;
}

function criarArrayDasMedias(dado) {
  let valoresDoObjeto = [];
  for (let property in dado) {
    if (!isNaN(+dado[property]) && property != "total") {
      valoresDoObjeto.push(dado[property]);
    }
  }

  return valoresDoObjeto;
}
