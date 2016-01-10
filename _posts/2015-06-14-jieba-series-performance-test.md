---
published: true
layout: post
title:  "\"结巴\"(Jieba)中文分词系列性能评测"
date:   2015-06-14
category: work
---

总是有人会问说 [CppJieba] 性能如何啊之类的，有没有什么评测啊之类的，
一直没有仔细对比过并不是因为对自己的代码没信心，主要是觉得性能评测本身是一件很费工夫的事情，
因为要考虑到分词的算法是否一致，分词的词库是否一致，分词的用法是否正确，这个过程得做到白盒测试才是公平的。

不过最近把 [NodeJieba] 1.0 版本完成之后，突然好奇的想对比一下 [NodeJieba]
和 [CppJieba] 的性能，毕竟 [NodeJieba] 是 [CppJieba]+V8+js 搞出来的，理论上后者肯定更低，但是低多少就让我很好奇了。所以就开始了性能测试。
然后测完之后就想顺便也把 [Jieba] 和 [Jiebago] 也测了，毕竟我对 Python 和 go 也都熟悉。
测起来不费事。其他语言的暂且不测了。

## 性能测试

测试机器是同一台机器，低配MacBookAir。

测试过程也是一样：

先按行读取文本[围城]到一个数组里，然后循环对围城每行文字作为一个句子进行分词。因为只对[围城]这本书分词一遍太快了，容易误差。
所以循环对[围城]这本书分词50次。基本上每次分词耗时都很稳定。
分词算法都是采用【精确模式】

【耗时数据平均值如下，从低到高排序。】

+ C++版本 [CppJieba] 7.6 s 
+ Node.js版本 [NodeJieba] 10.2 s
+ go语言版本 [GoJieba] 9.12 s
+ go语言版本 [Jiebago] 67.4 s
+ Python版本 [Jieba] 89.6 s

注明：以上耗时都是计算分词过程的耗时，不包括词典载入的耗时。

测试的源码分别如下：

+ [CppJieba Performance Test] 基于 [CppJieba] 版本 v3.0.0
+ [NodeJieba Performance Test] 基于 [NodeJieba] 版本 v1.0.3
+ [GoJieba Performance Test] 基于 [GoJieba] 版本 v0.9.3
+ [Jiebago Performance Test] 基于 [Jiebago] 版本 v0.3.2
+ [Jieba Performance Test] 基于 [Jieba] 版本 v0.32

这些时间数据本身没什么意义，因为在不同机器上跑出来的都不一样。
但是他们之间的对比是有意义的。

拿最低的基准数据 CppJieba 的耗时 7.6s 作为参照物。那么其他程序的耗时分别是：

+ [NodeJieba] = 1.34 * [CppJieba]
+ [GoJieba] = 1.2 * [CppJieba]
+ [Jiebago] = 8.86 * [CppJieba]
+ [Jieba] = 11.79 * [CppJieba]

【结果分析】 

+ [CppJieba] 性能最高这个符合我的预期，因为自己在它的开发过程也一直在考虑性能方面。
+ [NodeJieba] 是 [CppJieba] 包装而来的，所以我觉得耗时在1倍多一点是正常的。
+ [GoJieba] 和 [NodeJieba] 同理，也是 [CppJieba] 包装而来的，所以我也觉得耗时在1倍多一点是正常的。
+ [Jiebago] 这么高的耗时就完全不正常了，毕竟是go语言写的，简单翻阅过源码，可优化空间还是很大的。
+ [Jieba] 耗时确实比较多，应该也有不小的优化空间，但是我想说的是，性能不是唯一标准，简单易用也很重要，[Jieba]依然非常优秀的国产开源软件明星。

## 最后

这次的评测只是纯洁的各语言版本的实现评测，希望不要陷入语言孰优孰劣的争论，没什么意义。

[CppJieba]:https://github.com/yanyiwu/cppjieba
[NodeJieba]:https://github.com/yanyiwu/nodejieba
[GoJieba]:https://github.com/yanyiwu/gojieba
[Jiebago]:https://github.com/wangbin/jiebago
[Jieba]:https://github.com/fxsjy/jieba

[CppJieba Performance Test]:https://github.com/yanyiwu/cppjieba/blob/master/test/load_test.cpp
[NodeJieba Performance Test]:https://github.com/yanyiwu/practice/blob/master/nodejs/nodejieba/performance/
[GoJieba Performance Test]:https://github.com/yanyiwu/practice/blob/master/go/gojieba/performance/
[Jiebago Performance Test]:https://github.com/yanyiwu/practice/blob/master/go/jiebago/performance.go
[Jieba Performance Test]:https://github.com/yanyiwu/practice/blob/master/python/jieba/performance.py

[围城]:https://github.com/yanyiwu/practice/blob/master/nodejs/nodejieba/performance/weicheng.utf8
