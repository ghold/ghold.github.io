---
layout: layout_for_d3
title: D3路径动画
category: STUDY
tags: D3
---

>转自[Path Transitions](http://bost.ocks.org/mike/path/)，感谢



当我们要实现一个以时间划分的实时演变动画，我们经常会使用时间标记x轴：随着时间演进，新的数据会从右侧进入，老的数据会从左侧退出。如果我们直接使用D3内置的路径插值器，我们可能会看到一个奇怪的抖动动画：

<!-- excerpt -->

<link rel="stylesheet" href="/assets/css/d3_path_transitions/default.css">
<script type="text/javascript" src="/assets/js/d3_path_transitions/share.js" ></script>

<link href="/assets/css/metro.min.css" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/default.css">
<link href="/assets/css/petty_colors.css" rel="stylesheet">

<example_1></example_1>
<script type="text/javascript" src="/assets/js/d3_path_transitions/example_1.js" ></script>

实际上，在对两条路径进行插值时，有多种有效的理解。一种理解是在不变x轴点上修改y的值；另一种是理解是随时间的变化可以呈现一个以x轴为引导的推拉窗效果。第二种是我们想要的方式，但我们怎样告诉D3在x轴上插值而不是在y轴上插值呢？

首先，我们需要知道SVG上怎样展示路径。考虑下面这个画了个带三点的折线路径元素：

```html
<path d="M0,0L1,6L2,4"></path>
```

路径的数据会存入d这个属性中，由点移动（M）和线连接（L）组成。如上面的路径描述的是从(0, 0)坐标开始，画一条直线到(1, 6)，再从(1, 6)画一条直线到(2, 4)。这些坐标点都称为控制点。现在我们打算更新为以下的路径：

```html
<path d="M0,6L1,4L2,5"></path>
```

旧的路径有3个控制点，新的也有3个，所以最简单的插值法是每个对应的控制点各自进行插值。

* (0, 0) ↦ (0, 6)
* (1, 6) ↦ (1, 4)
* (2, 4) ↦ (2, 5)

因为只有坐标y的值变化了，这个插值的效果会是一个垂直的抖动。当你告诉D3去转换这两条路径，D3会找到内嵌在path元素中的数字，并且按顺序配对，进而进行插值操作。这样，D3将会在三个控制点——六个数字上进行插值，最后的结果跟开始那个图表是一样的摆动。

为了消除摆动，得通过对变换进行插值的方式，而不是通过对路径进行插值的方式。我们换种思路，假设我们的数据已经是固定的了，我们只是一直在展示这个表格的不同部分。配置刷动的速率与新数据到达的速率一样，我们就可以无缝地展示一个实时数据：

<example_2></example_2>
<script type="text/javascript" src="/assets/js/d3_path_transitions/example_2.js" ></script>


当接收到一个新数据，我们会立即重新画这条线，并且去除先前的所有变换。这时，新数据会隐藏在图表的右侧。接着，我们左移这条线，使得看上去像是滑动的。

尽管概念上很简单，但是这个方法有需要注意的地方：

首先，我们需要使用线性调节的方式，这样持续变换的速度才能维持不变。如果使用默认三次方的速度调节，那么转变速度会振荡，线条也会不停摆动。
其次，由于进入的数据会先画在图表右侧外，要实现的话，需要设置显示的泳道。譬如：

```html
<defs>
    <clipPath id="clip">
        <rect width="950" height="90"></rect>
    </clipPath>
</defs>
```

最后，如果我们使用的是样条插值器，那么会发现新增的数据点会改变前一点的切线和整个线段的轮廓。为了避免关键点改变时产生的额外抖动，需要进一步限制可视范围，隐藏额外的控制点。

<example_3></example_3>
<script type="text/javascript" src="/assets/js/d3_path_transitions/example_3.js" ></script>

以下例子将结合内建的坐标轴模块和时间刻度模块，展示最近三分钟内阅读这篇文章的滚屏活动情况。
<example_4></example_4>

<script type="text/javascript" src="/assets/js/d3_path_transitions/example_4.js" ></script>

> Written with [StackEdit](https://stackedit.io/).
