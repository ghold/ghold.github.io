//From http://bl.ocks.org/mbostock/3808218
//http://bl.ocks.org/mbostock/3808221
//http://bl.ocks.org/mbostock/3808234
//Thanks for sharing
var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

var width = 960,
    height = 200;

var svg1 = d3.select("example1").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(32," + (height / 2) + ")");

var svg2 = d3.select("example2").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(32," + (height / 2) + ")");

var svg3 = d3.select("example3").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(32," + (height / 2) + ")");


function update1(data) {

  // DATA JOIN
  // Join new data with old elements, if any.
  var text = svg1.selectAll("text")
      .data(data);

  // UPDATE
  // Update old elements as needed.
  text.attr("class", "update");

  // ENTER
  // Create new elements as needed.
  text.enter().append("text")
      .attr("class", "enter")
      .transition()
      .duration(3000)
      .attr("x", function(d, i) { return i * 32; })
      .attr("dy", ".35em");

  // ENTER + UPDATE
  // Appending to the enter selection expands the update selection to include
  // entering elements; so, operations on the update selection after appending to
  // the enter selection will apply to both entering and updating nodes.
  text.text(function(d) { return d; });

  // EXIT
  // Remove old elements as needed.
  text.exit().attr("class","exit")
    .transition()
    .duration(3000)
    .attr("y", 60)
    .style("fill-opacity", 1e-6).remove();
}

function update2(data) {

  // DATA JOIN
  // Join new data with old elements, if any.
  var text = svg2.selectAll("text")
      .data(data, function(d) { return d; });

  // UPDATE
  // Update old elements as needed.
  text.attr("class", "update");

  // ENTER
  // Create new elements as needed.
  text.enter().append("text")
      .attr("class", "enter")
      .transition()
      .duration(3000)
      .attr("dy", ".35em")
      .text(function(d) { return d; });

  // ENTER + UPDATE
  // Appending to the enter selection expands the update selection to include
  // entering elements; so, operations on the update selection after appending to
  // the enter selection will apply to both entering and updating nodes.
  text.attr("x", function(d, i) { return i * 32; })

  // EXIT
  // Remove old elements as needed.
  text.exit().attr("class", "exit")
    .transition()
    .duration(3000)
    .attr("y", 60)
    .style("fill-opacity", 1e-6)
    .remove();
}

function update3(data) {

  // DATA JOIN
  // Join new data with old elements, if any.
  var text = svg3.selectAll("text")
      .data(data, function(d) { return d; });

  // UPDATE
  // Update old elements as needed.
  text.attr("class", "update")
    .transition()
      .duration(3000)
      .attr("x", function(d, i) { return i * 32; });

  // ENTER
  // Create new elements as needed.
  text.enter().append("text")
      .attr("class", "enter")
      .attr("dy", ".35em")
      .attr("y", -60)
      .attr("x", function(d, i) { return i * 32; })
      .style("fill-opacity", 1e-6)
      .text(function(d) { return d; })
    .transition()
      .duration(3000)
      .attr("y", 0)
      .style("fill-opacity", 1);

  // EXIT
  // Remove old elements as needed.
  text.exit()
      .attr("class", "exit")
    .transition()
      .duration(3000)
      .attr("y", 60)
      .style("fill-opacity", 1e-6)
      .remove();
}

// Shuffles the input array.
function shuffle(array) {
  var m = array.length, t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m], array[m] = array[i], array[i] = t;
  }
  return array;
}

// The initial display.
update1(alphabet);
update2(alphabet);
update3(alphabet);

// Grab a random sample of letters from the alphabet, in alphabetical order.
setInterval(function() {
  var list = shuffle(alphabet)
      .slice(0, Math.floor(Math.random() * 26))
      .sort();
  update1(list);
  update2(list);
  update3(list);
}, 7500);