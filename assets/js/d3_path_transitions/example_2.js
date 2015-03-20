example_2 = function() {
    var transition = d3.select({}).transition()
        .duration(750)
        .ease("linear");

    // tick方法传入当前路径，预置的插值方式和坐标定点方式，原始的数据，还有是x轴元素
    chart("example_2",[0, n - 1], "linear", function tick(path, line, data, x) {
      transition = transition.each(function() {

        // push a new data point onto the back
        data.push(random());

        // redraw the line, and then slide it to the left
        // 路径转变器的初始状态为增加随机值后的路径，只是由于泳道的关系，没有显示出来而已；
        // 转变器的目标状态是左移一个x(-1)的长度
        path
            .attr("d", line)
            .attr("transform", null)
          .transition()
            .attr("transform", "translate(" + x(-1) + ")");

        // pop the old data point off the front
        // 最后才删除数据第一位，保持data的数据量
        data.shift();

      }).transition().each("start", function() { tick(path, line, data, x); });
    });
};

example_2();