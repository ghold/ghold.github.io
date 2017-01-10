---
layout: default
title: Thrift实战两则
category: TECHNIQUE
tags: THRIFT JAVA NODEJS JAVASCRIPT
---

我在一年前开始使用Thrift，契机是当时要开发一个后台内部数据查看工具。公司内部大多数系统都是使用Java作为主要语言，而我在毕业设计是对Java产生了厌恶，决心在未来应该尽可能远离Java开发（可惜事与愿违，现在已经成为职业Java开发）。那时我还是一个爱写小程序的测试工程师，比较偏向类似于Python、Javascript等等的“小语种”，这时，我遇到了Thrift。

<!-- excerpt -->

[Thrift](http://thrift.apache.org/)是由著名社交网站Facebook开发的开源软件框架，现在已加入到Apache孵化器中。以下引用官网对Thrift的定义：

>The Apache Thrift software framework, for scalable cross-language services development, combines a software stack with a code generation engine to build services that work efficiently and seamlessly between C++, Java, Python, PHP, Ruby, Erlang, Perl, Haskell, C#, Cocoa, JavaScript, Node.js, Smalltalk, OCaml and Delphi and other languages.

经过学习发现，Thrift有两点适合我：一是，Thrift提供了生成器，可以简单生成接口服务代码，很适合懒人使用；二是，跨语言交互，能支持10多种语言进行通信，很多有趣的事情都可以简单做到。尤其是跨语言交互，利用服务化的接口建立不同语言间的服务端和客户端，只需要简单地实现接口，即可实现各种语言间的通讯。

---

### Java与nodejs

工具是用来解决问题的，我认为选择合适的工具可以增添解决问题的趣味性。传统上，做一个接口查询Java后台的数据，有以下两种方法：对内使用struts＋Jsp的方式，对外使用webservice方式。前者使用一大堆action和占位符模版——一个字，累；后者使用冗长的xml作为通讯协议——两个字，乏味。Thrift则给了我一个简单有趣的解决方案。

先看以下的文本：

```
# hello.thrift
service HelloService {
  string getHelloInterface(1:string arg1, 2:string arg2)
}
```

以上就是Thrift框架的原型接口文本，乍看这三行玩意不是能用的范。不过还需要进行加工，这时我们可以选择自己喜欢的语言：首先是服务端是Java无疑，毕竟是用Java写的后台；其次我选择了nodejs，因为当时在学习nodejs，进行点实践还是要的。

在Windows下，我们需要使用官方的thrift.exe对原型接口进行转化生成。在cmd中执行

```
thrift.exe -r --gen java hello.thrift
thrift.exe -r --gen js:node hello.thrift
```

，在Mac中则是去掉.exe(前提是已经安装了Thrift，请自行官网找安装教程)，会分别产生两种语言的接口服务，均可以用来建立各自语言服务端和客户端。

#### 选择Java服务模型

使用Thrift框架写服务端有以下流程：实现服务接口方法、定义处理器（处理方式）、定义传输方式、定义传输数据协议、组成服务端。而Thrift则提供了很多模型进行选择。服务器的模型会影响到数据传输方式、传输数据协议选择等通讯方式参数，具体方式请参考[Thrift入门及Java实例演示](http://www.micmiu.com/soa/rpc/thrift-sample/)。当时我不想指定客户端的传输方式，所以选择了支持多线程的线程池服务模型。

按照入门里的说法，首先要实现了QueryService的接口方法，即工具的查询业务。在把方法嵌入模型中，启动服务端，一个简单的多线程socket服务端就架起了。

#### 架设nodejs客户端

服务端架起了总得有人用。Thrift的强大之一，是在于它提供了接口服务代码，客户端只需要知道服务模型，即可轻松接入。

上面使用的服务模型是传输方式为socket、传输数据协议是TBinaryProtocol。而我们将要使用的nodejs只需要以下代码：

```javascript
var thrift = require('thrift');
var HelloService = require('./gen-nodejs/HelloService.js'),
  ttypes = require('./gen-nodejs/hello_types.js');

var connection = thrift.createConnection(IP, PORT),
  client = thrift.createClient(HelloService, connection);

connection.on('error', function(err) {
  console.error(err);
});

client.getHelloInterface(arg1,arg2, function(err, res) {
  if (err) {
    console.error(err);
  } else {
  // to do something with res
  }
}
```

这是thrift在nodejs中实现最简易客户端的写法，对于我要的业务查询功能已经足够。这时，我们已经轻松把Java桌上的数据，搬到nodejs上，接受下一步过滤和生成页面。

如果不包含业务代码，服务端与客户端代码总计不超过100行。接下来讲讲最近的另一次Thrift经历。

---

### Java与Javascript

工作中总会遇到各种烦心事，譬如你把nodejs用得正欢时，突然被告知生产上的应用需要使用Jetty容器发布。Jetty是什么？Google一下发现原来是一个Java Http服务器和运行Java Servlet的容器。看到定义中带着一堆的Java，不禁黯然，果然后来发现上面只兼容Java的服务！（当时我马上发出感概，Docker会流行起来，这应该是间接原因。）这意味着我必须放弃依靠操作系统的nodejs。但是，我不想把前端的一些生成器和过滤器给丢了，我想，总有办法可以解决。没错，强大的Thrift又再次带来惊喜。

nodejs其实上是封装了Google开发的V8-Javascript处理器，也就是说，写的代码用的也是Javascript语言。在cmd中执行以下脚本，可以迅速产生对应的Javacript服务接口：

```
thrift.exe -r --gen js hello.thrift
```

产生的js文件只要在页面上进行引用，就可以方便地使用Thrift客户端功能（Javascript上只提供客户端功能）：

```html
<script src="js/thrift.js"></script>
<script src="js/gen-js/HelloService.js"></script>
```

#### 变更Java服务模型

值得注意的是，使用Javascript作为客户端，传输方式和传输数据协议都没有Java和nodejs丰富。如传输方式只支持XMLHttpRequest（XHR）和webSocket，而对于查询的功能，使用XHR进行异步调用即可；而传输数据协议貌似只有JSON的协议（源码中注释有TBinaryProtocol，不过没有看到实现）。这样，之前的多线程Socket服务模型就玩不转了，只能把服务端重构一下。

由于传输方式变成了XHR方式，那么服务端也要变成可以提供Http服务。Thrift提供了对Java内置HttpServlet的扩展，这次就用这个技术产生一个Thrift的服务端。不过我会做得扩展性更好（[原文]()）：

首先是实现处理接口，这个可以重用之前实现HelloService.Iface的代码：

```java
// HelloHandler.java
public class HelloHandler implements HelloService.Iface {
	@override
	public String getHelloInterface(String arg1, String arg2){
		return "Hello";
	}
}
```
接着是实现处理方式，这里为了以后扩展多种处理接口，使用多重处理方式：

```java
// HelloProcessor.java
public class HelloProcessor extends HelloService.Processor<HelloHandler> {
    private HelloHandler handler;
    public HelloProcessor(HelloHandler iface){
        super(iface);
        handler = iface;
    }
    public HelloHandler getHandler(){ return handler;}
    public void setHandler(HelloHandler handler){this.handler = handler;}
}
```

```java
// ApiMultiplexingProcessor.java
public class ApiMultiplexingProcessor extends TMultiplexedProcessor {
    HelloHandler helloHandler;
    private HelloProcessor helloProcessor;
    public ApiMultiplexingProcessor(HelloProcessor helloProcessor){
        this.registerProcessor("HelloService", helloProcessor);
        helloHandler = helloProcessor.getHandler();
    }
    public HelloHandler getHelloHandler() {return helloHandler;}
	public void setHelloHandler(HelloHandler helloHandler) {
		this.helloHandler = helloHandler;
    }
}
```

最后是创建Servlet，这时要指定传输数据协议：

```java
public class ApiServlet extends TServlet {
    public ApiServlet(){
        super(new ApiMultiplexingProcessor(new HelloProcessor(new HelloHandler())), new TJSONProtocol.Factory());
    }
}
```
这样，只要在Jetty上发布这个Servlet，就可以让客户端访问了。

也许还有个问题是，这里少了传输方式？其实Servlet已经指定了传输方式是Http，如果有兴趣，可以自行定制。

### Javascript客户端

使用Javascript编写Thrift客户端，需要进行以下几步（也可参看介绍服务端模型时的文章）：

```javascript
// 创建Transport，默认是XHR传输方式：
var transport = new Thrift.Transport("./apiServlet");

// 基于Transport创建Protocol，由于服务端使用的是多重服务，
// 这里的协议也是要支持多重服务协议，而数据协议默认是TJSONProtocol
var protocol = new Thrift.MultiplexProtocol("HelloService", transport);

// 基于Transport和Protocol创建 Client，这里没有指定Transport的原因是上一步已经指定：
var client = new HelloServiceClient(protocol);

// 调用Client的相应方法
client.getHelloInterface(arg1, args2, function(data){console.log(data)});
```

完成以上几步，Javascript的Thrift客户端就完成了，剩下只需要把nodejs上的生成器和过滤器移植过来，启动客户端即可。

---

### 强大的扩展性

我觉得Thrift最强大的地方是简易扩展性。

#### 例一：加方法

需求是要在HelloService加一个getWorldInterface方法。

只需：

1. 在hello.thrift中加一行：

	```
	# hello.thrift
	service HelloService {
		string getHelloInterface(1:string arg1, 2:string arg2),
		string getWorldInterface(1:string arg1)
	}
	```

2. 重新生成接口代码，并替换掉原来的；
3. 服务端与客户端都实现一下新增的接口方法即可。

#### 例二：加接口

需求是要加一个WorldService接口，并且有一个getWorldInterface方法

只需：

1. 在hello.thrift中加一个service：

	```
	# hello.thrift
	service HelloService {
		string getHelloInterface(1:string arg1, 2:string arg2)
	}
	service WorldService {
		string getWorldInterface(1:string arg1)
	}
	```

2. 重新生成接口代码，把WorldService代码加入到应用中；
3. 在多重服务TMultiplexedProcessor中注册新的接口方式（实战一需要改进processor为TMultiplexedProcessor，实战二中只需添加Handler和注册）；
4. 客户端对指定的接口进行调用，如改变nodejs下的create方法和javascript下的protocol定义

如上，大概4步即可扩展一个新的接口。

---

总结一下，以上是个人使用Thrift工作时的经验，不过我觉得Thrift是深坑，准备使用更多的语言去玩一玩。下一步应该是写个Python或者Go的客户端，如果有新东西在分享吧。


> Written with [StackEdit](https://stackedit.io/).
