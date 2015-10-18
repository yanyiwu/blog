---
published: true
layout: post
title:  C++ 单元测试之 gmock 使用『指北』
date:   2015-10-18
category: work
---

<center>
<img src="http://7xloce.com1.z0.glb.clouddn.com/p2273115476.jpg" class="photo"></img>
</center>

单元测试往往需要借助 Mock 出一些对象，才能进行完整的单元测试。

比如当一个 Engine 类里面有个函数需要调用一个 MysqlClient 去查询 MySQL，
但是我们在单元测试中想测试这个引擎类，总不能每次单元测试前都打开对应需要的数据库吧？那就不叫单元测试了。
所以需要 Mock，搞出一个 MockMysqlClient 类去在单元测试中替代 MysqlClient 进行测试。
如果我们手动的去写 MockMysqlClient 那太累了，
我们需要借助库来解决生产力，
在 C++ 中，对应的工具就是 gmock 库。

很多刚开始用 gmock 写单元测试的人会觉得很难，
最主要的问题不是 gmock 本身有点晦涩，
而是他们对 mock 测试本质上要解决的核心问题不太理解。
所以在单元测试中容易被测试的问题绕晕。

Mock 的本质是：『狸猫换太子』。 

就像刚才所说的，当我们要对Engine进行单元测试，
而 Engine 需要用到 MysqlClient 的时候，
因为 MysqlClient 依赖的外界的数据库，妨碍了我们单元测试。
所以我们需要切断这个依赖。『没有依赖，就没有伤害。』
切断依赖的过程中我们需要解耦，解耦就需要接口。
针对 C++ 来说的话，我们就需要 MysqlClientInterface 这个接口类，
然后让 MysqlClient 和 MockMysqlClient 都实现这个接口。

然后在 Engine 里面使用的是 MysqlClientInterface 这个接口，
具体 MysqlClientInterface 指针指向谁，是在 Engine 的构造函数里面制定。
所以在正常单元里面我们传入给 Engine 的 MysqlClient ，
而在单元测试代码里面我们传入的就是 MockMysqlClient 。
也就是说，在单元测试代码里面，我们用 MockMysqlClient（狸猫）偷换了 MysqlClient（太子）。

接下来的问题就是如何实现 MockMysqlClient 呢？
『为什么说手写 MockMysqlClient 会累死呢？』
因为 MysqlClient 里面的函数我们在 MockMysqlClient 类里面都要实现，
但是实现是很机械的实现，假设输入是什么的时候，输出是什么，而不是真的去调用数据库查询。
这些机械的实现在 gmock 里面已经很好的帮我们实现了。

而且 gmock 还帮我们实现了 `EXPECT_CALL` ，我们能针对某些测试样例写对应的函数输入输出的预期。
假设其输入，然后验证其输出。包括验证函数的调用次数等。
具体请看我写的一个简单示例：『[gmock-practice]』。
我举得写的还是比较清楚的。看懂了之后基本上也就全理清楚了。
剩下的就是熟悉 gmock 的 api 们了。

『题图』和本文无关，是最近上映的『夏洛特烦恼』的一个场景。
这部电影堪称经典，又搞笑又让人想流泪，
如果硬要类比一部之前的经典电影的话，
可能我只能联想到『大话西游』。
而且台词没一句废话，笑点密度巨高，良心之作。
建议每个人都去看看。

[gmock-practice]:https://github.com/yanyiwu/practice/tree/master/cpp/gmock
