---    
published: true
layout: post    
title: Asch源码core模块之loader启动
date: 2018-03-17
category: work    
display: onlydetail
---    

<center>  
<img src="http://7viirv.com1.z0.glb.clouddn.com/xas.jpg" class="photo"></img>  
</center>  

## 背景

在 [Asch源码阅读:启动过程概述] 主要阅读了 src/init.js 的初始化过程，
但是在 init.js 初始化过程中最后环节就是通过 onBind 触发 src/core/loader.js 

但是其实阅读 src/core/loader.js 的前提就是对 src/base 有所了解。因为里面大量的 library.base 开头的代码就是使用 src/base 目录里的模块代码。

所以对 src/base 模块不太了解的可以先阅读以下博文： 

+ [Asch源码base模块基础之共识]
+ [Asch源码base模块之Account]
+ [Asch源码base模块之block创建]
+ [Asch源码base模块之transaction]

## 源码详解 

+ events:
    + onBind 入口函数，负责 loader 的核心逻辑
    + onBlockchainReady 可忽略
    + onPeerReady 
+ private:
    + loadBlockChain 核心逻辑
    + Constructor & attachApi
    + syncTrigger
    + loadFullDb
    + findUpdate
    + loadBlocks
    + loadSignatures
    + loadUnconfirmedTransactions
    + loadBalances
    + loadBlockChain
+ public:
    + syncing
    + sandboxApi
    + startSyncBlocks
    + cleanup
+ shared:
    + status
    + sync

之前说过 src/core 下的各个模块和 src/base 下的模块主要区别之一就 ./src/core 模块主要是通过事件驱动来进行具体功能。
而 loader 的入口函数就是 onBind ，接下来从 onBind 开始分析。 

### onBind

onBind 就做了两件事情： 

1. loadBlockChain 后面会详细讲
2. bus.message("blockchainReady") 触发 blockchainReady 这个事件。

### loadBlockChain

1. 初始化 base/account 数据库相关表。 
2. 使用 core/blocks.js: count 函数 "select count(rowid) from blocks" 查看数据库里面的 block 数量，赋值给变量 count。
3. 更新 "mem_accounts" 数据表里 "u_" 开头的字段。
4. 检查 "mem_accounts" 里面是否存在 blockId 为 null 的异常数据，如果有，则开始load 。
5. 检查 "mem_accounts" 是否缺少受托人。
6. 通过 modules.blocks.loadBlocksOffset 载入区块。
7. 通过 loadBalances 载入金额信息

以上，2~6 步骤如果不符合预期的时候，再则不进行接下去的步骤，
而是转向调用 load 函数。

#### load 函数 

loadBlockChain 里面定义了load函数，
其实这里的 load 函数我的理解应该叫 reload ，
是当正常 loadBlockChain 出现不符合预期(或者需要 verify 的情况下)的情况下，才会被调用。

load 函数主要有如下几个步骤： 

1. base.account.removeTables 清空之前 "mem_accounts,mem_round" 里面的数据表
2. base.account.createTables 创建 "mem_" 开头的一些表。
3. 调用 modules.blocks.loadBlockChain 载入blocks信息，按高度批量载入，每次载入的高度区块在配置文件里面 loadPerIteration 配置为 5000 。
    1. 分段载入直到载入完毕或者出错。
    2. 如果出错的话，则记录出错的区块高度，然后在数据库中删除这个高度之后的区块信息。
4. loadBalances 所以不管怎么样，最后都会调用这个 loadBalances

### loadBalances

1. getAllNativeBalances: 这个是从 "mem_accounts" 中获取出来所有的账号和金额信息。
2. 将上一步获取到的账号和金额信息通过 setNativeBalance 写入 tmdb 这个内存数据库。

所以其实 loadBalances 就是把之前落地到磁盘的 "mem_accounts" 中记录的账号金额信息，
载入到内存数据库 tmdb 中，为了后续的快速查询。

### onPeerReady

当收到其他节点ready的事件时，启动以下定时器：

1. 同步区块，10s触发一次。
    1. startSyncBlocks
        1. syncTrigger 
        2. loadBlocks 这里后面会详述
2. 载入未确认交易，14s触发一次。对应函数 loadUnconfirmedTransactions ，这个好理解，就是需要定时从 peer 节点获取未确认的交易列表，为之后区块产生打包交易做准备。
3. 载入签名，14s触发一次。对应函数 loadSignatures ，从peer节点获取交易id和签名的映射列表。

### loadBlocks

同步区块是区块链很核心的逻辑之一，在 loader 中主要通过 loadBlocks 这个函数来实现，
主要有如下步骤：

1. 随机选择一个其他节点作为待同步节点(peer节点)，获取它的区块高度。
2. 开始同步区块有两种情况：
    1. 当本节点只有一个创世区块时，则 loadFullDb 全量同步区块。全量同步区块相对比较简单，因为不需要考虑回滚的问题。
    2. 如果不是第一种情况的话，则需要通过 findUpdate 做进一步逻辑。

### findUpdate

1. getCommonBlock 先获取本节点和peer节点的common block，这里需要和 peer 节点进行网络交互。
2. 当 common block 的高度比本节点的当前高度低时，则要回滚交易和删除区块来降低区块高度到当前的common block的高度，这个过程我们暂时称之为回滚。
    1. 获取当前未确认的交易列表。
    2. 通过 core/transactions 模块撤销当前未确认的交易列表。
    3. 回滚区块。 
3. blocks.loadBlocksFromPeer 从peer节点获取区块
4. transactions.receiveTransactions 接受待确认交易列表

### http api

在 attachApi 中，loader 注册了以下 http api :

+ /api/loader
    + /status
        + loaded: 载入区块链数据库完毕的标志
        + now: 当前最新区块的高度
        + blocksCount: 总区块数
    + /status/sync
        + syncing: 是否开启同步定时器，如果出现异常状态时，同步定时器可能会被关闭，所以可以通过这个 api 查看。
        + blocks: 待同步的区块高度
        + height: 当前区块高度。

## 总结

loader 主要负责载入区块链基础数据库，和定时与其他节点同步区块等信息。
整体逻辑不复杂，但是用到其他模块的函数比较多，后续继续阅读其他模块之后就更熟悉了。

[Asch源码阅读:启动过程概述]:https://yanyiwu.com/work/2018/02/05/source-code-asch-init.html
[Asch源码base模块基础之共识]:https://yanyiwu.com/work/2018/02/08/asch-base-consensus.html
[Asch源码base模块之Account]:https://yanyiwu.com/work/2018/03/03/asch-base-account.html
[Asch源码base模块之block创建]:https://yanyiwu.com/work/2018/03/04/asch-base-block.html
[Asch源码base模块之transaction]:https://yanyiwu.com/work/2018/03/10/asch-base-transaction.html
