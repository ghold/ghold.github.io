---
layout: default
title: Three Little Circles教程缺陷
category:  STUDY
tags: D3 NODEJS
---
>笔者最近对开源数据图形化库d3产生兴趣，开始学习相关教程。
>教程来自[Three Little Circles](http://bost.ocks.org/mike/circles/)，感谢

就原因来说，可能是由于[新版本的d3](https://github.com/mbostock/d3)与[教程](http://bost.ocks.org/mike/circles)不同步导致的。首先我们来看结果，按照教程出来的结果是：

<svg id="test" width="720" height="120"><circle cx="40" cy="60" r="10"></circle><circle cx="80" cy="60" r="10"></circle><circle cx="120" cy="60" r="10"></circle><circle cy="60" cx="330" r="17.11724276862369"></circle></svg>

而我们教程的目标却是：

<svg id="test" width="720" height="120"><circle cx="30" cy="60" r="5.656854249492381"></circle><circle cx="130" cy="60" r="7.54983443527075"></circle><circle cx="230" cy="60" r="10.583005244258363"></circle><circle cy="60" cx="330" r="15.459624833740307"></circle></svg>

很明显，前三个圆出问题了。原因是教程中的[circleEnter](http://bost.ocks.org/mike/circles/#entering)对象并没有包含原始的三个circle。我在这并不分析为什么没有包含，想借此介绍发现问题的经验。

<!-- excerpt -->

开始时笔者并没有使用任何debug的工具，笨笨地使用console.log打印对象，验证问题。开发工具是Sublime Text 2，就这样一行一行的敲。刚开始发现问题的时候，我通过

`console.log(circleEnter)`

打印出circleEnter对象后发现对象内有个数组前3个为null，想必问题出在这，导致后续的回调函数无法应用到前三个圆上。

但是知识浅薄的笔者并没有发现问题的关键，进而把问题认定为*d3不兼容nodejs*。接下来为了验证这点，笔者直接在主页把这段javascript写上：

```
<script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
<script>
    var svg = d3.select("svg");
    var circle = svg.selectAll("circle")
        .data([32, 57, 112, 293]);
    var circleEnter = circle.enter().append("circle");
    circleEnter.attr("cy", 60);
    circleEnter.attr("cx", function(d, i) { return i * 100 + 30; });
    circleEnter.attr("r", function(d) { return Math.sqrt(d); });
<script>
```

结果并不如笔者所愿，还是错误的结果，那么认定被攻破。下一个当然就是怀疑这个代码有问题了。

自以为是的笔者打算看看源代码，可惜d3的作者比笔者强太多了，笔者很快就放弃了。终于想到求助debug工具（回想起来都觉得笨死了）。

很快在谷歌上找到各种工具，我想优先试试Sublime Text 2上的插件NodejsDebug。两个字：难用。使用快捷键后就保存了一下文档就没反应了。不过在介绍NodejsDebug的教程上都提到了需要预安装nodejs的扩展包[node-inspector](https://github.com/node-inspector/node-inspector)。

根据Github的使用介绍，发现那个NodejsDebug完全就是在Sublime Text 2上加个键，接着就是node-inspector的事了。要运行node-inspector进行nodejs脚本调试，依照以下步骤：

 1. 把Chrome设成默认浏览器
 2. 保存nodejs脚本`<script.js>`
 3. 打开shell（或cmd），到脚本目录
 4. 执行`node-debug <script.js>`

就这样，nodejs会启动一个debug服务器，并使用Chrome开发工具进行断点、对象查看等debug功能。

使用以上功能，笔者很快就定位到问题所在。当执行完

`var circleEnter = ircle.enter().append("circle");`

发现circleEnter对象如开始时描述一样，有个数据的前三个为null；而circle对象则在原来基础上增加了第四个圆，且前三个都保留着。从而，教程是有问题的，正确的代码应该是：

```
<script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
<script>
    var svg = d3.select("svg");
    var circle = svg.selectAll("circle")
        .data([32, 57, 112, 293]);
    var circleEnter = circle.enter().append("circle");
    circle.attr("cy", 60);
    circle.attr("cx", function(d, i) { return i * 100 + 30; });
    circle.attr("r", function(d) { return Math.sqrt(d); });
<script>
```

详细代码：[github.com/ghold](https://github.com/ghold/D3Study/blob/master/lessons/2/requestHandlers.js)

> Written with [StackEdit](https://stackedit.io/).