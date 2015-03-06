---
layout: sharebutton
title: 时间线
---

&raquo; 2015-03-03 22:45

> - 因为别人找我要简历模板的原因，
重新扫了一眼自己不到一年之前的简历，
才发现自己这几个月确实成长了很多，
希望来年也能有同感。

&raquo; 2015-02-12 16:10

> - [Baby's First Garbage Collector] 是我见过的最好的关于垃圾回收入门的文章，
外国人的文章比国内用心太多了，通俗易懂不装逼。

&raquo; 2015-01-24 14:35

> - Rust 很优秀，
可是感觉基本上是更加安全的C++而已，
把不安全的东西尽量在编译器发现，
差不多是C+++，
而且设计品味上和C++也很像，
就是为了各种听上去高逼格的特性弄得越加复杂。
还是更喜欢go的大道至简。
> - 使用开源项目的时候，
经常都是需要根据自己业务场景进行二次开发。
不需要二次开发的一般只有两种可能：
一种是该项目太牛，比如Mysql之类的;
另一种就是使用者太挫。

&raquo; 2015-01-23 00:07

> - 没得选择会很痛苦，但是选择太多更痛苦。
> - 为什么我总是倾向于选择困难模式的生活。

&raquo; 2015-01-20 22:40

[阿里分布式数据库服务实践] 里有关耗时的笔记，
因为在视频里面有，但是PPT里面没找到，
所以就自己先记下来。

+ L1 cache reference 0.5 ns
+ Branch mispredict 5 ns
+ L2 cache reference 7 ns
+ Mutex lock/unlock 25 ns
+ Main memory reference 100 ns
+ Compress 1K bytes with Zippy 3 us
+ Send 2K bytes over 1 Gbps network 20 us 
+ Read 1 MB sequentially from memory 250 us
+ Round trip within same datacenter 500 us
+ Disk seek 10 ms
+ Read 1 MB sequentially from disk 20 ms
+ Send packet CA->Netherlands->CA 150 ms

&raquo; 2015-01-18 15:43

> - 昨天看了 [ECUG专题回顾] 里面 [@goroutine] 分享的 [豌豆荚分布式REDIS设计与实现] ，真是码农的精神食粮啊。
很久没听到这种专说干货的技术演讲了。
> - 同时也看了 [ECUG专题回顾] 里面的其他技术分享，响马的 fibjs ，谢孟军的 beego，都大有裨益。
不过反而让我反思一个新的学习现象。
假设如果我在现场，每天高强度的连续听这么多技术分享，我觉得我应该会精神上感到疲乏，学习效率不佳，也无法很好的跟进思考。
而虽然我没有去现场，但是事后在悠闲的周末时间，挑选自己感兴趣的技术分享视频来观看。
反而学习效果奇佳。可查资料可暂停可回放。对知识的分享能做到最高效的吸收。
我觉得未来的教育一定会是如此，而不是按部就班的上课。


[Next]

[Next]:http://yanyiwu.com/moments/moment-2.html
[ECUG专题回顾]:http://blog.qiniu.com/?p=871
[@goroutine]:http://www.weibo.com/chuangyiyongpin#1421567595227
[豌豆荚分布式REDIS设计与实现]:http://blog.qiniu.com/?p=871
[阿里分布式数据库服务实践]:http://v.youku.com/v_show/id_XODMyMzk2OTUy.html
[Baby's First Garbage Collector]:http://journal.stuffwithstuff.com/2013/12/08/babys-first-garbage-collector/
