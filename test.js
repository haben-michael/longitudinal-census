var times = [2009, 2010, 2011];
var stats = [20,40,15];
var times = times.map(d => d3.timeParse("%Y")(String(d)));
var data = times.map((t,i) => ({time:t,stat:stats[i]}))


var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 20},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleTime()
    .rangeRound([0, width]);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var line = d3.line()
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d.stat); });

x.domain(d3.extent(times));
y.domain(d3.extent(stats));

g.append("g").attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

g.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .style("text-anchor", "end")
    .text("statistic");

 g.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);

// d3.tsv("data.tsv", function(d) {
//   d.date = parseTime(d.date);
//   d.close = +d.close;
//   return d;
// }, function(error, data) {
//   if (error) throw error;

//   x.domain(d3.extent(data, function(d) { return d.date; }));
//   y.domain(d3.extent(data, function(d) { return d.close; }));

//   g.append("g")
//       .attr("class", "axis axis--x")
//       .attr("transform", "translate(0," + height + ")")
//       .call(d3.axisBottom(x));

//   g.append("g")
//       .attr("class", "axis axis--y")
//       .call(d3.axisLeft(y))
//     .append("text")
//       .attr("fill", "#000")
//       .attr("transform", "rotate(-90)")
//       .attr("y", 6)
//       .attr("dy", "0.71em")
//       .style("text-anchor", "end")
//       .text("Price ($)");

//   g.append("path")
//       .datum(data)
//       .attr("class", "line")
//       .attr("d", line);
// });
