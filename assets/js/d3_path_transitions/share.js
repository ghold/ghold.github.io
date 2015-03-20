// 这个代码负责图表的初始化定义等等
// random是一个均值为0，标准差为0.2的正太分布随机数
var n = 40,
    random = d3.random.normal(0, .2);

// chart方法整合了图表的各项基础属性，参数domain为x轴刻度范围，interpolation为插值器类型，tick为更新图表数值的方法
function chart(name, domain, interpolation, tick) {
    // 制造一个数量为40的随机数值map
  var data = d3.range(n).map(random);

  var margin = {top: 6, right: 0, bottom: 6, left: 40},
      width = 960 - margin.right,
      height = 120 - margin.top - margin.bottom;

    // 刻度为定义域domain，值域为[0, 宽度]的线性刻度
  var x = d3.scale.linear()
      .domain(domain)
      .range([0, width]);

    // y轴刻度为定义域[-1, 1]，值域为[高度, 0]的线性刻度
  var y = d3.scale.linear()
      .domain([-1, 1])
      .range([height, 0]);

    // 预置显示line的x和y插值模式
    // 对于任意(d, i)，有坐标(x(i), y(d))，而点之间就用插值器定义的方式进行补充
    // 根据这些关键点就可以画出这条路径
  var line = d3.svg.line()
      .interpolate(interpolation)
      .x(function(d, i) { return x(i); })
      .y(function(d, i) { return y(d); });

    // 配置显示的界面
  var svg = d3.select(name).append("p").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("margin-left", -margin.left + "px")
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // 定义泳道，保证图表不会超过这个范围
  svg.append("defs").append("clipPath")
      .attr("id", "clip")
    .append("rect")
      .attr("width", width)
      .attr("height", height);

    // 描绘y轴，并把y轴平均分成4段（5个点），靠左
    // call方法提供手动执行方法的接口，本例是创建y轴后进行分刻度和左对齐
  svg.append("g")
      .attr("class", "y axis")
      .call(d3.svg.axis().scale(y).ticks(5).orient("left"));

    // 在指定的泳道中增加一条路径，在datum绑定数据时，同时会调用line预置的x、y坐标算法和插值计算
  var path = svg.append("g")
      .attr("clip-path", "url(#clip)")
    .append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);
    
    // 内部调用更新图表的方法，使产生动态
    tick(path, line, data, x);
}