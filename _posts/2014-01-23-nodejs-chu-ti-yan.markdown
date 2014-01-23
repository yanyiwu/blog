---
layout: post
title:  "node.js初体验和使用c++写node.js扩展尝试"
date:   2014-01-23
categories: jekyll update
---

node.js是一直想探索的一个开源项目。
这几天闲来无事看了一些相关tutorial，并将中文分词[CppJieba]整合进去可以让node.js调用。

## node 初体验

node是著名的__异步IO高并发单线程网络服务__

从node/deps这个目录下就可以看到大概node的整体思路:
* `v8`   : google出品的js引擎
* `uv`   : 跨平台的网络事件库
* others : 其他就是作为工具类，比如http参数解析，ssl加密等。

首先注意到node是单线程的，但是却是高并发的，这两者看似矛盾，但是也不难理解。主要是归功与uv这个库，uv本质上就是一个事件驱动的库。

可以把uv理解为是对epoll之类的一个封装，epoll就是一个高并发的事件驱动的IO多路复用网络服务器。
或者，直接理解为中断信号编程，我们注册一些事件，当这些事件发生的时候，系统自动调用我们注册好的事件回调函数。
这样的好处是非阻塞，同时也方便做到高并发，所以在开发nodejs的时候和一般的开发不一样，把可能耗时较多的函数注册成回调函数。

所以按我的理解，node其实可以看成是一个c++写好了若干网络服务库，但是引入了v8，让我们可以简单的使用js来调用这些牛逼的服务库，嗯，就是这样。

## 使用c++为node写扩展

写扩展说起来很屌，但是其实在node里面，重点主要是要了解v8的相关api，
了解v8里面定义的Handle，Scope等概念，依样画葫芦即可。

作为练手将之前写的[CppJieba]包装了一下，成了[NodeJieba]，算是能用，但是因为也是node新手，很多不好的地方之后再慢慢完善了。



## 还有一些想说的

* CppJieba全写成hpp文件用起来真是爽
* npm感觉不好用，慢成狗。而且没有进度条，经常不知道是卡死了还是网速慢而已。

[CppJieba]: https://github.com/aszxqw/cppjieba.git
[NodeJieba]: https://github.com/aszxqw/nodejieba.git
