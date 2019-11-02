---
layout: post
title:  "谈谈go语言编程的并发安全"
date:   2015-02-07
category: work
---

# 谈谈go语言编程的并发安全

## 问题起因

在分布式存储开源项目 [Weed-FS] 中，
我发现了一个地方非并发安全(not concurrency-safety)，
所以提交了一个 [Weed-FS-PullRequest-75] 来进行加锁保护。
简化这个问题如下：

> 当有一个变量，
有一个 goroutine 会对它进行写操作，
其他 goroutine 对它进行读操作。 
是否需要对这个变量进行加锁保护。

我觉得不同goroutine并发读写同一个变量，
需要加锁，
这应该是天经地义的常识。
但是这个 PullRequest 居然出乎意料的被作者反驳了。

作者的理由是：
只有一个 goroutine 在写，其他 goroutine 在读，不需要加锁。

但是这样的观点我实在无法苟同，
因为在我的 C/C++ 开发经验中，这是必然需要加锁的典型场景，一般是使用读写锁。
难道是golang在这个方面有一些牛逼的奇淫巧计所以不需要加锁？

所以我耐不住寂寞开始查阅资料，先是官网上的说法。

## go内存模型回顾

这个问题先让我们回顾一下 golang 官网上对于 go 内存模型的[建议]：

> ### Advice

> Programs that modify data being simultaneously accessed by multiple goroutines must serialize such access.

> To serialize access, protect the data with `channel operations` or other synchronization primitives such as those in the `syn`c and `sync/atomic` packages.

> If you must read the rest of this document to understand the behavior of your program, you are being too clever.
Don't be clever.

可以看出其实go的内存模型对于并发安全有两种保护措施。
一种是通过加锁来保护，另一种是通过channel来保护。
前者没什么好说的，
后者其实就是一个线程安全的队列。
在 C/C++ 在多线程编程中经常使用的 BlockingQueue ，
几乎每个开源项目都有自己的 BlockingQueue，
其实实现起来并不难，大部分实现都大同小异，
我在自己的常用库里面也自己实现了一个[BlockingQueue] 。
内部加锁实现。

可能很多人都听说过一个高逼格的词叫【无锁队列】。
都一听到加锁就觉得很low，其实对于大部分程序来说。
根本不需要那些高逼格的技术，该加锁就加锁。
一次加锁的耗时差不多是在几十纳秒，
而一次网络IO都是在毫秒级别以上的。
根本不是一个量级。
特别是在现在云计算时代，
大部分人一辈子都遇不到因为加锁成为性能瓶颈的应用场景。

而且我觉得上面那段Advice里面写意味深长的是最后一句【Don't be clever】，
不要自作聪明。

也就是我的解读是：

go语言编程中，
当有多个goroutine并发操作同一个变量时，除非是全都是只读操作，
否则就得【加锁】或者【使用channel】来保证并发安全。
不要觉得加锁麻烦，但是它能保证并发安全。

不过在 [Weed-FS-PullRequest-75] 上还是说服不了作者，
所以最后在 go-nuts 邮件群组上面发起了这个话题。

## go-nuts 上的讨论

[go-nuts] 上的讨论，打开链接需要自备梯子。
经过讨论后，验证了我的观点是正确的，
所以作者也放心的 Merge 了我的建议 [Weed-FS-PullRequest-79] 。

摘出 [go-nuts] 上有个关于并发安全问题的好文章：[Benign data races: what could possibly go wrong?] 。
还有就是 

```
go run/build/test -race
```

这个命令可以更大概率的复现并发安全问题。
有时候并发安全问题不容易复现。所以即使程序运行正常，
也不能说明就没有并发安全问题。

这让我想起来当时看到酷壳一篇博文[疫苗:Java HashMap的死循环]的时候，
我心里还嘲笑淘宝的人这么搓，
连非线程安全需要加锁都不知道。

没想到原来这么多人对线程安全（在go里面通常叫并发安全）没有清醒的认识，
不只是这个项目里面，包括在相关技术群里面讨论这个问题的时候，
总是有人以为每次读取数据都是原子行为（我怀疑他们可能不理解原子行为是什么），
以为不加锁导致的问题顶多就是读取的数据是修改前的数据罢了。
其实都是典型的误解。


[Weed-FS]:https://github.com/chrislusf/weed-fs
[建议]:https://golang.org/ref/mem#tmp_1
[Weed-FS-PullRequest-75]:https://github.com/chrislusf/weed-fs/pull/75
[Weed-FS-PullRequest-79]:https://github.com/chrislusf/weed-fs/pull/79
[BlockingQueue]:https://github.com/yanyiwu/limonp/blob/master/include/BlockingQueue.hpp
[go-nuts]:https://groups.google.com/forum/#!topic/golang-nuts/zyQnord8hyc
[疫苗:Java HashMap的死循环]:http://coolshell.cn/articles/9606.html
[Benign data races: what could possibly go wrong?]:https://software.intel.com/en-us/blogs/2013/01/06/benign-data-races-what-could-possibly-go-wrong
