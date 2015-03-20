// 初始化243个刻度，初始化data是带243个0值元素的map
var n = 243,
    duration = 750,
    now = new Date(Date.now() - duration),
    count = 0,
    data = d3.range(n).map(function() { return 0; });

var margin = {top: 6, right: 0, bottom: 20, left: 40},
    width = 960 - margin.right,
    height = 120 - margin.top - margin.bottom;

// x轴设置为时间刻度，定义域为[3分又1.5秒前, 1.5秒前]，值域分布在[0, 宽度]
var x = d3.time.scale()
    .domain([now - (n - 2) * duration, now - duration])
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

// 路径描绘使用样条插值器basis，控制点坐标分别是(x((i-243) * 0.75s), y(data[i]))
var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d, i) { return x(now - (n - 1 - i) * duration); })
    .y(function(d, i) { return y(d); });

var svg = d3.select("example_4").append("p").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("margin-left", -margin.left + "px")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);

var axis = svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(x.axis = d3.svg.axis().scale(x).orient("bottom"));

var path = svg.append("g")
    .attr("clip-path", "url(#clip)")
  .append("path")
    .datum(data)
    .attr("class", "line");

var transition = d3.select({}).transition()
    .duration(750)
    .ease("linear");

// 监听scroll事件，递增count
d3.select(window)
    .on("scroll", function() { ++count; });

tick = function() {
    transition = transition.each(function() {

        // update the domains
        // 要重新初始化now，获取当前时间，在call x.axis时可以使用最新的当前时间
        now = new Date();
        x.domain([now - (n - 2) * duration, now - duration]);
        // data不是map？可以用max取出最大值？
        y.domain([0, d3.max(data)]);

        // push the accumulated count onto the back, and reset the count
        // 设定上界为30次
        data.push(Math.min(30, count));
        // 数据存好后把计数置0
        count = 0;

        // redraw the line
        svg.select(".line")
            .attr("d", line)
            .attr("transform", null);

        // 再一次调用坐标轴时，会使用新的now重画一次坐标轴，实现左移的效果
        // slide the x-axis left
        axis.call(x.axis);

        // 同时进行数据曲线的左移
        // slide the line left
        path.transition()
            .attr("transform", "translate(" + x(now - (n - 1) * duration) + ")");

        // pop the old data point off the front
        data.shift();

        // 每逢进入开始阶段，都会马上执行一次tick，这样可以使用转变器覆盖原理，覆盖之前的转变器，实现一个流畅的动画
    }).transition().each("start", tick);
}

tick();