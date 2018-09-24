---    
published: true
layout: post    
title: Asch源码core模块之delegates
date: 2018-04-05
category: work    
display: onlydetail
---    

<center>  
<img src="http://images.yanyiwu.com/xas.jpg" class="photo"></img>  
</center>  

## 背景

在上一篇文章 [Asch源码core模块之accounts] 中已经把 ./core 和 ./base 有映射（或者说冗余？）关系的三个模块阅读完。

+ ./core/blocks.js [Asch源码core模块之blocks]  <==> ./base/blocks.js [Asch源码base模块之block创建]
+ ./core/transactions.js [Asch源码core模块之transactions]  <==> ./base/transaction.js [Asch源码base模块之transaction]
+ ./core/accounts.js [Asch源码core模块之accounts] <==> ./base/account.js [Asch源码base模块之Account]

从这篇文章开始阅读 ./core/ 目录下的其他模块，
先从 delegates 开始。

./core/delegates.js 主要负责受托人锻造区块的过程之一，这个过程是Asch的核心过程。
主要是涉及到如何选出当前轮值锻造区块的受托人，和其他一些功能函数。
还包括一些和受托人有关的 http api 查询。

## 源码概况

+ public
    + Constructor(Delegates)
    + getActiveDelegateKeypairs
    + validateProposeSlot
    + generateDelegateList
    + checkDelegates
    + checkUnconfirmedDelegates
    + fork
    + validateBlockSlot
    + getDelegates
    + enableForging
    + disableForging
    + cleanup
+ class
    + Delegate 这个交易类型目前看来似乎没有在使用？ 
+ event
    + onBind
    + onBlockchainReady
+ shared
    + getDelegate
    + count
    + getVoters
    + getDelegates
    + getFee
    + getForgedByAccount
    + addDelegate
+ private
    + getKeysSortByVote
    + getBlockSlotData
    + loop
    + loadMyDelegates

## 源码详解

### onBind

这个事件触发函数仍然是打酱油的。

### onBlockchainReady

这个函数基本上可以算是 core/delegates.js 模块的入口函数。

1. 当 blockchain 从数据库载入完毕之后，调用 loadMyDelegates 载入受托人的密钥对。
2. 并启动定时器 loop 函数，不停检查是否轮到自己产块，如果是，则开始产块。

接下来展开讲这两个过程。

### loadMyDelegates

1. 从配置(比如config.json)中读取 forging.secret 数组，这个 secret 就是 Asch 受托人的密码（12个单词组成）
2. 通过 secret 计算出密钥对，用密钥对中的公钥去 getAccount 获取账号信息。
3. 如果该账号是受托人，则把这个密钥对加入 private.keypairs 这个全局变量中，并且则会成功打出 "Forging enabled on account: " ... 的日志，这个日志是受托人搭建服务器的时候，启动节点后需要检查的重要日志之一，如果没有这个日志。则代表可能你的配置有错。

所以 loadMyDelegates 其实就是 private.keypairs 这个全局变量的初始化过程，
这个全局变量很重要，在 private.keypairs 里面能找到，说明是当前节点里面有效的受托人，
这里的有效代表有密钥对，这个是锻造区块的必要条件。
后面锻造区块的时候就需要用到。

### loop

这个函数取名叫loop不是很准确，主要做了如下工作：

1. slots.getSlotNumber 获取当前slot
2. modules.blocks.getLastBlock 获取最新区块。
3. 通过 getBlockSlotData 找出当前轮到哪个受托人锻造区块，并取出他的密钥对。
4. 把第三步中取到的受托人密钥传入 modules.blocks.generateBlock 进行区块的锻造。

总结一下，这个函数最重要的就是找出当前需要锻造区块的受托人，
然后调用 modules.blocks.generateBlock 进行区块的锻造。
至于 modules.blocks.generateBlock 的区块锻造过程，可以参考之前的文章 [Asch源码core模块之blocks]

### getBlockSlotData

1. 通过 generateDelegateList 从数据库中找出 101 个vote数量最多的账号公钥。
2. 通过 slots.getLastBlock 获取下一个slot，下一个slot的计算方式就是当前slot + 101 ，101就是受托人的数量。
3. 遍历 currentSlot 到 lastSlot 这 101 个 slot ，找到第1步中对应的受托人账号，如果这个受托人账号已经在我们的 private.keypairs 注册过，则返回对应的 private.keypairs 中的密钥对。

所以其实这个函数就是先计算现在轮到哪个受托人锻造区块了，
如果发现当前需要锻造的受托人密钥就在本节点，则取出该密钥，
准备后续的锻造工作。

### generateDelegateList

1. 通过 getKeysSortByVote 从数据库中找出101个vote数量最多的账号公钥。
2. 并且对这101个受托人公钥列表进行随机排序。
    1. 注意，这里的随机排序不是完全随机，和当前高度有关的随机排序，也就是说对于相同高度的节点，generateDelegateList 后获得的随机排序后的公钥列表都是一样的。

*以上就是 onBlockchainReady 入口函数串联起来的各个函数*

接下来介绍其他函数。

### http api

+ /api/delegates
    + /count 返回当前受托人数量
    + /voters 投票给这个受托人的用户们
    + /get 获取指定受托人信息
    + / 获取受托人列表
    + /fee 注册受托人所需的手续费
    + /forging/getForgedByAccount 获取指定账户的锻造区块信息
    + /forging/status 获取指定账户信息的锻造是否开启

### getActiveDelegateKeypairs

之前介绍的 generateDelegateList 函数是负责把当前排序靠前的受托人获取出来。
现在这个 getActiveDelegateKeypairs 函数是在前者的基础之上，
同时把满足密钥对能在 private.keypairs 能找到受托人找出来。
所以这个函数返回的受托人，都是当前节点内有锻造区块资格的受托人。

总结一下在本节点内受托人的锻造区块资格的条件：

1. 投票数排名在前101个。
2. 密钥已正确配置。 

### fork

这个函数名字看上去很可怕，但是其实这个函数只是在统计分叉的情况而言，
如果发生了发叉，会把分叉原因等信息写入到 "forks_stat" 数据库中。
仅此而已。

### checkDelegates

这个检查主要是为了保证每个账户只能投出最多101票。

## 总结

这个模块的核心在于，在此区块锻造是如何轮询触发的，当到了区块锻造的时机出现的时候，
是如何挑选出当前应该锻造区块的受托人，这个是本模块的核心。
其他大部分过程都在之前的文章中介绍过了。

[Asch源码core模块之blocks]:https://yanyiwu.com/work/2018/03/20/asch-core-blocks.html
[Asch源码core模块之transactions]:https://yanyiwu.com/work/2018/03/28/asch-core-transactions.html
[Asch源码core模块之accounts]:https://yanyiwu.com/work/2018/04/01/asch-core-accounts.html
