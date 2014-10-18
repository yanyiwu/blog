---
published: true
layout: post
title:  "Thrift源码剖析"
date:   2014-10-17
category: work
---

由于工作的关系，需要定位一个 bug 是否和 Thrift 有关，
所以用了一下午的时间研读了 [Thrift-0.9.0] 代码，虽然发现这个 bug 和 thrift 无关。
但是读源码还是有所收获，所以整理成这篇文章，不过不太适合 Thrift 刚入门的人。

以下内容基于 [thrift-0.9.0]   

## 整体脉络

Thrift 几乎支持所有的语言。在此针对 Thrift 的 C++ lib 来讲。   
也就是基于根目录 `thrift-0.9.0/lib/cpp/src/thrift`

Thrift 最核心的几个模块目录如下(按自底向上排序)：

+ transport/
+ protocol/
+ processor/
+ server/

## 四大模块

**Transport**

其实是网络通信，现在都是基于 `TCP/IP` ，
而 `TCP/IP` 协议栈由 `socket` 来实现，也就是现在的网络通信服务器，
最底层都是通过 `socket` 的， Thrift 也不例外，
而在 Thrift 源码中，则是通过将 `socket` 包装成各种 `Transport` 来使用。
对应的源码目录就是 `thrift-0.9.0/lib/cpp/src/thrift/transport` 。
大部分和网络数据通信相关的代码都是放在这个目录之下。

**Protocol**

Thrift 支持各种语言 ，是通过一个 `x.thrift` 的描述文件来通信。
thrift 描述文件是各种语言通用的，
但是需要通过 thrift 的代码生成器（比如 `c++` 对应的是 `thrift --gen cpp x.thrift`）来生成对应的源代码。

那为什么不同的代码可以直接互相调用接口函数呢，
其实就是因为制定了同一套协议，
就像 `HTTP` 协议，
你根本不需要知道实现 `HTTP` 服务器的是什么语言编写的，
只需要遵守 `HTTP` 标注来调用即可。

所以其实 `protocol` 就是 `transport` 的上一层。
`transport` 负责数据传输，
但是要使得程序知道传输的数据具体是什么，
还得靠 `protocol` 这个组件来对数据进行解析，
解析成对应的结构代码，供程序直接调用。

**Processor**

通过  `transport` 和 `protocol` 这两层之后，
程序已经可以获得对应的数据结构，但是数据结构需要被使用才有价值。
在 Thrift 里面，就是被 `processor` ，比如我们定义了一个描述文件叫 `foo.thrift` 

内容如下：

```
service Foo {
  string GetName()
}
```

通过 `thrift --gen cpp foo.thrift` 之后就会生成 `gen-cpp` 目录下面一堆代码。
里面最关键的两个文件就是 `Foo.h` 和 `Foo.cpp` 。
里面和 processor 相关的类是 : 

{% highlight cpp %}
class FooProcessor : public ::apache::thrift::TDispatchProcessor {
 protected:
  boost::shared_ptr<FooIf> iface_;
  virtual bool dispatchCall(::apache::thrift::protocol::TProtocol* iprot, ::apache::thrift::protocol::TProtocol* oprot, const std::string& fname, int32_t seqid, void* callContext);
 private:
  typedef  void (FooProcessor::*ProcessFunction)(int32_t, ::apache::thrift::protocol::TProtocol*, ::apache::thrift::protocol::TProtocol*, void*);
  typedef std::map<std::string, ProcessFunction> ProcessMap;
  ProcessMap processMap_;
  void process_GetName(int32_t seqid, ::apache::thrift::protocol::TProtocol* iprot, ::apache::thrift::protocol::TProtocol* oprot, void* callContext);
 public:
  FooProcessor(boost::shared_ptr<FooIf> iface) :
    iface_(iface) {
    processMap_["GetName"] = &FooProcessor::process_GetName;
  }

  virtual ~FooProcessor() {}
};
{% endhighlight %}

可以看出该 processor 继承自 `TDispatchProcessor` 。

注意到以下几点：

1\. 
`dispatchCall` 这个函数是个虚函数，而看 `TDispatchProcessor` 源码就可以明白，
这个函数是被供 `TDispatchProcessor` 类中的虚函数 `process` 来调用的。
这里的动态绑定的技巧需要有一定的 `C++` 基础才能理解。
这样的用法其实很常见，因为所需用到的场景非常多，
你在父类，也就是 `TDispatchProcessor` 这个类中暴漏给外界的接口是 `process` ，
而具体的实现需要在不同子类里面进行不同的实现，
所以定义出 `dispatchCall` 这个**纯虚函数** 强制子类实现之。
而父类在 `process` 函数中适当的调用 `dispatchCall` 即可。
虽然对于第一次接触的人来说可能会比较绕，但是也算是很好用的一种技巧。

2\. 

```
typedef std::map<std::string, ProcessFunction> ProcessMap;
ProcessMap processMap_;
...
processMap_["GetName"] = &FooProcessor::process_GetName;
```

注意到以上三行代码是很有意思的点发，
因为我们在 `foo.thrift` 文件里面定义了一个函数叫 `GetName` ，
而在`FooProcessor`里面的函数定义是`process_GetName`，
其中使用了一个 `map<string, ProcessFunction>` 将他们对应起来。

其实这就是`反射`，可以让外界通过字符串类型的函数名来指明调用的函数。
从而实现函数的动态调用。
但是这样的反射其实非常低效，因为每次 `map.find` 需要对比字符串的大小。
可以说这也注定 `Thrift` 不打算成为一个高性能的 RPC 服务器框架。

到此为止可以大概猜出来每次 RPC 调用的过程是：

1. 客户端指定要调用的函数，比如是 GetName 。
2. 将该函数名通过 protocol 进行编码，编码后的数据通过 transport 传输给服务端。
3. 服务端接收到数据之后，通过和客户端一样的 protocol 解码数据。
4. 解码后的数据获得需要调用的函数名，比如是 GetName，然后通过 FooProcessor 的 processMap_ 去找出对应 ProcessFunction 来调用。

不过接下来才是重头戏： server 模块。

**Server**

众所周知，当前最流程的两种高性能服务器编程范式是 `多线程` 和 `异步调用` 。
这里展开讲又是很大的一个话题。这里简单的说一下：
根据高并发编程闻名已久的那篇文章 `c10k` 所倡导的来说，
多线程当并发数高的时候，内存会成为并发数的瓶颈，
而异步编程而没有相关的困扰，是是解决高并发服务的最佳实践。
（注意这里说的是解决高并发的最佳实践）
我个人的观点是异步编程是把双刃剑。
它确实对高并发服务很友好，特别是对于IO密集型的服务。
但是对于业务逻辑的开发并不友好。
比如 `Nginx` 是将 异步IO 使用得登峰造极的作品，
而 `Node.js` 则因为异步经常把业务逻辑弄得支离破碎。

这两者 Thrift 都有对应的 server 类供开发人员使用。

在 Thrift 中，有以下四种 server ：

1. `TSimpleServer.cpp`
2. `TThreadedServer.cpp`
3. `TThreadPoolServer.cpp`  
4. `TNonblockingServer.cpp` 

第一种 `TSimpleServer` 最简单，就是单线程服务器，没什么可说的。


**多线程服务器**

第二种和第三种都是 `多线程` 模型。
这两者的不同点只是在于前者是每个连接进来会新建一个线程去接受该连接。
直到对应的连接被关闭，该线程才会被销毁。
服务的线程数和连接数相等，有多少个连接就有多少个线程。
而后者是连接池的形式，在系统启动的时候就设定好线程数的大小，比如线程数设置为32 。
每次新的连接过来的时候，就向线程池 **申请** 一个线程来处理该连接。
直到该连接被释放，该线程才会被回收到线程池。
如果线程池被申请到空时，下一次申请则会阻塞，
阻塞直到线程池非空（也就是有线程被回收时）。

这两者各有利弊，前者的缺点主要是当连接数过大的时候，
会把内存撑爆，这就是之前 `C10K` 说的并发数太大内存不够用的情况。
后者的缺点则是当线程池的线程被用完时，下一次的连接请求则会失败（阻塞住）。
所以当使用 `TThreadPoolServer` 的时候，如果发现客户端连接失败了，
十有八九都是因为线程池的线程供不应求了。
总之，开发者可以针对不同的场景选用不同的服务模型。

**TThreadedServer**

说说源码细节：

`TThreadedServer` 有一个成员变量叫 `serverTransport_` ，作为服务器的主 transport (其实就是主 socket) 。
监听端口【listen】，和接受请求【accept】 。
这里需要注意的是，这里的 `serverTransport_` 其实是个非阻塞 socket 。
非阻塞的过程是借助了 `poll` (不是 `epoll` )，来实现，将 `serverTransport_` 
在 `poll` 里面注册，不过呢，注册的时候设置了 `timeout` 时间。
在 [thrift-0.9.0] 里面的超时时间是 3 seconds 。
也就是可以理解为其实每次 `serverTransport_->accept()` 函数退出时不一定是接受到请求了。 
也有可能是超时时间到了。
具体可以看 `thrift-0.9.0/lib/cpp/src/thrift/transport/TServerSocket.cpp`文件里
360行的函数 `TServerSocket::acceptImpl()` 的实现过程。
所以在 `TThreadedServer` 的实现里面，
需要用 `while(_stop)` 轮询进行 `serverTransport_->accept()` 的调用。
这个轮询在没有任何连接请求的时候，每次循环一次的间隔是 3s，
也就是之前设置的 超时时间。

而当连接进来的时候，`serverTransport_->accept()` 就会立即返回接受到的新 client 。

然后接下来的过程就是 Task 上场了。
Task 就是将 `transport`, `protocol`, `processor` 包装起来而已。
就像上文说的，整个调用的过程从底层往高层就是以此调用 `transport`, `protocol`, `processor` 来处理请求的。
所以直接使用包装它们的 Task，将 Task 绑定到一个线程并启动该线程，
再把 Task 插入任务集合中即可。
注意到，之前的 `while(_stop)` 轮询退出时，会检测该任务集合，
如果任务集合不为空，则会阻塞直到任务集合为空，`TThreadedServer` 的 `server` 函数才会退出。
细节请看 `thrift-0.9.0/lib/cpp/src/thrift/server/TThreadedServer.cpp` 
第40行的 `class TThreadedServer::Task: public Runnable` 函数实现。

当连接进来的时候，会新建一个 Task 扔进任务队列。
当连接断开的时候，该 Task 对应的线程会执行完毕，在退出之前会从任务队列中删除该任务。
但是当客户端迟迟不主动断开连接呢？
答案是线程就会迟迟不退出，任务队列就会一直保持非空状态。
原因在 Task 的 run 函数里面，会循环调用 `thrift-0.9.0/lib/cpp/src/thrift/server/TThreadedServer.cpp` 71行
里面的 peek() 函数，这个 peek() 函数是阻塞型函数。
功能是窥探客户端是否有新的函数调用请求，如果没有，
则阻塞等待直到客户端发送函数调用请求。

**TThreadPoolServer**

按照上文理解了 ThreadedServer 之后，ThreadPoolServer 就没什么好说的了。
基本上就是【同理可得】。

**非阻塞型服务器**

第四种 `TNonblockingServer` 就是传说中的 异步服务器模型（非阻塞服务器模型）。
在 Thrift 中使用该模型需要依赖 `libevent` 。
这个比较复杂，以后有时间再单独写一篇解析吧。


## 观码有感

`Thrift` 非常好用，但是其实细看源码的时候也会发现它的实现并没有想象的那么好。
很多地方其实性能上的考虑并不周全，希望在以后能有机会贡献出自己的 patch 给 Thrift 。

阅读 `Thrift` 源码了结我很多疑惑，虽然在本文中没法一一详述。
不过就像前阶段[淘叔度]微博说的：

> 做互联网开发的程序员怎么可以不读开源代码呢？！即使是最伟大的画家也会去欣赏甚至借鉴别人的作品，因为这是一个必经的学习成长路径。不读开源代码就不是好程序员；不读开源代码就是无追求、无品味、无上进心的三无程序员。



[thrift-0.9.0]:http://archive.apache.org/dist/thrift/0.9.0/thrift-0.9.0.tar.gz
[淘叔度]:http://weibo.com/1804559491/BrvrAoRVY?type=comment
