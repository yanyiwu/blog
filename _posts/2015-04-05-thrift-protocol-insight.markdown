---
published: true
layout: post
title:  "Thrift之Protocol源码分析"
date:   2015-04-05
category: work
---

之前写过两篇关于 Thrift 的相关文章。

- [Thrift源码剖析]
- [Thrift异步IO服务器源码分析]

也算是对Thrift比较熟悉，不过对 Thrift 里面的 Protocol 部分还是黑盒使用。
虽然大概能猜到具体实现方式，但是还是忍不住花了一点点时间把具体代码实现翻出来看看。
主要是为了满足一下好奇心。

简单搞了一个Thrift的描述文件[Insight.thrift]作为例子。 

```c
struct Person {
    1: string name,
    2: i32 age,
    3: optional string address,
}

service Insight {
    Person Hello(1: Person person),
    Person Hi(1: Person p1, 2: Person p2),
}
```

然后通过
毕竟Thrift其实就是干RPC的活，所以看源码就按着RPC远程调用的顺序来看就行。

从Hello函数调用开始，[InsightClient::Hello] 可以看出，
在每次RPC调用的时候，会先将函数名通过[writeMessageBegin("Hello", ::apache::thrift::protocol::T_CALL, cseqid)]
先发送过去。
这个过程的序列化协议很简单，直接就是传输的函数名字符串。
然后再发送参数。
发送参数的时候，会将所有参数作为一个 struct 发送 [Insight_Hello_pargs]，

所以协议的序列化过程主要都是体现在 struct 的序列化上面。
比如像Hi函数的参数序列化过程:

```c
uint32_t Insight_Hi_pargs::write(::apache::thrift::protocol::TProtocol* oprot) const {
  uint32_t xfer = 0;
  xfer += oprot->writeStructBegin("Insight_Hi_pargs");

  xfer += oprot->writeFieldBegin("p1", ::apache::thrift::protocol::T_STRUCT, 1);
  xfer += (*(this->p1)).write(oprot);
  xfer += oprot->writeFieldEnd();

  xfer += oprot->writeFieldBegin("p2", ::apache::thrift::protocol::T_STRUCT, 2);
  xfer += (*(this->p2)).write(oprot);
  xfer += oprot->writeFieldEnd();

  xfer += oprot->writeFieldStop();
  xfer += oprot->writeStructEnd();
  return xfer;
}
```

整个对象的序列化过程主要是依赖了接口 TProtocol 的函数。

对于实现 TProtocol 接口的序列化实现主要是以下三种(在`thrift-0.9.0/lib/cpp/src/thrift/protocol`里)：

- TBinaryProtocol
- TCompactProtocol
- TJSONProtocol

要了解协议序列化过程主要看一下 TBinaryProtocol 和 TCompactProtocol 就够了。

主要是如下几个关键点：

- 其实 writeStructStruct 和 writeStructEnd 啥屁事也不用做。
- 其实 writeFieldBegin 只有后两个参数有用，第二个参数是类型，第三个参数是ID，
因为光靠这两者就可以在反序列化（读取解析）的时候知道是哪个成员了。
- struct write 的过程其实是个递归的过程，也就是在write函数中，
会递归的调用结构体本身每个成员的write函数。
- TCompactProtocol 和 TBinaryProtocol 的区别主要是，
TCompactProtocol 对整数类型使用了 ZigZag 压缩算法，比如 i32 类型的整数本来是4个字节，
可以压缩成 1~5 字节不等。而 i64类型的整数本来是8个字节。可以压缩成 1~10 字节不等。


[Insight_Hello_pargs]:https://github.com/yanyiwu/practice/blob/master/thrift/insight/gen-cpp/Insight.cpp#L362
[Insight.thrift]:https://github.com/yanyiwu/practice/blob/master/thrift/insight/insight.thrift
[InsightClient::Hello]:https://github.com/yanyiwu/practice/blob/master/thrift/insight/gen-cpp/Insight.cpp#L351
[writeMessageBegin("Hello", ::apache::thrift::protocol::T_CALL, cseqid)]:https://github.com/yanyiwu/practice/blob/master/thrift/insight/gen-cpp/Insight.cpp#L360

[Thrift源码剖析]:http://yanyiwu.com/work/2014/10/17/thrift-source-code-illustration.html
[Thrift异步IO服务器源码分析]:http://yanyiwu.com/work/2014/12/06/thrift-tnonblockingserver-analysis.html
