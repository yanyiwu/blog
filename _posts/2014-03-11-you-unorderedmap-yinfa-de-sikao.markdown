---
layout: post
title:  "由unordered_map引发问题的思考"
date:   2014-03-11
categories: jekyll update
---

## 问题的产生

这两天在重构之前写的评价分析的项目（C++），边重构变写相关的单元测试。
单元测试的粒度更细了，因此发现了一些问题。
其中一个问题比较诡异，在不同机器上出来的结果不同。也就是表现为在某些机器上单元测试可以通过，在某些机器上不行。

依次怀疑过__x64和x86架构关系，g++版本问题，多线程问题，C++未定义行为问题等__。

经过排查最后才锁定在`unordered_map`上有__实现不一致__的问题。
(当然排查出来的结果很简单，但是其实排查的过程很累很崩溃，因为这个问题是隐藏在整个项目的底层库代码里面。)

`unordered_map`在迭代器遍历时候key,value出现的顺利是未定义，注意，是__未定义__，不是未排序。
比如对于`{"key1":1.12, "key2":1.12}`这样的字典。
有的机器迭代输出的结果是`{"key1":1.12, "key2":1.12}`，而有的机器则是`{"key2":1.12, "key1":1.12}`。
也就是迭代结果和`unordered_map`__实现版本__或者是__机器环境__有关。

当然也是我本身使用`unordered_map`的时候不够细心，明知道`unordered_map`的迭代顺序是unorder的，开发的时候觉得反正不影响。
但是其实在某些细小的case中是会连锁导致上层应用出来的结果是不一致的。

对于C++中使用map比较蛋疼的，stl里面的map是红黑树的实现，其实插入和查找的效率并不高。
所以对于插入和查找效率高的情景中，一般是使用hash实现的map。

在C++中，C++0x标准是推荐使用stl里面的`unordered_map`。
在Java中，记得TreeMap和HashMap就是对应红黑树实现和hash实现两种。


定位好了bug所在之后，最后解决的办法是在某些地方使用`map`代替掉`unordered_map`来解决这个问题。

值得一提的是，进行压力测试之后发现，程序的速度变快了，差不多速度__提高__了`1/6`。
因为替换map的这些地方，本身对于插入和查询要求不高，反而对于迭代遍历有所要求，比如要转换成`vector`之类的。
所以让我不得不好奇`unordered_map`的迭代效率。


## 关于unordered_map的效率问题

在[cpp\_unordered\_map] 中对于`unordered_map`有一段说明如下：

> unordered_map containers are faster than map containers to access individual elements by their key, although they are generally less efficient for range iteration through a subset of their elements.

这段英文按我的理解就是`unordered_map`的快速插入和快速查找都是没有问题的，只不过对于__迭代器遍历的速度__恐怕会__相比低效__一些。

众所周知的是，map的迭代输出是树的中序遍历，因此保证有序，且效率还行。
照理说如果`unordered_map`如果内部维护一个`list`则遍历的效率也会很快。
但是没有深入研究过它的实现源码，就是不知道实现者有没有多维护一个`list`来避免连空bucket也遍历进去。

但是其实对于使用者来说，其实如果本身对遍历要求很苛刻的话，完全可以自己维护一个`vector`，然后`unordered_map`的值只是一个指向`vector`元素的指针。就能保证遍历效率了。

但是其实主要是看是否是__性能瓶颈__了，毕竟根据性能的__82定律__，多愁善感地忙活优化那无关紧要的百分之八十非瓶颈代码，也显得有点浪费时间了。

## 总结

吃一bug长一智吧，具体关于`unordered_map`的源码实现，等有空了再深究吧。

[cpp\_unordered\_map]:http://www.cplusplus.com/reference/unordered_map/unordered_map/
