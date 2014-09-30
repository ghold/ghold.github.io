---
layout: default
title: OMPTestingHelper介绍
category: PROJECT
tags: NODEJS
---

####**入口（index.js）**

包含服务、路由初始化，路由映射等

---

####**http服务（server.js）**

建立http服务，按照路由映射发送请求

---

####**路由（route.js）**

按照请求内容分配

<!-- excerpt -->

---


####**请求处理（requestHandlers.js）**

实现查询逻辑

*	`show*`：`show*`的作用是建立请求的页面，包含请求使用的form元素，加上外部的ajax调用，实现工具数据输入
*	`query*`或`get*`：`query*`或`get*`的作用是对查询服务器进行请求并接收返回值。调用`query*`或`get*`的方法只能通过`show*`中ajax调用
*	`static`：静态文件下载请求使用

---

####**生成器（generator.js）**

生成器与之后描述的过滤器均属于解析、可视化服务器返回Json的方法。

*	`txt_gen`：生成txt文件用。实际使用可以提供自动化测试结果下载
*	`html_gen`：生成html展示用。

提供四种最外层数据结构的Json进行解析，其余情况不解释

*	list：需要解析的内容是列表形式
*	single：最普通的结构
*	map：需要解析的内容如{1:{key1:value1},2:{key2:value2}}
*	nofield：无字段形式，内容只有一个值的情况

---

####**过滤器（filter.js）**
过滤器用于增强生成器的解析能力，通过生成器与过滤器递归调用使用。

*	`datetime`：日期时间，把时间格式化为"YYYY-MM-DD HH:mm:ss"
*	`date`：日期，把时间格式化为"YYYY-MM-DD"
*	`txt_*`：把对应格式转换为规定的文本格式
*	`html_*`：把对应格式转换为规定的html格式
*	`str_list`：对字符串列表进行加工
*	`time_list`：对时间列表进行加工
*	`html_warp`：对过长的字符串列表按逗号进行截取，分行显示

---

####**配置文件（config/default.json）**

default.json记录了工具展示数据的结构，可以实现增量扩展。

这个文件分为三部分，static、store和routeinterface。

static部分是用于请求处理里`static`方法的配置，后缀与接收格式的关系。

store部分是提供展示的结构，用于解析和展示返回的Json。此配置的格式为：

```
"store": {
	"store_name": {
		"cn_name":"中文名称",
		"group":"分组名称",
		"txt":[
			{
				"field":{
					"field1":"字段1显示名",
					……
				},
				"filter":{
					"field1":"字段1过滤",
					……
				},
				"child_field":{
					"child_field1":"子字段1显示名",
					……
				},
				"child_filter":{
					"child_filter":"子字段1过滤",
					……
				},
				"dir":"生成文件存放位置",
				"type":"txt生产器数据类型",
				"content":"需要转换的内容段"
			}
		],
		"content_type":"html生产器数据类型",
		"html":{
			"field":{
				"field1":"字段1显示名",
				……
			},
			"filter":{
				"field1":"字段1过滤",
				……
			},
			"child_field":{
				"child_field1":"子字段1显示名",
				……
			},
			"child_filter":{
				"child_filter":"子字段1过滤",
				……
			}
		}
	}
}
```

配置说明：

*	如果不需要生产txt，`"txt"`可以不用配置；
*	`"txt"`是一个列表，可以接受多个文件生成，以满足多种结构的数据验证
*	`"filter"`、`"child_field"`、`"child_filter"`均是可选填
*	`"content"`选填，用于解析子一级Json；默认不配置就是解析整个Json对象
*	`"content_type"`字段描述的是，用于产生html的解析结构
*	`"txt"`的`"type"`字段描述的是，用于产生txt文件的解析结构。为什么要独立于`"content_type"`设定txt的解析结构？原因有二：`"content"`可以自定义局部使用整个Json对象的子级（如`"parent":{"child_1":{},"child_2":{}}`，可以配置`"content"`的值为`"child_1"`，这样就可以局部解析`"child_1"`），而子级一般对母级结构不一样；`"txt"`是一个独立的生成应用，需要各自设定

routeinterface部分提供内部静态路由接口查询功能。基本配置：

```
"routeinterface":{
	"interfaceName2":{
		"name":"接口名称",
		"group":"分组名称",
		"args":{
			"arg_1":{
				"name":"参数名1",
				"type":"参数录入类型"
			},
			"arg_1":{
				"name":"参数名1",
				"type":"参数录入类型"
			}
		},
		"content_type":"list",
		"html":{
			"field":{
				"field1":"字段1显示名",
				……
			},
			"filter":{
				"field1":"字段1过滤",
				……
			},
			"child_field":{
				"child_field1":"子字段1显示名",
				……
			},
			"child_filter":{
				"child_filter":"子字段1过滤",
				……
			}
		}
	}
}
```

配置说明：

*	routeinterface需要严格配置，也需要服务端的支持
*	`"name"`字段严格按照接口方法去掉get或find后剩下的部分，加上参数个数合成（参数个数超过10则用9），如getBatch有两个参数，则名称为Batch2
*	`"args"`字段负责查询参数form格式配置，其中`"type"`有3种类型：
	*	`"text"`：字符串格式
	*	`"datetime"`：日期时间格式
	*	`"select"`：下拉选项，需要配置`"option"`
*	其他html生成参考store配置说明

> Written with [StackEdit](https://stackedit.io/).