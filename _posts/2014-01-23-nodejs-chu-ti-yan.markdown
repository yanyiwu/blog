---
layout: post
title:  "Node.js初体验"
date:   2014-01-23
category: work
---

node.js是一直想探索的一个开源项目。
这几天闲来无事看了一些相关tutorial，并将中文分词[CppJieba]整合进去可以让node.js调用。

## node 初体验

node是著名的__异步IO高并发单线程的server__

从node/deps这个目录下就可以看到大概node的整体思路:
* `v8`   : google出品的js引擎
* `uv`   : 跨平台的网络事件库
* others : 其他就是作为工具类，比如http参数解析，ssl加密等。

首先注意到node是单线程的，但是却是高并发的，这两者看似矛盾，但是也不难理解。主要是归功与uv这个库，uv本质上就是一个事件驱动的库。

可以把uv理解为是对epoll之类的一个封装，epoll就是一个高并发的事件驱动的IO多路复用网络服务器。
或者，直接理解为中断信号编程，我们注册一些事件，当这些事件发生的时候，系统自动调用我们注册好的事件回调函数。
这样的好处是非阻塞，同时也方便做到高并发，所以在开发nodejs的时候和一般的开发不一样，把可能耗时较多的函数注册成回调函数。

所以按我的理解，node其实可以看成是一个c++写好了若干网络服务库，但是引入了v8，让我们可以简单的使用js来调用这些牛逼的服务库，嗯，就是这样。

## 单线程和异步IO

照着《node入门》教程写代码就会遇到nodejs与众不同的编程方法，在传统编程方法中，
代码逻辑都是同步运行，如果要进行并行的话则需要多线程或者多进程，如传统的网络服务器Apache, Nginx。
而nodejs天生支持异步编程，实际代码就是各种使用回调函数。
至于为什么nodejs天生支持异步编程函数，就是在实际编程中为何将回调函数传入某些库函数之后会发生什么事情？
其实本质上就是libuv的功劳，大概的原因就是用多线程和阻塞IO来模拟异步。


## 使用c++为node写扩展

写扩展说起来很屌，但是其实在node里面，重点主要是要了解v8的相关api，
了解v8里面定义的Handle，Scope等概念，依样画葫芦即可。

作为练手将之前写的[CppJieba]包装了一下，成了[NodeJieba]，算是能用，但是因为也是node新手，很多不好的地方之后再慢慢完善了。 [详见这里](https://github.com/yanyiwu/nodejieba)

关于具体如何写和如何在npm上发布，[详见这里](http://9.ap01.aws.af.cm/create-and-publish-node-js-c-addon/)

## 还有一些想说的

* CppJieba全写成hpp文件用起来真是爽
* npm 发布和管理项目真心赞

## 参考

* [nodejs代码初探](http://cnodejs.org/topic/4f16442ccae1f4aa270010d7)
* [node.js源码研究—模块组织加载](http://cnodejs.org/topic/4f571a16a680d212781ccf9f)
* [初探Node.js的异步I/O实现](http://www.infoq.com/cn/articles/nodejs-asynchronous-io)

[CppJieba]: https://github.com/yanyiwu/cppjieba.git
[NodeJieba]: https://github.com/yanyiwu/nodejieba.git
