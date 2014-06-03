---
layout: post
title:  "记一次使用gprof进行性能优化"
date:   2014-02-09
category: work
---

gprof是linux下进行性能优化的神器

## 记一次性能调优的经历

之前在开发CppJieba的时候性能上直觉上感觉不够快。
使用了这个gprof来检测了一下，发现某个函数里面的vector的`push_back`被频繁调用。
仔细看了一下发现，这个函数里面有个算法是O(n^2)。
也就是在两个for里面频繁`push_back`。

后来进行了优化，具体的过程我忘了，大概就是将这个vector抽离出来，不需要每次进来这个函数都进行vector的初始化，然后再慢慢`push_back`等。优化之后整个CppJieba的分词速度提高5~6倍。

## gprof的使用方法

1. 在编译和链接中添加`-pg`选项（注意在链接中也要添加）
2. 像往常那样运行你的可执行文件(比如./a.out)，当前目录会出现`gmon.out`这个文件。
3. `gprof a.out gmon.out > profile.out`，这个`profile.out`就是你需要分析的函数调用耗时。

比如现在得到的一份profile.out如下：

```
Flat profile:

Each sample counts as 0.01 seconds.
  %   cumulative   self              self     total           
 time   seconds   seconds    calls   s/call   s/call  name    
 50.64      1.60     1.60    13130     0.00     0.00  CppJieba::MPSegment::_calcDAG(__gnu_cxx::__normal_iterator<unsigned short const*, std::vector<unsigned short, std::allocator<unsigned short> > >, __gnu_cxx::__normal_iterator<unsigned short const*, std::vector<unsigned short, std::allocator<unsigned short> > >, std::vector<CppJieba::SegmentChar, std::allocator<CppJieba::SegmentChar> >&) const
 20.89      2.26     0.66    13130     0.00     0.00  CppJieba::MixSegment::cut(__gnu_cxx::__normal_iterator<unsigned short const*, std::vector<unsigned short, std::allocator<unsigned short> > >, __gnu_cxx::__normal_iterator<unsigned short const*, std::vector<unsigned short, std::allocator<unsigned short> > >, std::vector<std::vector<unsigned short, std::allocator<unsigned short> >, std::allocator<std::vector<unsigned short, std::allocator<unsigned short> > > >&) const
  6.33      2.46     0.20  5987780     0.00     0.00  std::_Hashtable<unsigned int, std::pair<unsigned int const, CppJieba::TrieNodeInfo const*>, std::allocator<std::pair<unsigned int const, CppJieba::TrieNodeInfo const*> >, std::_Select1st<std::pair<unsigned int const, CppJieba::TrieNodeInfo const*> >, std::equal_to<unsigned int>, std::hash<unsigned int>, std::__detail::_Mod_range_hashing, std::__detail::_Default_ranged_hash, std::__detail::_Prime_rehash_policy, false, false, true>::_Hashtable(std::_Hashtable<unsigned int, std::pair<unsigned int const, CppJieba::TrieNodeInfo const*>, std::allocator<std::pair<unsigned int const, CppJieba::TrieNodeInfo const*> >, std::_Select1st<std::pair<unsigned int const, CppJieba::TrieNodeInfo const*> >, std::equal_to<unsigned int>, std::hash<unsigned int>, std::__detail::_Mod_range_hashing, std::__detail::_Default_ranged_hash, std::__detail::_Prime_rehash_policy, false, false, true> const&)
```

自动是按耗时百分比来排序，所以一般分析前几个就函数调用即可。
第一个函数`CppJieba::MPSegment::_calcDAG`确实耗时较大。
就可以针对性的优化这个函数。
如果没有gprof，有时候就不容易肉眼看出来哪个函数需要优化。

关于gprof我也是初次使用，很多选项具体还不知道什么意思。以后有新的优化需求再查查手册吧。

## 关于性能优化的想法

gprof本身也只是工具，关键还是要自己会分析程序的瓶颈在哪，正如云风大神说的好的程序员就应该对性能瓶颈有良好的直觉。
个人感觉主要还是要重视28法则吧，百分之二十的代码耗费百分之八十的性能。优化的时候抓住代码重点，否则很容易浪费时间。
