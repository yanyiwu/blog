---    
published: true
layout: post    
title: Asch源码core模块之transactions
date: 2018-03-28
category: work    
display: onlydetail
---    

<center>  
<img src="http://7viirv.com1.z0.glb.clouddn.com/xas.jpg" class="photo"></img>  
</center>  

## 背景

刚啃完 core/blocks.js ，接下来马上 core/transactions.js ，
略辛苦，毕竟这两个源码文件应该是 core/ 目录下代码量最多的两个源码文件了。

## 源码概况

+ event:
    + onBind
+ public:
    + Constructor
    + addUnconfirmedTransaction
    + getUnconfirmedTransactionList
    + removeUnconfirmedTransaction
    + hasUnconfirmedTransaction
    + processUnconfirmedTransaction
    + applyUnconfirmedList
    + undoUnconfirmedList
    + apply
    + undo
    + applyUnconfirmed
    + undoUnconfirmed
    + receiveTransactions
    + sandboxApi
    + list
    + getById
+ class:
    + Transfer
    + Storage (实际中没有在使用？)
    + Lock (实际中没有在使用？)
+ shared:
    + getTransactions
    + getTransaction
    + getUnconfirmedTransaction
    + getUnconfirmedTransactions
    + addTransactions (实际中没有使用)
+ private:
    + attachApi
    + attachStorageApi (实际中没有使用)
    + list
    + getById
      
## 源码详解

### onBind

transactions 这个模块的事件回调函数只有这个 onBind ，
而且这个 onBind 还是个打酱油的。

### class

在之前的 [Asch源码base模块之transaction] 中谈到过，
交易是泛化的概念，含义比较广，可以代表转账，投票等非常多的类型，
这些类型的代码大概分散在以下代码中：

```
core/accounts.js:  library.base.transaction.attachAssetType(TransactionTypes.VOTE, new Vote());
core/dapps.js:  library.base.transaction.attachAssetType(TransactionTypes.DAPP, new DApp());
core/dapps.js:  library.base.transaction.attachAssetType(TransactionTypes.IN_TRANSFER, new InTransfer());
core/dapps.js:  library.base.transaction.attachAssetType(TransactionTypes.OUT_TRANSFER, new OutTransfer());
core/delegates.js:  library.base.transaction.attachAssetType(TransactionTypes.DELEGATE, new Delegate());
core/multisignatures.js:  library.base.transaction.attachAssetType(TransactionTypes.MULTI, new Multisignature());
core/signatures.js:  library.base.transaction.attachAssetType(TransactionTypes.SIGNATURE, new Signature());
core/transactions.js:  library.base.transaction.attachAssetType(TransactionTypes.SEND, new Transfer());
core/transactions.js:  library.base.transaction.attachAssetType(TransactionTypes.STORAGE, new Storage());
core/transactions.js:  library.base.transaction.attachAssetType(TransactionTypes.LOCK, new Lock());
core/uia.js:  library.base.transaction.attachAssetType(TransactionTypes.UIA_ISSUER, require('../uia/issuer.js'))
core/uia.js:  library.base.transaction.attachAssetType(TransactionTypes.UIA_ASSET, require('../uia/asset.js'))
core/uia.js:  library.base.transaction.attachAssetType(TransactionTypes.UIA_FLAGS, require('../uia/flags.js'))
core/uia.js:  library.base.transaction.attachAssetType(TransactionTypes.UIA_ACL, require('../uia/acl.js'))
core/uia.js:  library.base.transaction.attachAssetType(TransactionTypes.UIA_ISSUE, require('../uia/issue.js'))
core/uia.js:  library.base.transaction.attachAssetType(TransactionTypes.UIA_TRANSFER, require('../uia/transfer.js'))
```

在本模块中，涉及到交易类型有：

+ Transfer 转账，在 addTransactions 中被使用。
+ Storage 这个目前看上去似乎没有在实际中被使用
+ Lock 这个目前看上去似乎也没有在实际中被使用

这些交易类有共同的几个 api: 

+ create: 创建
+ calculateFee: 计算手续费
+ verify: 验证
+ process: 处理
+ getBytes: 获取交易的序列化字节数组
+ apply: 对数据库操作生效
+ undo: 回滚，也是对数据库操作回滚。
+ applyUnconfirmed: 生效未确认交易
+ undoUnconfirmed: 回滚未确认交易
+ dbRead: 数据库数据解析
+ dbSave: 数据库存储
+ ready: 对于多签名的交易进行检查是否多个签名都到位

以上api在之前的文章都大概介绍过了，不赘述。

### attachApi & shared

shared 中的 api 都对应于 /api/transactions 的 http 接口。
看函数名基本上就知道功能了，不详述。

### receiveTransactions

这个api在很多地方都被调用，可以算是这个模块的入口api。
不过这个函数主要做的事情就是遍历收到的交易列表，
对每个交易都调用 processUnconfirmedTransaction

### processUnconfirmedTransaction

1. 如果缺少交易id，则调用 library.base.transactions.getId 算出该交易的id 并填充进去。
2. 调用 modules.accounts.setAccountAndGet 获取 sender 的账号信息。
3. 如果该交易是多重签名的交易，则获取 requester 的账号信息。
4. 把该交易传递给 library.base.transaction.process 进行交易的常用操作，这个过程详见 [Asch源码base模块之transaction]
5. 调用 self.addUnconfirmedTransaction 把添加这个未确认交易。下面会展开讲。
6. library.bus.message('unconfirmedTransaction' ...); 广播 unconfirmedTransaction 这个事件周知其他模块。这里的其他模块其实就是 core/transport.js 模块，当这个模块收到这个事件的时候，会负责把这个交易广播出去给其他节点。

### addUnconfirmedTransaction

介绍这个函数之前需要先介绍以下几个变量： 

```
private.unconfirmedNumber = 0;
private.unconfirmedTransactions = [];
private.unconfirmedTransactionsIdIndex = {};
```

+ unconfirmedNumber 当前未确认交易的总数
+ unconfirmedTransactions 未确认交易列表数组
+ unconfirmedTransactionsIdIndex 未确认交易的id到unconfirmedTransactions数组下标的映射关系

再补充一下，后面的 getUnconfirmedTransaction 和 removeUnconfirmedTransaction 就是上面这三个变量的增删改查。

addUnconfirmedTransaction 的过程如下：

1. 调用 applyUnconfirmed ，其实就是间接调用了 library.base.transaction.applyUnconfirmed ，这个过程可以简单理解为，和 apply 的唯一区别就是 apply 更新数据库的 balance 字段，而 applyUnconfirmed 更新的是 "u_balance" ，详见 [Asch源码base模块之transaction]
2. unconfirmedTransactions.push(transaction) 把这个交易加入未确认交易列表数组
3. private.unconfirmedTransactionsIdIndex 注册一下这个交易id到数组下标的映射关系
3. private.unconfirmedNumber++ 当前未确认交易总数+1

### apply & undo

这两个函数都是 library.base.transaction.apply,library.base.transaction.undo 的封装，感觉是多余的。

## 总结

这个模块其实和 [Asch源码base模块之transaction] 有些重复了，
如果有所不清楚的，可以再翻翻 [Asch源码base模块之transaction] 。
所以在此就不再一一详述了，只挑了一些重点的代码看看了。
其他的，等需要用到的时候再展开深究吧。

[Asch源码base模块之transaction]:https://yanyiwu.com/work/2018/03/10/asch-base-transaction.html
