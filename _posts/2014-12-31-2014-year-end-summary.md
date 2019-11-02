---
published: true
layout: post
title:  "2014年终总结"
date:   2014-12-31
category: life
---

# 2014年终总结

## 书籍和电影

+ {Redis设计与实现}
这本书在技术圈很有名了已经，我看的已经算比较晚的，非常值得一读。
让人不得不佩服作者[黄健宏]对Redis源码的掌握程度，而且现在Redis源码基本覆盖了各方面技术，
高效的数据结构，存储和压缩，异步和事件驱动，分布式存储各个方面都有涉及到，
总有值得你学习的地方。
+ {互联网广告算法和系统实践}
是我在手机上第一次付费阅读的书籍，非常科普的一本书，通俗易懂。
很适合手机阅读这种场景下快速阅读。
+ {黑客与画家}
盛名之下，其实难副。我一点都不觉得这本书属于有多么值得阅读，
除了书名比较 geek 之外，没有看到太大亮点，亢长，真正有价值的观点不多。
+ 其他一些中规中矩的技术文档书籍等，就没什么好说的。

+ {绣春刀} 今年唯一一部让我看完之后，不时会回想和揣摩编剧含义的好电影。

## 生活方面

+ 生活方面最大的变化就是把和女朋友的关系向双方父母都公开了，
刚开始面临了一些压力，但是也算是顺利渡过了，
见过丈母娘，女朋友从厦门辞职回来北京，
在公司附近租了一间主卧一起生活，
下班后的生活开始有家的感觉了。
+ 心态方面的变化也比较大，对很多事情看得比较开了，
人生的每个阶段每个位置都会有不同的利益竞争者，
但是很多事情其实没必要去争，而且今年最大的心态变化就是做到了主动避免去争。
做好本分工作就是了，【路遥知马力，日久见人心】。

## 移动互联网

+ {Smartisan T1} 今年我眼里的最佳产品，用户体验的追求没有极限，很多小细节让我总是不禁会想：
需要多么丧心病狂的人，才能那么极致的追求每一个细节的用户体验？
有兴趣的请看我的另一篇博文 [锤子科技 Smartisan T1] 。
+ {多看阅读}&{百度阅读} 很可能改造整个出版业，iOS 上的{百度阅读}体验奇佳。安卓上{多看阅读}的软件体验较好。
这两者让我对电子阅读的印象大大提高，记得之前买 iPad 的一个很重要的愿望就是希望能增加自己对电子书的阅读。
可是当时的 PDF 阅读还是体验太差了，而手机上的多看(百度)阅读非常的好，
以至于我居然用它们看了不少技术书籍。

其实关于移动互联网的话，应该有很多产品值得一说的，
但是其实想想，相对比起来锤子科技给我的惊喜，其他产品都没什么好谈的。


## 开源方面

下面是今年关注并且比较有收获的项目：

+ {golang} 令人兴奋的一门语言，请看{[golang初体验]}。
+ {docker} 重新定义软件的部署和交付，很期待docker的前景。
+ {erlang} 以分布式架构师的角度开发代码，让我感觉 {erlang} 其实不是一种编程语言，
而是一种让人类和机器集群以最通畅方式交流的人工智能，
最大限度的帮你包办它能做的一切，消息分发，天生自带RPC通信，进程端口映射，代码热切换。
很多不同于其他语言的惊喜。不过问题也有，文档稀少，调试不便，不易上手。
+ {[weed-fs]}
非常惊艳的分布式存储开源项目，
使用 golang 开发，
折腾过 fastdfs, moosefs, tfs 
之后再遇到 [weed-fs] ，
非常惊喜分布式存储还可以如此简洁高效。
+ {[icomet]} ideawu 的代码风格我非常欣赏，干净不啰嗦，实用不装逼，虽然没有直接使用[icomet]，但是借鉴了[icomet]，受益匪浅。
+ {libevent} epoll 很牛逼，但是功能太过简单，
除非你要写一个 Nginx 性能级别的服务器，否则直接使用 epoll 还是太过底层，诸多不便，
而{libevent}就是更好用的{epoll}，他帮你包装了各种 buffer 和 event，也提供了更加高层的 http 和 rpc 等接口，
可以让你脱离底层细节，更加专注于服务的其他核心功能的实现。
+ {[ejabberd]}
分布式消息通信引擎，
erlang 开发，
使用 erlang 自带的分布式数据库 mnesia 作为消息的存储引擎，
天生分布式。
+ {[Nginx]}
写过 Nginx 的扩展插件，通过给 Nginx 写扩展还是能学到不少东西，
详细请看之前写过的博文 [Nginx模块开发的那些事] 。

不过2014年最让我眼前一亮的还是golang，期待golang的未来。

## 新年展望

翻看2013年总结时候写的新年展望，简单写了几个对自己技术的期望，
没想到基本上都实现了（原因主要还是当时写的太简单了吧）。

- 在分布式系统方面能有更进一步的深入实践，比如更加深入地给 [weed-fs] 贡献代码。
- 在 golang 编码方面能有更多实践。
- 在数据库方面有更进一步的深入实践，比如能对 [goleveldb] 提交些 pull request 。
- 拓宽技术的广度，适当走出自己的技术舒适区。
- 认识更多志同道合的朋友。

至于工作的话，对于现在所处的创业团队很满意，希望来年团队能走的更快更稳吧。
至于生活的话，明年的主要任务应该是订婚吧，希望一切顺利。

[golang初体验]:http://yanyiwu.com/work/2014/08/11/golang-chutiyan.html
[weed-fs]:https://github.com/chrislusf/weed-fs
[icomet]:https://github.com/ideawu/icomet
[docker]:http://www.docker.com/
[锤子科技 Smartisan T1]:http://yanyiwu.com/life/2014/12/07/smartisan-t1.html
[thrift]:https://github.com/apache/thrift
[libevent]:https://github.com/nmathewson/Libevent
[Nginx]:https://github.com/Nginx/Nginx
[ejabberd]:https://github.com/processone/ejabberd
[ideawu]:https://github.com/ideawu
[Nginx模块开发的那些事]:http://yanyiwu.com/work/2014/09/21/Nginx-module-development-stuff.html
[weed-fs]:https://github.com/chrislusf/weed-fs
[icomet]:https://github.com/ideawu/icomet
[golang初体验]:http://yanyiwu.com/work/2014/08/11/golang-chutiyan.html
[黄健宏]:http://huangz.me/
[goleveldb]:https://github.com/syndtr/goleveldb

