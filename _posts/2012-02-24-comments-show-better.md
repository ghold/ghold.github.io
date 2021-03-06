---
layout: default
title: 评论显示方式改进
category: TECHNIQUE
tags: JQUERY
---

之前的版本其实是当鼠标移进（mouseenter）文章时，评论瞬间转变为该文章的评论，自己感觉会略显突然，用户体验也不好。再低调点的做法，当然是稍加隐藏啦。

**目标**：点击滚动条的浮标时，弹出评论入口。

**难点**：点击浮标时同时要获取左侧文章的信息，以便确定入口的目的地。

<!-- excerpt -->

**分析**：

滚动条是使用JQuery-UI-slider生成的，内置功能强大。不过我暂时没发现解决难点的方法（如果有内置的方法请指导），所以自己折腾出另一种方法实现。

滚动条长度为100，步长为1；内容为文章列表，每篇文章长度不一，文章数量不定，但结构一致。我尝试把滚动条抽象为点集，内容列表抽象为线段集；明显无论点的位置如何，总会找到一条线段包含这个点（毕竟自己是学数学的，稍微找回点信心）。解决的方向有了，还需要一种实现的方式。

滚动条是垂直的，我选择了top这个属性确定点的位置和线段两端的位置。JQuery自带只有等于或不等于两种选择器，而现在需要的是点的位置在线段之间，也就是说JQuery自带的选择器中不能实现。纠结了一天后，我在网上发现了以下的方法，原文地址：[Extending jQuery’s selector capabilities](http://james.padolsey.com/javascript/extending-jquerys-selector-capabilities/)。作者通过扩展JQuery选择器的方式，实现了大于、小于的逻辑选择。

最终的实现代码如下：

``` javascript
$.extend($.expr[':'],{
  top: function(a,i,m) {
    if(( $(a).offset().top – 10) <= m[3]
            && ( $(a).next(a).offset().top – 10 ) > m[3] ){
            return $(a);
        }
  }
});
```

最后只需要调用

```javascript
$('.blog_bg:top(浮标位置)')
```

轻松把与浮标同一水平的文章选择出来了。

总结：我猜这是一个蛋疼的功能。


> Written with [StackEdit](https://stackedit.io/).
