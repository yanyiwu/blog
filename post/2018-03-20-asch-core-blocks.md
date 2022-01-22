---    
published: true
layout: post    
title: Asch源码core模块之blocks
date: 2018-03-20
category: work    
display: onlydetail
---    

# Asch源码core模块之blocks

<center>  
<img src="http://images.yanyiwu.com/xas.jpg" class="photo"></img>  
</center>  

## 背景

在上一篇文章 [Asch源码core模块之loader启动] 已经基本上把 Asch 服务启动过程梳理清楚了。

本文开始阅读 ./src/core/blocks.js ，
希望在此之前已经阅读过 [Asch源码core模块之loader启动] 。

## 源码概况

照旧先把主要功能函数框架罗列，如下：

+ event:
    + onReceiveBlock
    + onReceivePropose
    + onReceiveVotes
    + onBind
+ public:
    + Blocks Constructor 
    + getCommonBlock
    + count
    + getBlock
    + loadBlocksData
    + loadBlocksPart
    + loadBlocksOffset
    + setLastBlock
    + getLastBlock
    + verifyBlock
    + verifyBlockVotes
    + applyBlock
    + processBlock
    + simpleDeleteAfterBlock
    + parseBlock
    + loadBlocksFromPeer
    + deleteBlocksBefore
    + generateBlock
    + sandboxApi
    + getSupply
    + getCirculatingSupply
    + cleanup
+ private:
    + attachApi
    + saveGenesisBlock
    + deleteBlock
    + list
    + getByField
    + saveBlock
    + popLastBlock
    + getIdSequence
    + getIdSequence2
    + readDbRows
    + applyTransaction
+ shared:
    + getBlock
    + getBlocks
    + getFullBlock
    + getHeight
    + getFee
    + getMilestone
    + getReward
    + getSupply
    + getStatus

## 源码详解

还是照旧从事件触发函数入手。

### onReceiveBlock

接受新区块的时候，会有以下几种情况发生：

+ 新区块的父区块就是我们当前区块，并且高度也是我们当前高度+1，说明新区块就是我们要的，则调用 processBlock 对这个区块进行后续操作。
+ 新区块高度是当前高度+1，但是父区块不是我们的当前区块，说明发生了分叉，则调用 module.delegates.fork 进行分叉记录。
+ 新区块的父区块是当前区块的父区块，高度也是当前高度，说明发生了分叉，这个新区块就是当前区块的兄弟区块，也是调用 module.delegates.fork 进行分叉记录，记录的分叉原因和上一个不同。
+ 新区块的高度大于当前高度+1，则说明当前节点的区块高度不够，则调用 module.loader.startSyncBlocks 进行区块同步。
+ 其他情况，则不作为。

### onReceivePropose

在 [Asch源码base模块基础之共识] 里面说过，
受托人在产块的时候，
需要先提出 propose 去向其他节点收集投票，
收到足够的票才算是达成了共识，才能正常产块。

所以这里的 onReceivePropose 就是共识达成的过程之一。

onReceivePropose 先会做如下异常检查：

1. 如果新的propose高度和当前propose高度一致，但是id不一致，则打出warn日志。
2. 新propose高度不等于当前propose高度+1，则认为是无效。
    1. 如果新propose高度大于当前propose高度+1，认为是无效的同时，还会调用 modules.loader.startSyncBlocks 开始同步区块。
3. 如果最新一次vote的时间（这里的vote就是对propose的投票）距离现在在5秒之内，则认为propse过于频繁，忽略之。

如果以上检查都通过，则开始走下面流程：

1. bus.message("newPropose" ...) 发出新propose来临的事件。
2. modules.delegates.validateProposeSlot 验证此 propose slot 是否有效。
3. base.consensus.acceptPropose 接受这个新propose
4. modules.delegates.getActiveDelegateKeypairs 获取本节点的受托人密钥对。
5. base.consensus.createVotes 使用本节点的受托人密钥对创建对 propose 的投票
6. 然后把 vote 发送给 propose 发起者。

这里的votes和用户在钱包对受托人进行投票不是同一个含义。
这个需要区分清楚，如果对 propose 和 vote 还不是特别清楚的话，
建议可以再阅读一遍 [Asch源码base模块基础之共识] 。

### onReceiveVotes

1. base.consensus.addPendingVotes 把收到的票先暂存起来。
2. base.consensus.hasEnoughVotes 判断目前收到的票是否已经足够。
    1. 如果已经有足够的票了，则 base.consensus.getPendingBlock 把之前暂存的 block 再拿出来，开始进行区块处理。processBlock

所以其实这个过程在 [Asch源码base模块基础之共识] 已经阐述过了。

### onBind

打酱油而已，基本上等于没干啥。

上面就是事件触发函数的介绍，下面开始介绍 public 函数。

### Constructor

构造函数基本上也是打酱油。

### getCommonBlock

getCommonBlock 就是在之前的 [Asch源码core模块之loader启动] 提到过的，
当本节点和peer节点同步区块时调用的。

主要做的就是轮询peer节点，通过网络交互最后找到和本节点最近的才 common block 。

### count

就一句sql：`select count(rowid) from blocks` 

### getBlock

public 的 getBlock 其实就是 shared.getBlock 的封装，
shared 相关的函数后面会一起讲。

### loadBlocksData & loadBlocksPart & loadBlocksOffset

通过拼 sql 读取数据库 block 信息，

### setLastBlock & getLastBlock

设置，读取最新区块。

### verifyBlock & verifyBlockVotes

验证区块，比较繁琐，不细讲。

### processBlock

processBlock 主要有以下步骤：

1. base.block.sortTransactions 排序区块的交易列表。
2. verifyBlock 验证区块。
3. dbLite 中查询该block信息，如果block已存在则报错返回。 
4. modules.delegates.validateBlockSlot 验证区块slot，如果验证没通过，则记录这次是分叉，并报错返回。
5. 从 dbLite 中查询该交易信息，如果交易已存在则报错返回。 
6. base.transactions.verify 验证该交易。
7. applyBlock 生效该区块 (接下来谈谈 applyBlock )

### applyBlock

1. modules.transactions.getUnconfirmedTransactionList 获取待确认交易列表。
2. modules.transactions.undoUnconfirmedList 撤销当前的待确认交易列表(只是暂时的全部撤销，后面会redo回来)。
3. library.dbLite.query('SAVEPOINT applyblock'); 先存一个可以回滚的点。
4. 遍历block里排序好的交易列表
    1. 创建和获取交易发送者的账号
    2. apply 该交易
5. 如果 saveBlock 参数为true，则 saveBlock，saveBlock 是把 block 和 transactions 都通过 sql 写入数据库。
6. modules.round.tick 这个后面介绍 core/round 会讲。
7. 如果中间有error发生，则让db回滚到第3步设置好的savepoint。
8. 如果一切顺利，最后还有如下收尾工作。
    1. setLastBlock 设置该区块为当前最新区块
    2. oneoff.clear() 状态位重置。
    3. library.base.consensus.clearState 共识的状态清理。
    4. 如果broadcast为true的话，则发送 newBlock 事件。
9. modules.transactions.receiveTransactions 最后把志之前第1步取得的未确认交易列表做一次过滤，过滤出这次没有被apply进去的transactions，再重新redo它们一次。

所以其实每次产生区块的函数调用过程是

generateBlock -> processBlock -> applyBlock

### simpleDeleteAfterBlock

一句sql而已：

```
DELETE FROM blocks WHERE height >= (SELECT height FROM blocks where id = $id
```

### deleteBlocksBefore

这里的Before有些歧义，我的理解应该叫 After 吧，
就是仍然是删除某个block高度后面的区块，
从而降低区块高度。
和 simpleDeleteAfterBlock 的区别在于，simpleDeleteAfterBlock 只操作了数据库。
而 deleteBlocksBefore 是通过 popLastBlock 不停的pop出最新的区块。

#### popLastBlock

popLastBlock 和简单的删除不同，原因主要是在于，
在po最新区块的时候，同时会回滚该区块的交易记录。

### loadBlocksFromPeer

从peer节点读取区块，并且调用 processBlock 处理区块。
这个函数也是在 loader 的定时同步区块的过程中被调用的功能函数之一。

### parseBlock

解析区块，因为区块需要在peer中定期同步，所以有对应的解析函数。

### generateBlock

generateBlock 主要是在受托人产块中被调用的功能函数。

受托人产块过程其实已经在之前的文章 [区块链开源项目Asch源码初探] 和 [Asch源码base模块基础之共识] 说过。
是非常重要的一个过程。 
在此可以在过一遍整个流程：

1. 获取当前待确认的交易列表(最多N个)。
2. 如果当前还有 pendingBlock 的话，则说明还没有达成共识，则停止这个产块流程。至于关于达成共识这块还不是很了解的话，可以先阅读 [Asch源码base模块基础之共识] 。
3. 遍历第1步获取到的待确认交易列表：
    1. 通过交易的senderPublicKey 从 getAccount 中获取该用户信息。
    2. 如果该交易已经ready了（对于多重签名的交易，需要等到所有签名都到位才算ready）
    3. base.transactions.verify 验证该交易，如果验证通过，则放入ready数组。
4. base.block.create 创建新的区块，并且打包步骤3里面验证过的交易列表。
5. verifyBlock 验证新创建的区块。
6. 获取本节点的受托人密钥对。
7. base.consensus.createVotes 用这些密钥对创建 localVotes
8. base.consensus.hasEnoughVotes 检查创建的 votes 是否足够。
9. 如果votes足够，则顺利产块，如果不足够，就需要 createPropose 去收集其他节点的votes，直到达成共识。

### getSupply & getCirculatingSupply

就是 blockStatus.calcSupply 的封装，计算当前已供应的代币数量。

### cleanup

loaded 置为 false。

### attachApi

+ /api/blocks
    + / (getBlocks)
    + /get (getBlock)
    + /full (getFullBlock)
    + /getHeight 同名api函数，下同。
    + /getFee
    + /getMilestone
    + /getReward
    + /getSupply
    + /getStatus

attachApi 注册了一下 http api，不过这些 api 基本上都是 shared 各个 api 的映射，
看函数名也基本上都知道了功能逻辑，就不展开了。
如果需要深究的时候再展开读读源码就知道了。

## 总结 

其实本文的内容大部分都是之前的文章涉及过的，
所以也算是比较好懂的模块。
算是一次温故知新，查缺补漏吧。

[Asch源码base模块基础之共识]:https://yanyiwu.com/work/2018/02/08/asch-base-consensus.html
[Asch源码core模块之loader启动]:https://yanyiwu.com/work/2018/03/17/asch-core-loader.html
[区块链开源项目Asch源码初探]:https://yanyiwu.com/work/2017/07/29/read-asch-source-code.html
