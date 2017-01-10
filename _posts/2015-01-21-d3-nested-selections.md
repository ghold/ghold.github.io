---
layout: default
title: D3内嵌选择器
category: STUDY
tags: D3
---

>转自[Nested Selections](http://bost.ocks.org/mike/nest/)，感谢

D3支持`d3.selectAll("A B")`的方式内嵌选择器，这个跟`d3.select("A").selectAll("td")`的效果一致。

<!-- excerpt -->

---

### 嵌套与索引

```javascript
d3.selectAll("tbody td");
```

出来的结果是垂直结构的，td元素会自动产生递增索引。如出来的结果有16个，那么索引由0递增至15。

D3的嵌套选择器保留垂直结构的特点。如

```javascript
d3.selectAll("tbody tr").selectAll("td");
```

即使结构中多出了分组用的母节点tr，也不会影响td元素的垂直结构，td的索引还是由0递归至15。

---

### 嵌套与数据

如果嵌套选择器需要绑定一个二维数组，需要先让选择器上层绑定数组外围，在对选择器的单元绑定数据内部。如matrix为数据二维数组

```javascript
var matrix = [
  [ 0,  1,  2,  3],
  [ 4,  5,  6,  7],
  [ 8,  9, 10, 11],
  [12, 13, 14, 15],
];
```

第一重绑定为

```javascript
var tr = d3.selectAll("tbody tr").data(matrix);
```
，第二重绑定为

```javascript
tr.selectAll("td").data(function(d){return d;});
```

。注意不能直接使用

```javascript
d3.selectAll("tbody tr td").data(matrix);
```

，那是因为matrix的值个数为16，但是第一次绑定时，d3认为那是含有四个数组的数组而已，职能绑定选择器的前4项。

---

### 嵌套与母节点

使用嵌套选择器存在一个隐藏的特性：对每个元素分组都会设定一个母节点。增加节点的操作是会针对这个母节点下添加。如果在一开始就使用嵌套选择器，如（matrix数组的个数要比原始tr元素多才有效果）

```javascript
d3.select("tbody tr").data(matrix).enter().append("tr");
```

，这个结果会报一个错：节点无法添加tr元素。原因其实是开始使用的嵌套选择器会默认把网页的根几点html作为默认的选择器母节点，而html节点下是不能添加tr元素的。这个时候可以选择放弃嵌套：

```javascript
d3.select("tbody").selectAll("tr").data(matrix).enter().append("tr");
```

，让母节点设置为tbody。

---

### 是否需要内嵌

这里提到，在select和selectAll之间存在一个重要的区别：select方法会*保留*存在的分组，而selectAll会*新建*一个分组。使用select方法会保留数据、索引、原选择器的母节点。

推荐使用方式是，先有一个确定的选择器，再在这个选择器的基础上使用selectAll，这样selectAll的分组中，都是以这个确定的选择器作为母节点进行下一步的操作。这也是data方法都是紧跟这selectAll的原因——不用担心使用未知的母节点。



> Written with [StackEdit](https://stackedit.io/).
