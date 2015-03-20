---
layout: default
title: D3转变器详解
category: STUDY
tags: D3
---

>转自[Working with Transitions](http://bost.ocks.org/mike/transition/)，感谢

D3使用selection.transition可以在改变DOM时简单实现动画的效果。举个简单的例子，实现一个改变页面字体颜色的代码为：

`d3.select("body").style("color", "red");`

如果加上变换及变化的时长，一个简单的字体变颜色的动画就有了（默认为黑色）：

`d3.select("body").transition().duration(2000).style("color", "red");`

以下开始了解转变的细节。

<!-- excerpt -->

---

###转变器是一种动画形式

转变器是一种只有起点与终点两个关键帧的限制型关键帧动画过程。起点关键帧描述的是当前DOM的状态，而终点关键帧则是我们提供的一系列变化后的属性、样式和特性。

在一些情况下，开始的关键帧状态并不是我们想要的情况。譬如`red`这个字符串会被解释为`rgb(255,0,0)`。又如，`rgba(255,0,0,0)`这个颜色，是一个显示为透明的红色。但如果使用RGB的内插器，则会认为是一个`rgb(255,0,0)`，一个标准的不透明红色。

这个时候，我们可以自定义起点关键帧的状态。方法一是在创建转变器前定义起点关键帧：

```
d3.select("body")
    .style("color", "green")
  .transition()
    .style("color", "red");
```

不过这种方法只是保持属性值是一致的，并没有解决属性值转换的问题。方法二是提供起点状态和终点状态，同时提供一个指定的内插器，保证转换也是一致的：

```
d3.select("body")
	.transition()
    .styleTween("color", function() { 
	    return d3.interpolate("green", "red"); 
	});
```

transition.styleTween可以自定义一个样式内插器，这个内插器会使用已知的CSS3样式转换语法。

---

###随时间进行插值

如果要实现一个圆滑的动画，D3需要知道如何使用插值的方式，从起点状态演变到对应的终点状态。d3.interpolate方法通过推断起点状态与终点状态中每个值对的类型，确定了一个合适的插值器。D3支持以下几种类型：

* 数字（numbers）
* 颜色（colors）
* 几何变换（geometric transforms）
* 内嵌数字的字符串（如"96px"）

字符串插值器会配对起点状态的字符串值和终点状态的字符串值，并分离出数字部分进行插值处理后，再拼凑到非数字部分上完成插值的重建。各种复杂的场景都可以应用，如路径数据`"M0,0L20,30"`、CSS的字体样式`"300 12px/100% Helvetica"`。

不过字符串插值器并不是万能的。如果起点状态的字符串值格式不能跟终点状态的对上，那么就不能分离出数字部分了。这个时候需要重新对状态进行采样或提供更多使两者融合的算法。譬如，生成弧时我们需要使用极坐标的插值器，这样就可以通过角度进行插值，而不是通过点的位置。

现在回到标题中“随时间“理解。实际上，当我们需要自定义插值器时，被定义的插值器要返回一个以时间t为参数，定义域为[0, 1]的子处理器。这样的一个插值器，当t为0时，返回的是起点状态的值；当t为1时，返回的是终点状态的值；当0<t<1时，返回一个混合值（其实我觉得只要任意定义域里的t，函数都有返回值应该就可以了）

```
function interpolateNumber(a, b) {
  return function(t) {
    return a + t * (b - a);
  };
}
```

有一点需要注意的是，当从0开始插值，或插值到0，会遇到一些很小的数，譬如0.0000001。官方教程中这里说最小值只能到0.000001，原因是0.0000001会被转换为`1e－7`，而CSS会解析为1。但我测试过，现在的CSS是可以使用`1e－8`甚至更小。

---

###有些情况是不能被插值的

在用选择器改变DOM时，是不能进行插值处理的，也就是说，只能使用转变器演进动画过程。譬如，我们不能对创建元素这个变化进行插值。更深的原因是，设计一个转变器的前提，对象元素必须要是存在的。这样，元素创建这个状态是不能成为起点状态。选择器的相关方法，如数据绑定（data、enter、exit），和元素创建（append、insert），只能通过选择器实现，不能使用转变器实现。

以下代码会经常用到

```
//绑定数据
var bar = svg.selectAll(".bar")
    .data(data, function(d) { return d.key; });
//
//给enter选择器的元素进行初始化
bar.enter().append("rect")
    .attr("class", "bar")
//  …
//
//对enter和update选择器的元素设计转变器
bar.transition()
//
//对exit选择器设计退出的转变器，最后要删除元素
bar.exit().transition()
//  …
    .remove();
```

为方便起见，针对以上规则有一些例外的情况。如上面代码exit的例子，可以使用transition.remove在转变结束时删除转变的元素。还有就是，transition.text可以在转变开始时设定元素的文本内容。在将来，还可能支持其他不可插值操作，如classed和html。

---

###转变器的生命周期

转变器比较棘手的部分是，它会随时间发生而不是马上完成。转变器并不是运行在一条简单的路线上，一旦页面进行加载，就会产生一系列复杂的反复回调。如果我们想在设计时忽略转变器运行过程的复杂性，我们必须理解转变器整个计算过程中的规则。

转变器有一个四阶段的生命周期：

1. 调度阶段
2. 开始阶段
3. 运行阶段
4. 结束阶段

转变器在selection.transition被调用时会进入调度阶段。我们会在这个阶段通过转变器的attr、style和其他转变器方法设置终点关键帧的状态。整个调度过程是发生在代码中，如作为点击某个按钮的响应等等，这意味着这个阶段是同步进行的。这种方式使得更容易调试，更容易根据全局变化的状态配置终点关键帧的状态。

在调度阶段，我们可以选择性配置一个延迟时间（delay），而我们的开始阶段正是根据我们配置的延迟时间开始的。当没有配置延迟时间时，开始阶段会以最快的方式进入开始阶段。一旦进入开始阶段，start事件会被触发，这时转变器会异步初始化它的子处理器（tween）。这些处理器会分别从DOM中收集起点的状态值和构建插值器。由于在转变器进入开始阶段前，是无法明确知道起点的状态值，因此定义子处理器的初始化工作是很必要的。还要注意的是，我们使用attrTween、styleTween和其他tween方法时，需要设计成在转变器进入开始阶段时可以异步计算的。

当进入运行阶段，转变器的子处理器会分别以t参数从0到1开始执行。延迟时间（delay）也会影响从调度阶段到运行阶段的时长，而执行时间（duration）的配置则会影响整个运行阶段的时长。利用这两个方法，可以简单地调节转变器的时间流，譬如我们可以实现缓进缓出的效果。所以，整个转变器的时长是延迟时间加上执行时间，一旦到时间就会结束，即进入结束阶段。

进入结束阶段，这意味着子处理器都执行了t=1的情况，并且会触发end事件。

---

###转变器是针对每个元素，并且是独占的。

每个元素的转变器都是独立运行的。当我们为一个选择器创建了一个转变器，那是我们为选择器中的每个元素创建了一系列的选择器，而不是为多个元素创建了一个混合转变器。不同的元素可以使用不同的延迟时间和执行时间，甚至可以使用不同的调节和不同的子处理器。另外，转变器中的事件也是分别分发给每个元素的。当某个元素接收到了一个结束事件，那么这个元素的转变会结束，但转变器中的其他元素可能还在运行。

对于任意一个元素，只能同时运行一个转变器。如果要在这个元素上执行一个新的转变器，那么会停止这个元素上正在运行的转变器。中断一个元素上的转变器运行，不会影响到其他元素，也就是说，多种转变器是可以同时运行在不同的元素上的。在一个转变器在运行同时，可以使用transition.transition安排多个其他的转变器准备执行。

对于每个元素，转变器队列是个先进先出的结构。当转变器进入调度阶段时，会得到一个自增的id。当元素上一个转变器开始执行，那么只有比这个转变器更新的转变器才能被执行。也就是说，在旧的转变器执行过程中，插入启动其他转变器都会马上取消所有旧队列中的所有转变器，建立新的队列，即使旧队列中的转变器还没进入开始阶段。这种方式消除主动取消转变器的必要。

类似于数据绑定中，数据会绑定到元素的`__data__`属性上，转变器也会绑定到元素的`__transition__`属性上。当转变器进入调度阶段，属性会被创建；当最后调度的转变器执行结束，这个属性就会被删除。在控制台上对这个属性上打上标记，可以有效调试哪个转变器安排在哪个元素。由于转变器是绑定到元素上的，我们可以重新选择元素，修改子处理器和时间流。这个普遍应用在组件驱动的转变器上，譬如坐标轴组件。




> Written with [StackEdit](https://stackedit.io/).