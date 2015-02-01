//From http://bost.ocks.org/mike/constancy/
//Thanks for sharing
//加入了大量看源码时自己的理解
//初始化边宽、宽度、去除变宽后的高度
var margin = {top: 20, right: 40, bottom: 10, left: 40},
    width = 960,
    height = 250 - margin.top - margin.bottom;

//初始化格式化对象
var format = d3.format(".1%"),
    states,
    age;

//初始化x轴的刻度，线性刻度为0和宽度960
var x = d3.scale.linear()
    .range([0, width]);

//初始化y轴的刻度，离散刻度，定义了取整的刻度宽度与刻度间隔
var y = d3.scale.ordinal()
    .rangeRoundBands([0, height], .1);

//创建一个以x刻度，顶置；刻度线的长度为负数，即刻度线会向下延伸长度；以保留一位小数显示刻度值
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("top")
    .tickSize(-height - margin.bottom)
    .tickFormat(format);

//g元素有着svg中的分组概念，组内的元素可以统一进行变换等处理，而且g元素的子元素会继承其样式
//此处设定了svg的宽和高，而且svg中增加了一个分组，并使得分组往右往下移动
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("margin-left", -margin.left + "px")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//为以上的g元素内嵌x轴
svg.append("g")
    .attr("class", "x axis");

//内嵌y轴，其中y轴由一个line元素，起点为(0,0)，终点为(0,height)
svg.append("g")
    .attr("class", "y axis")
  .append("line")
    .attr("class", "domain")
    .attr("y2", height);

//下拉框，change事件触发执行change方法
var menu = d3.select("#menu select")
    .on("change", change);

//读取数据，data为对象数组
d3.csv("/assets/data/d3_object_constancy/states-age.csv", function(data) {
  states = data;
  //取出csv数据的第一行，去除头两个字段。
  //d3.keys()可以根据对象，抽取出键的部分组成数组
  //Array.prototype.filter()可以针对数组内每一个元素执行一次callback，返回符合条件的数组
  var ages = d3.keys(states[0]).filter(function(key) {
    return key != "State" && key != "Total";
  });
  //对对象数组进行遍历，再对每个对象中每个年龄层进行比例计算
  states.forEach(function(state) {
    ages.forEach(function(age) {
      state[age] = state[age] / state.Total;
    });
  });

  //设置下拉框的选项
  menu.selectAll("option")
      .data(ages)
    .enter().append("option")
      .text(function(d) { return d; });
  //设置默认值
  menu.property("value", "18 to 24 Years");
  //初始化图表
  redraw();
});

//太巨的一个技巧，通过按下alt键可以控制表格变化的间隔时长
var altKey;

d3.select(window)
    .on("keydown", function() { altKey = d3.event.altKey; })
    .on("keyup", function() { altKey = false; });

function change() {
  //清理超时ID
  clearTimeout(timeout);

  d3.transition()
      .duration(altKey ? 7500 : 750)
      .each(redraw);
}

//
function redraw() {
  //设定age1为选择的年龄段值
  //top是先根据指定的年龄段的占比由大到小排序states数组，再取出数组的前10项
  var age1 = menu.property("value"),
      top = states.sort(function(a, b) { return b[age1] - a[age1]; }).slice(0, 10);
  
  //更新y轴刻度的范围值
  //Array.prototyoe.map()对top数组按顺序执行callback，并把返回的结果组成数组返回
  y.domain(top.map(function(d) { return d.State; }));

  //如果原来存在bar类的分组，则取出bar类的选择器，并以__data__对象获取State属性作为key进行数据绑定；否则产生10个null元素
  var bar = svg.selectAll(".bar")
      .data(top, function(d) { return d.State; });
  
  //把enter选择器中的“元素”通过insert转化为真实存在的g元素，而且置于x轴与y轴前
  //这样渲染时，x轴的白线才能显示
  //由于y轴刻度采用离散刻度，而且范围值为10个州代码，关联的数值为：0到height，去除9个0.1倍步长后分成十份，取整
  //也就是初始时为下移到svg的高度外，并设为透明
  var barEnter = bar.enter().insert("g", ".axis")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(0," + (y(d.State) + height) + ")"; })
      .style("fill-opacity", 0);
  
  //增加液柱，其中当age为undefined时，不定义width；当age有值时，执行右侧方法，width根据线性函数设值
  //矩形高设为y轴刻度的rangeBand，即是步长－0.1倍步长
  //&&用法：若左侧为真，则返回右侧结果，若左侧为假，则返回左侧结果
  barEnter.append("rect")
      .attr("width", age && function(d) { return x(d[age]); })
      .attr("height", y.rangeBand());

  //增加液柱左侧的y轴刻度标签
  barEnter.append("text")
      .attr("class", "label")
      .attr("x", -3)
      .attr("y", y.rangeBand() / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .text(function(d) { return d.State; });

  //增加液柱尾端的百分比显示
  //也是先判断age是否被设定
  barEnter.append("text")
      .attr("class", "value")
      .attr("x", age && function(d) { return x(d[age]) - 3; })
      .attr("y", y.rangeBand() / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "end");

  //设定x轴刻度域，以最大的一个州数据，对应年龄段选项的百分比为域最大值，[0, max]
  //这个时候，对应的线性刻度会自动应用线性函数，x(max)为width，x(0)为0
  x.domain([0, top[0][age = age1]]);

  //d3.transition()可以从一个存在的选择器中获得一个变换，可以理解为驱动选择器进行变换
  var barUpdate = d3.transition(bar)
      .attr("transform", function(d) { return "translate(0," + (d.y0 = y(d.State)) + ")"; })
      .style("fill-opacity", 1);

  //统一对液柱长度进行修改
  barUpdate.select("rect")
      .attr("width", function(d) { return x(d[age]); });
  
  //统一对液柱尾端的百分比进行赋值
  barUpdate.select(".value")
      .attr("x", function(d) { return x(d[age]) - 3; })
      .text(function(d) { return format(d[age]); });

  //对exit()选择器中的元素进行退出
  var barExit = d3.transition(bar.exit())
      .attr("transform", function(d) { return "translate(0," + (d.y0 + height) + ")"; })
      .style("fill-opacity", 0)
      .remove();

  //以下两部分其实必要性不大，因为液柱附属于exit选择器中的g组，由上面的变换退出会使得液柱也会删除
  barExit.select("rect")
      .attr("width", function(d) { return x(d[age]); });

  barExit.select(".value")
      .attr("x", function(d) { return x(d[age]) - 3; })
      .text(function(d) { return format(d[age]); });

  //d3.transition()并不是单纯的返回参数中的选择器，更有用的一点是会产生一个变换的效果
  //在transition后续的处理中，都是对这次变换的一个描述。
  d3.transition(svg).select(".x.axis")
      .call(xAxis);
}

//设置一个超时操作ID，超过5秒自动选择特定项，并执行change
var timeout = setTimeout(function() {
  menu.property("value", "65 Years and Over").node().focus();
  change();
}, 5000);