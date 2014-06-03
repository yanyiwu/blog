---
layout: post
title:  "Thrift对Python的支持并不好"
date:   2014-03-30
category: work
---

Thrift声称对`C++/Java/Python`这类大众语言支持的很好，但是最近工作发现Thrift对Python的支持真是惨不忍睹。

## Thrift`0.8.0`有严重bug 

刚开始用的这个版本，C++开发的服务端，Python开发客户端。
客户端的任务特别简单: 从某接口读取一段文本然后组装成函数的参数，然后请求服务端。

没想到压力测试的时候，发现Python客户端跑着跑着就卡死住了。
谷歌之后才知道这个是`Thrift`在`0.8.0`这个版本的bug，升级到0.9.0就好了。具体bug详情请看 [thrift-0.8.0-python-bug]

## Thrift`0.9.0`性能太差

升级到`0.9.0`这个版本之后确实运行会比较顺畅，没有卡死的现象。
不过**性能**简直低到一定的境界，而且虽然不会卡死，但是不时的会抛出`bad_alloc`的异常。
目测前者(性能低)很可能就是后者(抛异常)造成的。不过即使没有抛异常，性能还是非常低下。详细请看下面数据。

## 关于`python thrift client`性能差的优化尝试

python client 跑1000条数据，花费51秒，`51ms/row`

尝试了下面三种方法优化：

1. 修改thrift的协议，修改成压缩协议。
2. 将SimpleServer修改成PosixThreadServer。
3. 重写成cppclient。(重写很简单，本身client端的任务就很简单，所以大概也就是几十行代码而已。)

前两种方法还是原来的速度，**没有任何提升**。
但是第三种方法速度变得**飞快**，跑1000条数据，花费7秒，`7ms/row`。

## 总结

本来使用Thrift实现美好的服务端C++，客户端Python的愿望被击碎了。
虽然说用Python写本来就不该对性能太苛刻，但是毕竟只是很简单的工作，而且也不是计算密集型的任务。
只是数据的组装和搬运而已，没想到性能差这么多。
不过听说最近Facebook又搞出了一个`fbthrift`，不知道会不会有所改善，但愿吧。


[thrift-0.8.0-python-bug]:https://issues.apache.org/jira/browse/THRIFT-1515
