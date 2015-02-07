---
layout: layout_for_d3
title: D3对象连贯性教程里的知识点
category: STUDY
tags: D3
---
>转自[Object Constancy](http://bost.ocks.org/mike/constancy/)，感谢

对象连贯性（Object Constancy），在教程中的解释为：呈现某种特定数据的图形元素可以通过变换的方式捕捉可视化的轨迹，也就是变换之间的显示是连贯的。


<!-- excerpt -->

<link rel="stylesheet" href="/assets/css/d3_object_constancy/default.css">

<p id = "chart"></p>

<p id="menu"><b>Top States by Age Bracket, 2008</b><br>Age: <select></select></p>

<script ype="text/javascript" src="/assets/js/d3_object_constancy/share.js" ></script>

以下介绍这个例子中有趣的知识点：

---

###D3数值格式化

d3.format()返回一个format指示符，用于数值格式化使用。接受的参数如下格式：

`[​[fill]align][sign][symbol][0][width][,][.precision][type]`

* fill：需要跟align一起使用。指定字符用于填充align对齐后的空间，字符不能是`{`或`}`。
* align：指定格式的对齐方式，`>`为右对齐（默认），`<`为左对齐，`^`为居中对齐，空位由fill填充。
* sign：指定是否显示正负号。`+`为正数时显示正号，负数时显示负号；`-`为正数时不显示正号，负数时显示负号（默认）；` `（空格）为正数时显示空格，负数时显示负号。
* symbol：指定货币或进制的前后缀。`$`为要加上货币标志，`#`为要在进制类型时加上进制的前缀。
* 0：开启0字符填充。
* width：限制内容宽度。不设置则宽度由内容定。
* ,（逗号）：启用千位逗号分隔功能。
* .precision：指定小数的精度。precision表示保留的位数。
* type：指定数值转换的结果类型。
	* `e`：科学计数法。
	* `g`：通用模式。保证有效数字数。
	* `f`：固定值模式。固定小数位数为精度数，可以把科学计数转换为长数字形式。
	* `d`：整数模式。只能对正数进行格式化。
	* `r`：如果整数部分长度大于精度数，则保留精度数的位数，其余用0代替。
	* `%`：跟固定值模式一致。先乘以100，再加上`%`后缀
	* `p`：跟`r`一致。先乘以100，再加上`%`后缀
	* `b`：二进制。
	* `o`：八进制。
	* `x`：十六进制。大于9的字母使用小写。
	* `X`：十六进制。大于9的字母使用大写。
	* `c`：字节码。不太明白。
	* `s`：通过`r`模式转换，转换为带计量单位的。
	* `n`：与`,g`一样。

	
###线性还是离散？

`d3.scale.linear()`与`d3.scale.ordinal()`分别代表着刻度运算中的线性映射与离散映射。两者都会接受domain与range，分别在数学中称为定义域和值域。

linear会根据定义域[a, b]和值域[c, d]有

```
ax + y = c
bx + y = d
```

这样就可以分别计算出

```
x = (d-c)/(b-a)
y = c - a(d-c)/(b-a)
```

所以对于任意在定义域中的数值z都可以计算出结果为

```
z(d-c)/(b-a) + c - a(d-c)/(b-a) 
```

ordinal接受的定义域是离散的。譬如例子中的州名称分类。虽然我们在分析例子源码时发现值域类似linear的，放入[c, d]这样的连续集合，但是ordinal的内部值域分解机制会散列这个连续集合。以rangeBands为例，会产生离散的间隔带，设定义域中元素个数为x，离散内间隔系数为k，外间隔系数为l，则有

```
w + ks = s
xs + 2ls = d-c
```

其中w为带宽，s为步长，结果为

```
s = (d-c)/(x+2l)
w = (1-k)(d-c)/(x+2l)
```

这样，就可以把连续集合的拆分开了。

---

###按键事件的利用

这个有趣的功能，如果不看源码，估计是猜不出来。尝试按着alt键，再选择下拉框的项，看看是不是变成慢动作了？这个功能对于观察对象连贯性非常有用。这里利用了javascript的按键事件。

`d3.select("window").on("keydown", funciton()(altKey = d3.event.altKey))`

这句保证了两个事实：

1.	保证按住键了
2.	保证按住的键为alt键

只有两者都实现了，才能使得返回的结果为true。

---

更多注解请下载本文引用的javascript。

> Written with [StackEdit](https://stackedit.io/).