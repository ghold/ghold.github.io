---
layout: default
title: eric5自定义光标样式
category: TECHNIQUE
tags: ERIC
---

最近在使用eric-ide写Python，突然想把编辑器editor的界面样式改变一下。通过内置的配置项很容易就可以做出仿Linux的用户界面。连接是我使用的syntax_highlighting_Python3样式，直接导入可以看到效果。其余的配置需要自行修改editor style和user interface。

过程中有个比较郁闷的事情，就是光标的颜色问题。从白色背景换成黑色背景，我以为是只要改变编辑器的前景色为白色，光标会自动变更成白色，而实际上是不可以实现的。我通过google查询类似“eric cursor color”等等的关键字，均没有什么好结果。下面介绍一种简单修改eric5光标的方法：

进入Configure->Editor->Style，这里有个Caret选项，默认是关闭的。打开后的效果相当于网页中的hover效果，移上去时会加亮。我把caretline的背景改为黑色，前景改为白色，自定义光标的效果就出来了。


> Written with [StackEdit](https://stackedit.io/).