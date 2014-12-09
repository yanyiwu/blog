---
published: false
layout: post
title:  "异步IO高并发服务之Libevent"
date:   2014-12-10
category: work
---

## 简介

说道异步IO,高并发之类的名词，
可能很多人第一反应就是 select, poll, epoll, kqueue 之类的底层代码库。
但是其实除非你要写一个 Nginx 性能级别的服务器，
否则直接使用 epoll 之类的还是太过底层，
诸多不便，要榨干整个异步编程的高并发性能还需要开发很多相关组件，
而 [Libevent] 就是作为更好用的高性能异步编程网络库而生，
他帮你包装了各种 buffer 和 event，
甚至也提供了更加高层的 http 和 rpc 等接口，
可以让你脱离底层细节，更加专注于服务的其他核心功能的实现。
当然，要真正用好它，还是需要懂不少关于他的实现原理。

如果是第一次接触 [Libevent] 的可以先看一篇非常好的入门文章：
[Libevent-book] ，
文章主要从 C10K 问题的发展循序渐进，
分别讲了在高并发连接的情况下，
多线程解决方案，
多进程解放方案会遇到的问题，
从而引出为什么异步IO是当前解决高并发连接最有效的方案。

## 

[Libevent]:
[Libevent-book]:http://www.wangafu.net/~nickm/libevent-book
