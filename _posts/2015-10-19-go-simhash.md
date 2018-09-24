---
published: true
layout: post
title:  中文simhash算法库的Golang版本
date:   2015-10-19
category: work
---

<center>
<img src="http://images.yanyiwu.com/GoSimhashLogo-v1.png" class="photo" style="width:60%"></img>
</center>

感觉好像没什么好说的，就是发现自己写的『[simhash]』似乎还挺受欢迎的，
虽然 star 数其实也才刚过百，但是在 GitHub 上面搜 simhash 后出来的结果上已经排到了首位，
而且也老有人咨询 simhash 的一些问题。

有时候想看看某个句子的 simhash 值是多少，在之前写的『[simhash]』库没有可通过参数调试的命令行程序。
但是呢，想在 C++ 版本的 [simhash] 上加上通过命令行传参和配置的话，又挺蛋疼的。
每次调试都要自己 git clone 和 cmake 和 make 什么的一大堆东西。

不过呢，如果是 Golang 语言的话就简单得多了，反正有 `go get` 和 Golang 标准库里面自动支持了 `flag` 。
所以就更简单了，而且我想应该也会有 Golang 开发者有 simhash 库的需求。
所以就有了这个项目『[gosimhash]』。

So, 没别的意思，有需要的朋友拿去试试呗。

simhash 算法原理？看这篇：『[simhash算法原理及实现]』

[gosimhash]:http://github.com/yanyiwu/gosimhash
[simhash]:http://github.com/yanyiwu/simhash
[simhash算法原理及实现]:http://yanyiwu.com/work/2014/01/30/simhash-shi-xian-xiang-jie.html
