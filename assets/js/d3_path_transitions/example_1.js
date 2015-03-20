// example的方法都是用于进行格式更新
function example_1() {
    // 定义转变器执行时长，设定调节方式为线性调节
    // select时使用{}作为参数，返回一个独立非绑定元素的转变器
    var transition = d3.select({}).transition()
        .duration(750)
        .ease("linear");

    // 设定x轴定义域为[0, n-1]，更新路径的方式为线性变更，更新方法为传入当前路径、预置的路径定点及插值方式、原始数据
    chart("example_1", [0, n - 1], "linear", function tick(path, line, data) {
        // 当第一个参数type没有指定，对转变器中每个元素都执行更新数据
        // 指定的话，可以支持三种事件start、end和interrupt三种事件
        transition = transition.each(function() {

            // push a new data point onto the back
            // 往队列中塞进一个随机数
            data.push(random());

            // pop the old data point off the front
            // 从队列中释放一个值
            data.shift();

            // transition the line
            // 在触发路径变换时，曾经datum过的data的值已经进行了更新，这时变换则是从old_data（初始状态）到new_data（目标状态）的转变
            path.transition().attr("d", line);

        // 在每一次变换触发start事件时，调用自身，形成不间断的更新
      }).transition().each("start", function() { tick(path, line, data); });
    });

}

example_1();