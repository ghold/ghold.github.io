---
layout: default
title: MarkDown语法
category:  TECHNIQUE
tags: MARKDOWN
---

**强调格式**

`*italic*   **bold**`：*italic*   **bold**  
`_italic_   __bold__`：_italic_   __bold__

***

**链接（标题选填）**

内联：

`[例子](http://url.com/ "标题")：`

[例子](http://ghold.net/ "ghold.net")

索引方式标签：

```
[例子][id]. 这样，在文档的其他地方定义以下格式:
[id]: http://example.com/  "标题"
```

[例子][1]

[1]: http://ghold.net/  "ghold.net"

<!-- excerpt -->

***

**图像（标题选填）**

内联：

`![alt text](/路径/img.jpg "标题")：`

![alt text](/assets/img/2013_11_22/404.png "列子")

索引方式：

```
![alt text][id]. 这样，在文档的其他地方定义以下格式:  
[id]: /路径/img.jpg "标题"
```

![alt text][2]  

[2]: /assets/img/2013_11_22/404.png "例子"

***

**头标签**

setext方式：

```
一级头标签
========
```

一级头标签
========

```
二级头标签
--------
```

二级头标签
------

atx方式(后续的#可以选填)：

```
# 一级头标签 #
```

# 一级头标签 #

```
## 二级头标签 ##
```

## 二级头标签 ##

```
###### 六级头标签
```

###### 六级头标签

***

**列表**

有序的，没带段落：

```
1.  Foo
2.  Bar
```

1.   Foo
2.   Bar

无序的，带段落：

```
*   A list item.
    With multiple paragraphs.
*   Bar
```

*	A list item.
	With multiple paragraphs.
*	Bar

可以进行内嵌：

```
*   Abacus
    * answer
*   Bubbles
    1.  bunk
    2.  bupkis
        * BELITTLER
    3. burper
*   Cunning
```

*   Abacus
    * answer
*   Bubbles
    1.  bunk
    2.  bupkis
        * BELITTLER
    3. burper
*   Cunning

***

块引用

```
> 邮件形式的尖括号
> 一般用于块引用
>
> > 而且可以多次引用进行内嵌
>
> #### 在块中用头标签
> 
> * 可以引用一个列表
> * 等等
```

> 邮件形式的尖括号
> 一般用于块引用
>
> > 而且可以多次引用进行内嵌
>
> #### 在块中用头标签
> 
> * 可以引用一个列表
> * 等等

***

**代码标签**

```
`<code>` 块通过反引号定义
可以使用`` `反引号` ``在块中包含字面上的反引号
```

`<code>`

``‘反引号’``

***

**预格式化代码块**

在每一行前增加至少4个空格或一个tab，产生预格式化代码块。

```
	预测试代码块
```

***

**水平线**

三个以上的破折号或型号产生水平线：

`---`

`***`

`- - - -`

***

**手动换行**

在每行结束时增加2个以上的空格可以手动换行：

```
玫瑰是红色的,  
紫罗兰是紫色的
```

> Written with [StackEdit](https://stackedit.io/).