---
layout: default
title: 在nodejs上用d3
category:  STUDY
tags: D3 NODEJS
---

>笔者最近对开源数据图形化库d3产生兴趣，开始学习相关教程。

nodejs拥有异步I/O、事件驱动等优点。不过笔者对以上两个特点理解得不太深入，喜欢使用的原因是看到可以把javascript搬到后台去，而且使用的是谷歌V8，如此高大上怎么应该试一下。

今天的话题是如何把d3搬到nodejs上，进而把牛X的数据图形化库应用在后台，动态生成静态页面。其实呢，nodejs与javascript的库兼容性都是很好的。基本思想是，在node内部模拟一个dom对象，d3对这个dom对象处理完后必会对这个dom对象做出修改，最后node输出这个静态dom对象到浏览器即可。

<!-- excerpt -->

预置的配置是nodejs与一个简单的server框架，建议参考：[node入门](http://www.nodebeginner.org/index-zh-cn.html)，很详细地教大家如何建立一个简单的扩展性强的server。

接下来是安装d3，有npm的帮助，也是很容易：

`npm install d3`

由于是编译安装，所以安装过程中可能会有各种问题，如找不到python、编译C用的编译器找不到等等。（笔者屌丝，买不起mac，所以只能在Windows下开发）建议1.安装[python 2.7](https://www.python.org/downloads/)并配置PYTHON_HOME为python安装目录；2.安装[Microsoft Visual Studio 2012 Express](http://www.microsoft.com/zh-cn/download/details.aspx?id=34673)并在命令行执行：

`npm config set msvs_version 2012 --global`

在安装过程中，我们可以发现d3需要依赖一个名为jsdom的库。这个就是我们在node内部模拟dom对象的关键库。jsdom可以把html文本转换为dom对象，使得d3可以在node内部随意使用自己的api处理这个dom对象。jsdom的用法也很简单：

```
var jsdom = require('jsdom')
var index = fs.readFileSync('./lessons/1/template/index.html', 'utf-8');
jsdom.env({
    features : { QuerySelector : true }
	, html : index
	, done : function(errors, window) {
	    var body = window.document.querySelector('body')
		//to do
	}
})
```

接着就可以使用d3随意处理body对象，处理完毕后通过：

`var svgsrc = window.document.innerHTML`

取出处理结果，利用server框架输出到浏览器即可。

详细代码：[github.com/ghold](https://github.com/ghold/D3Study/blob/master/lessons/1/requestHandlers.js)




> Written with [StackEdit](https://stackedit.io/).