---
layout: post
title:  "CppJieba代码详解"
date:   2014-02-10
categories: jekyll update
---

# CppJieba 项目代码详解

想写这篇已经很久了，而且有些朋友说过希望我讲讲[CppJieba]的代码架构。
趁这两天没什么事，写这篇文章算是总结和备忘吧。

本博文基于CppJieba v2.3.0版本。

## 脉络概要

* 整个项目核心代码全是[hpp]文件，关于hpp文件好处是方便使用，无需链接。
* 使用[cmake]作为项目自动化构建程序。
* 编译器`g++`，当然`clang++`之类的也可以。理论上只要编译器支持`-std=c++0x`即可。
* 项目使用`MIT`证书，所以放心用吧。

## 源码剖析

CppJieba的主要目录结构如下：

```
|- src
    |- Limonp
    |- Husky
|- test 
    |- unittest : 单元测试，使用了google的单元测试框架gtest。
    |- testdata : 测试数据。
|- dict   : 分词中初始化时候需要加载的字典。
|- conf   : 分词服务启动需要的配置文件。
|- script : 分词服务启动需要的脚本文件。
|- build  : 自动化构建的时候手动`mkdir`出来的，详见[CppJieba]的`README.md` 。
```

### src/

#### src/Limonp/

[Limonp]是我自己写的常用cpp工具库。

其实在cpp开发中，不知道其他人有没有这种体会：cpp开发效率低的一个很重要的原因是可用的库太少。
比如日志模块，数据库连接模块，字符串切割，md5签名等，标准库都不支持。

* 比如我需要的是一个很简单的日志库，在python中，直接`import logging`就可以使用。在cpp中，就需要自己网上搜，然后再自己整合进去。其实找到自己满意的日志库所花费的时间，还不如直接写一个来得快。
* 比如unicode和utf8的转换，cpp也不支持，刚开始用网上搜的一份代码，居然错误处理不够好。开发中正常，上线之后直接给我`core dump`了真心无语。只好自己怒写了一份。
* 还有比如我们定义了`vector<pair<string, double> > vec;`，在调试代码的时候(`linux+vim`)，无法`cout<<vec<<endl;`来查看vec的内容是否正确(当然用VS这类IDE开发的就没有这类烦恼), 通过自己重载了一些 `<<` 操作符，我在调试的时候直接`print(vec);/*print 也是Limonp里面写的一个宏*/` 即可。


当然可能有人会问，为什么不用boost之类的库呢？

* 因为个人觉得这些工具函数自己写其实也蛮快的，省的再去谷歌找boost的相关函数用法。
* 而且觉得boost安装其实也蛮麻烦的。每次使用CppJieba还需要别人安装一套boost也挺费事。毕竟cpp又不是node.js，有npm可以用。

总之，其实CppJieba的很多函数都是因为有了Limonp才可以写的简短起来的。Limonp功不可没。

#### src/Husky/

这个就比较没那么重要了，主要是考虑到一般分词在生产环境中经常都是以服务的形式供人调用。所以加了这么个东西。

#### src/*.cpp

src/下面有且只有两个cpp文件: `segment.cpp , server.cpp`
这两个文件主要是为了生成可执行文件用的，`make`之后在`build/bin/`下面可以找到对应的可执行文件。
也就是说，如果想把CppJieba当成一个库来用的话，只需要关心hpp文件即可。一键include，即include即用。

#### src/*.hpp

终于到了项目的__核心__代码。

歇会儿，未完待续。



[cmake]:http://zh.wikipedia.org/wiki/CMake
[hpp]:http://baike.baidu.com/view/3779455.htm
[CppJieba]:https://github.com/aszxqw/cppjieba
[Limonp]:https://github.com/aszxqw/limonp
[Husky]:https://github.com/aszxqw/husky
