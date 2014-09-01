---
layout: default
title: Storm学习笔记（一）
category:  PROJECT
tags: STROM
---

>感谢[xumingming](http://xumingming.sinaapp.com/)提供的中文翻译[《Twitter Storm的一些关键概念》](http://xumingming.sinaapp.com/117/twitter-storm%E7%9A%84%E4%B8%80%E4%BA%9B%E5%85%B3%E9%94%AE%E6%A6%82%E5%BF%B5/)
>感谢官方wiki提供的[原文](https://github.com/nathanmarz/storm/wiki/Concepts)

###一些概念
####计算拓扑：Topologies
1.  Topology对象里包含实时计算程序
2.  一个Storm的Topology会一直运行——除非显式杀死
3.   一个Topology是Spouts和Bolts组成的图状结构，而连接Spouts和Bolts的则是Stream groupings

#####*参考阅读：*
1.  [TopologyBuilder](http://nathanmarz.github.io/storm/doc/index.html)：使用这个类在Java中构造计算拓扑
2.  [在生产集群上运行计算拓扑](https://github.com/nathanmarz/storm/wiki/Running-topologies-on-a-production-cluster)
3.  [本地模式](https://github.com/nathanmarz/storm/wiki/Local-mode)：通过这篇文章学习如何在本地模式开发和测试计算拓扑

####信息流：Streams
1.  一个信息流是一个没有边界的tuple（数据元组）序列，而这些tuples会被以一种分布式的方式并行地创建和处理
*   信息流是一个tuple序列
*   没有边界是什么意思？
*   分布式并行创建和处理。创建后用于分发到不同的Bolts进行处理？
2.  在序列中的tuple有一致的结构，即不同tuple相同位置字段类型一样
3.  由于大多信息流都是单向的，每个Stream会带有一个id，作为唯一标识

#####*参考阅读：*
1.  [Tuple（元组）](http://nathanmarz.github.com/storm/doc/backtype/storm/tuple/Tuple.html)：信息流由元组组成
2.  [OutputFieldsDeclarer](http://nathanmarz.github.com/storm/doc/backtype/storm/topology/OutputFieldsDeclarer.html)：用于定义信息流和信息流的结构
3.  [Serialization（序列化器）](https://github.com/nathanmarz/storm/wiki/Serialization)：关于Storm的元组动态类型和声明自定义序列化
4.  [ISerialization](http://nathanmarz.github.com/storm/doc/backtype/storm/serialization/ISerialization.html)：自定义的序列化器都要使用这个接口
5.  [CONFIG.TOPOLOGY_SERIALIZATIONS](http://nathanmarz.github.com/storm/doc/backtype/storm/Config.html#TOPOLOGY_SERIALIZATIONS)：自定义序列化器可以通过这个配置注册

####信息源：Spouts
1.  Spouts在计算拓扑中扮演生产者的角色。一般来说，Spouts会从一个外部源读取数据生成数据元组，并把数据元组发射进计算拓扑中
2.  Spouts可以是可靠的也可以是不可靠的。
*   可靠的信息源：如果Storm没有成功处理数据元组，信息源会重新发射一遍元组
*   不可靠的信息源：一旦信息源发射完数据元组，就会忘记这个动作（不管发出去的数据元组是否成功处理）
3.  Spouts可以发射多条信息流。使用OutputFieldsDeclarer.declareStream定义stream，使用OutputCollector.emit来选择要发射的stream
4.  Spouts类型中最重要的方法是nextTuple。nextTuple会做两件事：发射一个新的元组进计算拓扑或如果没有新的数据元组就简单放回（return）。要注意的是，nextTuple不能打断（block）任何Spout的实现，因为Storm会在同一个线程上调用全部Spout方法
5.  ack和fail是另外两个重要的方法。当Storm监测到Spout发出的数据元组被计算拓扑成功处理或者处理失败时，Storm会调用ack方法或者fail方法。Storm只为可靠的信息源调用ack和fail。

#####*参考阅读：*
1.  [IRichSpout](http://nathanmarz.github.com/storm/doc/backtype/storm/topology/IRichSpout.html)：信息源必须实现的接口
2.  [如何保证信息不丢失](https://github.com/nathanmarz/storm/wiki/Guaranteeing-message-processing)

####信息处理者：Bolts
1.  所有计算拓扑里的计算过程都封装在bolts中。Blots中可以实现所有过程，如过滤、函数、聚合、接合、与数据库联动等等
2.  Blots可以做简单的数据流传递。做复杂的信息流传递通常需要多个步骤，因此也需要多个Bolts。
3.  同样，Bolts也有可以发射多条信息流的特性。
4.  当声明一个Bolt的输入流时，需要订阅其他组件的特定数据流。如果想要订阅其他组件的全部数据流，你必须逐个订阅每个数据流。Storm中的InputDeclarer提供了方便的语法，用于订阅默认id声明的数据流，`declarer.shuffleGrouping("1")`可以订阅组件`"1"`的默认数据流
5.  Bolts中主要方法是execute，参数是一个数据元组tuple。Bolts使用一个OutputCollector对象发射处理后的数据元组tuple。为了让Storm知道什么时候接收到的数据元组（作为execute参数的）被处理完成，Bolts必须为每个收到的数据元组tuple调用OutputCollector对象的ack方法。这样这个tuple的信息源才会知道成功处理。
6.  一般流程：Blots处理一个输入的数据元组tuple（输入），处理结束后发射0个或多个tuple（结果），然后调用ack方法通知Storm已经处理过这个tuple（输入）了

#####*参考阅读：*
1.  [IRichBolt](http://nathanmarz.github.com/storm/doc/backtype/storm/topology/IRichBolt.html)：Bolts需要实现的接口
2.  [IBasicBolt](http://nathanmarz.github.com/storm/doc/backtype/storm/topology/IBasicBolt.html)：这个方便的接口可以定义过滤操作或简单的功能
3.  [OutputCollector](http://nathanmarz.github.com/storm/doc/backtype/storm/task/OutputCollector.html)：Bolts要发射数据元组到它们的输出信息流，用到这个类的一个实例
4.  [如何保证信息不丢失](https://github.com/nathanmarz/storm/wiki/Guaranteeing-message-processing)

####信息分发策略：Stream groupings
1.  定义每个Blot应该接收怎样的输入流，是定义一个计算拓扑的一部分。一个信息分发策略定义了如何分配信息流到Blot的多个任务中
2.  Storm中有7个内建的信息分发策略：
*   随机分组Shuffle Grouping：随机分发stream里面的tuple到bolt的任务中，保证每个bolt拿到相同数量的数据元组tuple
*   按字段分组Fields Grouping：信息流通过特定字段进行分组。譬如数据流以`user-id`字段分成几组，数据流中带有相同`user-id`值的数据元组tuple**都会**去到Bolt中相同的任务，带有不同`user-id`值的两个数据元组tuple**可能会**被分配到不同的任务
*   广播分发All Grouping：对于每一个数据元组，会分发到所有Bolt的所有任务。谨慎使用
*   全局分发Global Grouping：整个数据流被分发到Bolt中的单个任务，这个任务是id最小的任务
*   无分组None Grouping：这种分组方式是指信息流steam不关心谁会拿到它的信息元组。现时，无分组方式等价于随机分组方式。不同的地方在于，Storm会把这个bolt的执行，放到接收这个blot发射数据的信息源Spout或信息处理器Blot所在线程上。
*   直行分组Direct Grouping：这是一种特殊的分组方式。使用这种方式进行分组的信息流，意味着数据元组tuple的生产者可以决定消费者的某个任务能接收到这个数据元组。只有被声明为Direct Stream的信息流可以声明这种分组方法，而且只能使用emitDirect方法发射。
*   本地或随机分组Local or Shuffle Grouping：如果目标信息处理器Blot在同一个工作进程中有一个或多个任务，数据元组tuples会随机分发到这些进程内的任务中。否则，跟普通的随机分组一样

#####*参考阅读：*
1.  [TopologyBuilder](http://nathanmarz.github.com/storm/doc/backtype/storm/topology/TopologyBuilder.html)：使用这个类定义计算拓扑
2.  [InputDeclarer](http://nathanmarz.github.com/storm/doc/backtype/storm/topology/InputDeclarer.html)：当TopologyBuilder中调用setBolt方法，InputDeclarer会被返回，而且返回的InputDeclarer用于定义Bolt的信息输入流和这些流该如何分发
3.  [CoordinatedBolt](http://nathanmarz.github.com/storm/doc/backtype/storm/task/CoordinatedBolt.html)：这类处理器在分布式远程过程调用计算拓扑中很有用，而且重度使用直行信息流和直行分组

####可靠性：Reliability
1.  Storm保证每个数据元组tuple会被topology完整执行。
2.  Storm会追踪由每个Spout发出的tuple所产生的tuple树（一个bolt处理一个tuple之后可能会发射出别的tuple，从而可以形成树状结构），并且跟踪这棵tuple树什么时候成功处理完。
3.  每个计算拓扑会与一个信息超时关联。如果在超时时间内Storm没有监测到由一个Spout发出的tuple已经执行成功，那么Storm会主动结束tuple运算并且随后重新进行运算
4.  要使用Storm的可靠性特性，在发出一个新的tuple和完成处理一个tuple时必须通知Storm。Bolt使用OutputCollectior对象发射tuples，同时完成上述通知。通过它的emit方法来通知一个新的tuple产生了，通过它的ack方法通知一个tuple处理完成

#####*参考阅读：*
1.  [如何保证信息不丢失](https://github.com/nathanmarz/storm/wiki/Guaranteeing-message-processing)

####任务：Tasks
1.  在集群中，每个Spout或Bolt会作为很多任务执行
2.  每个任务对应一个执行线程，通过信息分发策略定义怎样从一组任务中发送到另一组。
3.  可以使用TopologyBuilder中的setSpout与setBolt方法设置任务的并行度——也就是有多少个任务

####工作进程：Workers
1.  一个计算拓扑可以经过一个或多个工作进程执行。每个工作进程是一个物理的Java虚拟机，执行这个计算拓扑的一部分。
2.  比如对于任务并行度是300的计算拓扑来说，如果我们使用50个工作进程来执行，那么每个工作进程会处理其中的6个任务（其实就是每个工作进程里面分配6个线程）。Storm会尽量均匀的工作分配给所有的工作进程。

#####*参考阅读：*
1.  [Config.TOPOLOGY_WORKERS](http://nathanmarz.github.com/storm/doc/backtype/storm/Config.html#TOPOLOGY_WORKERS)：配置计算拓扑分配到的工作进程数


> Written with [StackEdit](https://stackedit.io/).