example_3 = function() {
    var transition = d3.select({}).transition()
        .duration(750)
        .ease("linear");

    // 配置x轴的定义域为[1, n-2]，首先限制x轴上只显示n-2个刻度，而原始的data实际上是有n个值的。
    // 1可不可以变成0？
    // n-2与n-1的区别在于当新增一个点时，由于使用basis样条插值器，点n-2与点n-1之间的连线会因为新增的点改变点n-1的切线，而改变。因此，要限制点n-1在泳道外
    chart("example_3", [1, n - 2], "basis", function tick(path, line, data, x) {
        transition = transition.each(function() {

            // push a new data point onto the back
            data.push(random());

            // redraw the line, and then slide it to the left, and repeat indefinitely
            // 这里选择移动x(0)，首先是因为x轴是线性刻度，在x(1)为0的情况下，x(0)必定为负数，所以实际上是向左移动|x(0)|
            path
                .attr("d", line)
                .attr("transform", null)
              .transition()
                .attr("transform", "translate(" + x(0) + ")");

            // pop the old data point off the front
            data.shift();

        }).transition().each("start", function() { tick(path, line, data, x); });
    });
};
example_3();