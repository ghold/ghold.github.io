---
layout: layout_for_d3
title: D3选择器原理及数据绑定练习
category: STUDY
tags: D3
---

>转自[How Selections Work](http://bost.ocks.org/mike/selection/)，感谢

### 元素分组

选择器是一个分组（groups）数组，每个分组是元素（elements）数组。

使用selectAll方法，会使旧选择器变成新选择器中的一个分组。此分组中会多出一个母节点属性，会存储组中元素的母元素信息。

大多数使用，可以通过内置api自动遍历分组内每个元素。函数的第二参数可以指定处理某个索引的元素。

---

### 非分组操作

只有selectAll有针对分组的特定行为。select操作会保留现有的分组。

select与selectAll不同之处，在于对旧选择器中每个元素，在新选择器中必须拥有一个元素。而且数据也会由母节点传递到子节点。

append和insert方法是select的顶层封装，所以他们也会保留分组和传递数据

<!-- excerpt -->

---

### 空元素

分组可以通过null代替没有选择到的空元素。空元素通常会被大部分操作忽略，如改变元素样式和属性的操作会屏蔽空元素。

虽然操作会忽略空元素，但是空元素会占用分组索引，使用时要注意索引

---

### 绑定数据（Data）

data不是选择器的一个属性，而是选择器中元素的属性。

当我们绑定一个元素在选择器上时，实际上数据会保存在DOM上：数据会分配到每个元素的__data__属性上。当某个元素缺少__data__属性，它的datum就是undefined了。

绑定数据方式：

*  通过selection.data，可以为选择器中的每个元素绑定数据
*  通过selection.detum，可以为选择的单个元素绑定数据
*  通过append、insert或select可继承母节点数据

---

### 什么是数据？（Data）

D3中的数据指值数组。值可以是数值，可以是对象（如JSON对象），也可以是数组。

selection.data可以接收一个常量，也可以接收一个方法。但是selection.data是针对每个组定义数据而不是针对单个元素。selection.data表示为一个常量数组或方法要返回一个数组支持把数据分发到选择器的每一个元素上。也就是说一个分组的选择器，拥有相应的分组数据。

设计数据方法时，传入分组的母节点（d参数）和元素在分组的索引（i参数），返回一个值数组用于加入到分组中。

---

### 键引导

首先确认哪个元素需要绑定哪个数据。实现这个的方式是通过配对的键。当元素的键与数据的键一致时，对应的数据就会绑定到对应的元素上。最简单的方式是通过索引。

其次可以自定义键方法。定义一个返回键的方法，并设为selection.data的第二参数。方法会在每个元素运行，也会在数据数组中运行。相同的键会绑定。

---

### Enter、Update和Exit

当通过键为元素绑定一个数据时，D3会得到以下三种结果：

*	update：对于给定的数据集键，找到元素键匹配。
*	enter：对于给定的数据集键，找不到元素键匹配。
*	exit：对于给定的元素键，找不到数据集键匹配。

selection.data会执行update处理，update的结果会绑定到元素上，匹配不上补为null；selection会执行enter处理，通过selection.enter可以获得匹配不上的数据集；selection会执行exit处理，通过selection.exit可以获得匹配不上的元素集。

经过update或exit处理后的数据是一个普通的选择器，但enter处理后是一个选择器的子类。这是因为enter处理的结果元素还不算真实存在。一个enter选择器包含的是简单的只包含data属性的简单对象，而不是DOM对象。引用enter.select，才能专门把这些节点作为一个元素塞进分组母节点中。所以在进行数据绑定前，一定要通过selectAll方法进行转换，确保不是单纯的简单对象。


---

### 按默认的索引进行数据绑定

例子根据索引进行绑定的原理。

<link rel="stylesheet" href="/assets/css/d3_data_binding/default.css">
<link href="/assets/css/metro.min.css" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/default.css">
<link href="/assets/css/petty_colors.css" rel="stylesheet">

<example1></example1>

1. 初次化都是新增。
2. 如果再次执行时，新随机的个数比之前的少，之前多出的部分会通过exit退出，其他会被替换为新随机的值。棕色是被退出的值。
3. 如果再次执行时，新随机的个数比之前的多，之前的值直接被全覆盖。而绿色为多出来的位数。

这种绑定方式是不会根据值更新的。即使是相同的值，但在不同的索引上，一样会被直接覆盖。

### 引入自定义key进行数据绑定

例子采用了名字为key的绑定原理。

<example2></example2>


在绑定时使用了

```javascript
.data(data, function(d) {return d})
```

这句会在选择器的每个元素都跑一次，也会在data数组中每个索引跑一次。两者产生的结果相同的话，就会绑定在一起。

1. 如果上次存在的字母，新的也存在，则变为黑色。
2. 如果上次不存在的字母，新的存在，则新增为绿色。
3. 如果上次存在的字母，新的不存在，则置为棕色并退出。

这种方式看起来会更加符合更新逻辑。

<example3></example3>
<script type="text/javascript" src="/assets/js/d3_data_binding/share.js"></script>

> Written with [StackEdit](https://stackedit.io/).
