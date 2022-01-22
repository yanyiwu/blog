---    
published: true
layout: post    
title: Asch源码core模块之accounts   
date: 2018-04-01
category: work    
display: onlydetail
---    

# Asch源码core模块之accounts

<center>  
<img src="http://images.yanyiwu.com/xas.jpg" class="photo"></img>  
</center>  

## 背景

继续阅读以下映射关系中的 account:

+ ./core/blocks.js [Asch源码core模块之blocks]  <==> ./base/blocks.js [Asch源码base模块之block创建]
+ ./core/transactions.js [Asch源码core模块之transactions]  <==> ./base/transaction.js [Asch源码base模块之transaction]
+ **./core/accounts.js <==> ./base/account.js [Asch源码base模块之Account]**

上一篇文章 [Asch源码core模块之transactions] 阅读 core/transactions.js，接下来阅读最后一堆映射关系 ./core/accounts.js 。

### 源码概况

+ event
    + onBind
+ public
    + Constructor
    + generateAddressByPublicKey
    + generateAddressByPublicKey2
    + getAccount
    + getAccounts
    + setAccountAndGet
    + mergeAccountAndGet
+ class
    + Vote
+ private
    + attachApi
    + openAccount
    + openAccount2
+ shared
    + newAccount
    + open
    + open2
    + getBalance
    + getPublickey
    + generatePublickey
    + getDelegates
    + getDelegatesFee
    + addDelegates
    + getAccount

## 源码详解

### Constructor

就做了两件事：

1. 常规的 attachApi 调用。
2. 通过 library.base.transaction.attachAssetType 添加 Vote 类型的交易。

### class Vote

和常用的交易差不多，但是有以下特点： 

1. verify 的过程中
    1. 检查 votes.length 不大于 33，限制每次投票只能投33票之内。注意，这里是限制每次投票，但是每个人投票次数是不限的。
    2. module.delegates.checkDelegates 会检查每个人一共只有101个票可以投出。但是投票次数和撤票次数都是无限的。这点很多人都混淆了。
2. apply 的过程是给 sender 增加 delegates 列表。所以其实在数据库中持久化存着所有人的投票列表。这点和传统意义上的转账不同。
3. dbRead & dbSave 对于Vote这种交易类型，在持久化列表中有一个 votes 表专门存储这个交易。

### onBind

这个模块的 onBind 事件回调函数也是打酱油的。

### 常规api

以下常规api就是那种逻辑简单，无需深究，一句话带过即可的api： 

+ generateAddressByPublicKey & generateAddressByPublicKey2 通过公钥生成地址。
+ getAccount & getAccounts 获取常规账号信息，公钥地址等，从数据库中获取。
+ setAccountAndGet 依次调用 library.base.account.set 和 library.base.account.get
+ mergeAccountAndGet 和 setAccountAndGet 类似。
+ openAccount & openAccount2 创建账号，先通过 getAccount 从数据库中查找，如果找不到，则初始化一个，账号信息主要包括地址，公钥，余额等。

### http api & shared functions

本模块的 router 是注册在 /api/accounts 目录下。

```
router.map(shared, {
  "post /open": "open",
  "post /open2": "open2",
  "get /getBalance": "getBalance",
  "get /getPublicKey": "getPublickey",
  "post /generatePublicKey": "generatePublickey",
  "get /delegates": "getDelegates",
  "get /delegates/fee": "getDelegatesFee",
  "get /": "getAccount",
  "get /new": "newAccount"
});
```

open,open2 就是 openAccount,openAccount2 的包装。

需要注意的是，其中 /new, /generatePublickey 这类api的实现中都依赖了密码，
所以实际中这些api都没有使用，因为让客户端把密码上传上来显然是不安全的。这些api应该只是调试用的。

其中，/delegates 这个api是获取当前账号投票给了哪些受托人列表。

## 总结

这个模块其实可读性不高，大部分都是常规api，而且有些冗余。有些api应该已经是废弃了的。
大概浏览过去即可，有个印象即可。

这篇文章之后，就等于关于 block,transaction,account 的 ./base  和 ./core 的映射源码都读完了。

[Asch源码core模块之blocks]:https://yanyiwu.com/work/2018/03/20/asch-core-blocks.html
[Asch源码core模块之transactions]:https://yanyiwu.com/work/2018/03/28/asch-core-transactions.html
[Asch源码base模块之Account]:https://yanyiwu.com/work/2018/03/03/asch-base-account.html
[Asch源码base模块之block创建]:https://yanyiwu.com/work/2018/03/04/asch-base-block.html
[Asch源码base模块之transaction]:https://yanyiwu.com/work/2018/03/10/asch-base-transaction.html
