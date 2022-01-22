---    
published: true
layout: post    
title: Asch源码base模块基础之共识
date: 2018-02-08
category: work    
display: onlydetail
---    

# Asch源码base模块基础之共识

<center>  
<img src="http://images.yanyiwu.com/xas.jpg" class="photo"></img>  
</center>  

在 [Asch源码阅读:启动过程概述] 中，我们提到 init.js 初始化中的一个步骤就是初始化 base 模块。
在这里稍微展开谈谈 base 模块具体是什么，base 模块代码对应的目录是 ./src/base/ ，在此目录下主要有以下几个模块：

+ consensus.js
+ account.js
+ block.js
+ transaction.js

base 也是核心源码目录，但是可能容易会把 ./src/base/ 和 ./src/core/ 混淆，觉得为什么两个目录代码都是核心代码，但是为什么分开？

其实很简单区分，./src/base/ 主要是提供一些基础的操作函数，供其他模块调用，本身并不是事件触发，也没有任何事件回调函数。

而 ./src/core/ 的核心模块基本上都是事件触发，注册了各种 onBind, onNewBlock 之类的事件回调函数。

记住这点就不容易混淆了。

下面逐个谈谈具体模块负责的事情：

『consensus』

这个模块负责『共识』，或者叫一致性吧，其实很简单，就是让各个节点达成一致。而不分叉。共识是区块链的核心之一。

主要有以下几个功能函数：

「createVotes」

创建投票，先根据block的高度和id算出hash值，
然后使用当前节点配置里合法的受托人的密钥进行签名，一般一台服务端只配置一个受托人节点。
最后返回一个带有当前 block 高度，多个受托人签名的Votes 。
其实这里把 Votes 翻译成投票不是非常合理，更准确的说，
其实这个 Votes 就是受托人的记账，后续会在 block 生成的时候使用这个 Vote 去验证，包括新生成一个区块之后，广播到其他节点的时候需要广播区块信息和这个Vote信息给其他节点。
这样其他节点可以都可以验证这个 Vote 和 Block，确保 Block 的锻造过程是由合法的受托人通过正确的方式锻造出来的。 

「hasEnoughVotes」

检查Votes是否包含足够多的受托人签名，
目前受托人人数是101，需要的签名至少 101 x 2 / 3 = 68 个受托人。
也就是说如果当时在线的受托人人数不满68人，则无法让这个区块链正常产块。

「hasEnoughVotesRemote」

Votes需要包含至少6个受托人签名才行。这个判断比上面那个 hasEnoughVotes 要求更轻一些。

「setPendingBlock」

要理解这个函数其实需要先理解 block 的锻造过程(core/blocks.js)，

在block的锻造过程中，首先会判断 hasEnoughVotes 是否有足够的受托人签名（如上所述，所需受托人签名至少68人）,

但是一般一个受托人节点，只会有一个受托人密钥，那其实是在锻造的时候
是不满足 >= 68 个签名的要求的，
所以会先把锻造的 block 先寄存起来，也就是 setPendingBlock 寄存起来。

然后会 createPropose 并广播到其他节点，
其他节点收到 Propose 之后会调用它们的 createVotes 生成它们的 Votes，
然后把它们的 votes 发送回来给 propose 发起者的 ip 。
这样，发起这个 Propose 的节点会收到其他节点的 votes, 
也就能集齐超过 68 个受托人的 signatures, 就有足够的 signatures ，
则满足 hasEnoughVotes 的条件，
然后再把这个 PendingBlock 取出来，然后真正完成这个block的区块锻造。

这个过程是打成共识的一个过程，但是在达成共识的等待时间里面，
需要这么一个 setPendingBlock 存储中间结果的过程。

「createPropose」

如上所述，当本节点发现自己受托人签名不满足锻造区块所需签名数量的时候，
会通过 createPropose 创建 Propose 并广播到其他节点，收集其他节点的受托人签名。

**以上详解稍微零散一些，接下来大概总结一下整体的共识流程**

『共识流程总结』

1. 在受托人A锻造区块的时候，负责这一次区块锻造的受托人节点，首先需要用他的签名创建 votes (createVotes)。
2. 但是这个受托人节点一般只有一个受托人密钥，所以不满足101x2/3=68 这个条件，无法顺利锻造这个区块 (hasEnoughVotes)。
3. 所以这个受托人只好先把这个锻造的区块 setPendingBlock 暂时寄存起来。
4. 然后通过 createPropose 去广播给其他受托人节点，去收集其他受托人节点和该区块有关的签名。
5. 其他受托人验证这个Propose来路之后纷纷响应，把自己给这个区块的签名Votes发回给一开始的受托人A 。
6. 然后受托人A一直收集，直到收集到的签名超过了101x2/3=68个之后，再把刚才寄存的block通过 getPendingBlock 取出来。
7. 继续完成了这个block的锻造。

其实如果看懂了这个consensus，基本上也就看懂了 core/blocks.js 整个区块锻造过程了。

接下来下一篇文章会继续分析 base模块中的其他三个子模块。

[Asch源码阅读:启动过程概述]:https://yanyiwu.com/work/2018/02/05/source-code-asch-init.html
