---
layout: post
title:  "CppJieba代码详解"
date:   2014-02-10
categories: jekyll update
---

本博文基于[CppJieba] v2.3.0版本。

## 脉络概要

* 整个项目核心代码全是[hpp]文件，关于hpp文件好处是方便使用，无需链接。
* 使用[cmake]作为项目自动化构建程序。
* 编译器`g++`，当然`clang++`之类的也可以。理论上只要编译器支持`-std=c++0x`即可。
* 项目使用`MIT`证书，所以放心用吧。

## 源码剖析

[CppJieba]的主要目录结构如下：

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
* 而且觉得boost安装其实也蛮麻烦的。每次使用[CppJieba]还需要别人安装一套boost也挺费事。毕竟cpp又不是node.js，有npm可以用。

总之，其实[CppJieba]的很多函数都是因为有了Limonp才可以写的简短起来的。Limonp功不可没。

#### src/Husky/

[Husky]相对比[Limonp]就比较没那么重要了，主要是考虑到一般分词在生产环境中经常都是以服务的形式供人调用。所以加了这么个东西。

#### src/*.cpp

src/下面有且只有两个cpp文件: `segment.cpp , server.cpp`
这两个文件主要是为了生成可执行文件用的，`make`之后在`build/bin/`下面可以找到对应的可执行文件。
也就是说，如果想把[CppJieba]当成一个库来用的话，只需要关心hpp文件即可。一键include，即include即用。

#### src/*.hpp

这里才是项目的__核心__代码。
看这里的代码需要先了解以下的`分词设计思路`。

## 分词设计思路

分词所需要的工作分为下面几点：

* TransCode.hpp : string转换成unicode，以及逆转换。
* Trie.hpp : 将词库字典转换成trie树以便高效查找。
* (MPSegment.hpp, HMMSegment.hpp, MixSegment.hpp, ...) : 各种分词算法的Segment类。

### TransCode

这个看上去简单，其实很关键，因为每次进行分词前，都需要将string decode成unicode，分词完要输出的时候又需要将unicode encode成string。
要知道，在分词算法中，对于句子是按一个字一个字来计算和分词的。所以转换成unicode是完成分词算法的必要前提。

### Trie

Trie也是分词的核心模块。
大部分分词算法都需要依赖词典（工业界依赖的算法几乎全是基于词典的）。

### TrieManager

主要是在某些Segment里面是有不同模块需要同一个Trie，所以让TrieManager.hpp 提供一个单例TrieManager，负责管理trie树。
通过该单例获取trie树时，会先判断是否已经由该字典文件生成了一颗trie树，如果已有则返回已有的trie树，否则重新创建一颗trie树返回。


### Segments

注意到`src/*.hpp`里面各种含有Segment的文件很7个。
其实他们虽然互相有联系，但是在使用的时候其实是互相独立的。

其中：

* `ISegment.hpp` 是接口类。
* `SegmentBase.hpp` 是基类。

由接口类ISegment就可以看出，各个Segment类都提供出cut函数来进行切词。
最常用的是以下这个接口函数:

```
virtual bool cut(const string& str, vector<string>& res) const = 0;
```

SegmentBase主要是含有一些公用函数，减少代码冗余。


#### MPSegment

(Maximum Probability)最大概率法:负责根据Trie树构建有向无环图和进行动态规划算法，是分词算法的核心。

#### HMMSegment

是根据HMM模型来进行分词，主要算法思路是根据(B,E,M,S)四个状态来代表每个字的隐藏状态。
HMM模型由`dict/hmm_model.utf8`提供。
分词算法即viterbi算法。

#### MixSegment

MixSegment是[CppJieba]里面分词效果最好的类(效果分析详见项目的README.md)，之所以叫Mix，其实就是结合使用MPSegment和HMMSegment而已。哈哈。

#### FullSegment

枚举句子中所有可能成词的情况，找出字典里存在的即可。

## 代码细节

### 异常处理

代码中大部分对于错误和异常处理，都使用函数bool返回值来判断。
而不是`try ... catch ...`，这是个人原因，还是偏爱bool返回值。

### 类的初始化风格

注意到本项目中的类的初始化过程都很重要，因为分词之前都是需要载入字典或者模型。
所以几乎每个类都带有`bool init(...)`作为初始化函数。

我们类比了`fstream`类的设计风格。

```
ifstream ifs("filename");
if(!ifs)
{/*错误处理*/}
```

or

```
ifstream ifs;
ifs.open("filename");
if(!ifs)
{/*错误处理*/}
```

所以在Segment中，举例MixSegment这个类的使用初始化方法如下：

```
MixSegment segment("../dict/jieba.dict.utf8", "../dict/hmm_model.utf8");
if(!segment)
{/*错误处理*/}
```

or 

```
MixSegment segment;
segment.init("../dict/jieba.dict.utf8", "../dict/hmm_model.utf8");
if(!segment)
{/*错误处理*/}
```

## 单元测试

使用的是google的单元测试框架[gtest]。
单元测试写的也还算全，考虑到好多人看项目用法都是从单元测试入手了解每个类的，所以我想对那些人说三个字：可以的。


## 最后总结

新年快乐

[cmake]:http://zh.wikipedia.org/wiki/CMake
[hpp]:http://baike.baidu.com/view/3779455.htm
[CppJieba]:https://github.com/aszxqw/cppjieba
[Limonp]:https://github.com/aszxqw/limonp
[Husky]:https://github.com/aszxqw/husky
[gtest]:https://code.google.com/p/googletest/
