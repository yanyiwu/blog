---
published: true
layout: post
title:  "简单的事件驱动HTTP服务器"
date:   2014-12-26
category: work
---

# 简单的事件驱动HTTP服务器

前阶段写的 [Thrift异步IO服务器源码分析] 和 [C1000K之Libevent源码分析]，
当时看完代码就打算自己临摹一个简单的基于 Libevent 的异步非阻塞服务器，
后来确实也写了一个，
很简单的，
差不多等于是把 Thrift 的 TNonblockingServer 
扒清楚洗干净，
把不需要的那些协议序列化之前的去掉，
然后再套上自己之前写的简单 HTTP 解析和 ThreadPool 来处理任务。
就可以了，个人感觉 比 Thrift 版本的更简单(更糙)和易读。

代码放在 [简易HTTP服务框架Husky] 里面的 [NonblockingServer] 里面。


[Thrift异步IO服务器源码分析]:http://yanyiwu.com/work/2014/12/06/thrift-tnonblockingserver-analysis.html
[C1000K之Libevent源码分析]:http://yanyiwu.com/work/2014/12/10/asyncronous-io-libevent.html
[简易HTTP服务框架Husky]:https://github.com/yanyiwu/husky
[NonblockingServer]:https://github.com/yanyiwu/husky/blob/master/include/NonblockingServer.hpp
