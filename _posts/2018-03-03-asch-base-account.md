---    
published: true
layout: post    
title: Asch源码base模块之Account
date: 2018-03-03
category: work    
display: onlydetail
---    

<center>  
<img src="http://images.yanyiwu.com/xas.jpg" class="photo"></img>  
</center>  

## 背景

在 [Asch源码base模块基础之共识] 中，已经大概介绍了 base 模块，和详细介绍共识流程 (consensus.js)。
接下来继续介绍 base 目录的 Account 模块。

+ consensus.js
+ **account.js**
+ block.js
+ transaction.js

但是其实这个 Account 模块其实主要是封装的账号数据库信息的增删改查，
比较枯燥，大概浏览有个印象即可。

account 这个模块提供了一个 Account 操作类 。
主要包括如下 api :

+ Account Constructor & createTables 初始化数据库若干表
+ get & getAll 获取数据
+ set 写入数据
+ merge 更新数据
+ ...

## Constructor & createTables

构造函数做的时候和 createTables 一起来介绍，
因为做的都是在创建表。

Account 涉及的表主要有如下几个： 

+ "mem_accounts" 负责账号信息
+ "mem_round" 负责暂存着每一次受托人锻造round所暂存的一些信息。
+ "mem_accounts2delegates" 关系表
+ "mem_accounts2multisignatures" 关系表 

"mem_accounts" 主要有以下字段:

+ username
+ isDelegate
+ secondSignature
+ u_username
+ address
+ publicKey
+ secondPublicKey
+ balance
+ vote
+ rate
+ delegates
+ multisignatures
+ multimin
+ multilifetime
+ blockId
+ nameexist
+ producedblocks
+ missedblocks
+ fees
+ rewards
+ lockHeight

"mem_round"：

+ address
+ amount
+ delegate
+ blockId
+ round

"mem_accounts2delegates", "mem_accounts2multisignatures"

+ accountId
+ dependentId
+ ...

## removeTables

删除以下表：

+ "mem_accounts"
+ "mem_round"

removeTables 这个函数有且只在 init 模块中调用，
所以其实这个函数也可以放入到构造过程中，
反正做的其实都是初始准备工作。

## objectNormalize

异常检查，可先忽略。

## toDB

这个函数名取的不够直观，其实这个就是一个二进制化的过程，
对于某些字段用二进制的buffer存储。

## get & getAll

get 是 getAll 的封装，主要获取逻辑都在 getAll 中实现。

负责从 "mem_accounts" 获取用户信息，支持 limit, offset, sort 之类的基础功能。

举个例子，当我们需要获取当前101个受托人的公钥时，
代码如下：

```
getAll({
isDelegate: 1,
sort: {"vote": -1, "publicKey": 1},
limit: 101
}, ["publicKey"], function (err, rows) {
...
}
```

## set

负责插入和更新 "mem_accounts" 表。更新时按 address 为条件键。

## merge

merge 这个api 提供的输入参数如下：

+ address
+ diff = {...}
    + balance
    + blockId
    + round
    + ...
+ ...

以 address 为增删改查的基本单位，而 diff 则是具体要改动的数据对象。


例子：产块

每10s产一个块的时候，传入merge的diff数据如下

```
{"publicKey":"f47aff2f4753b8e84ed945b2b9d15f5c4173e78ac3796e522d38e03608aa5921","producedblocks":1,"blockId":"a116718babf1496d68732fd3d66c7ab0926adad01e8b6d6c126ea29c3fd8cc4e","round":181}
```

对应最后执行的sql如下:

```
update "mem_accounts" set "blockId" = $p1, "producedblocks" = "producedblocks" + 1 where "address" = $p2;
```

也就是给指定受托人 address 的 producedblocks 字段加一，
所以在区块链浏览器中就是通过这个 producedblocks 可以看到某个受托人生产了多少区块。

然后每次一次产块轮回都结束的时候（101受托人都产完一次之后），会统一修改一遍这些受托人的 "mem_accounts" 信息。

示例输入diff数据如下：

```
{"publicKey":"dc6b70ff34cfbc68d08e8335e58e71d0e6ffdc4a1d26a91fa1872233c1dd20af","balance":350000000,"u_balance":350000000,"blockId":"5177566ad3cb80204baac894c94f84d20cd4891a26465beef3e87b6b6a7ec018","round":180,"fees":0,"rewards":350000000}
```

执行的sql示例如下：

```
update "mem_accounts" set "balance" = "balance" + 350000000, "u_balance" = "u_balance" + 350000000, "rewards" = "rewards" + 350000000, "blockId" = $p1 where "address" = $p2;
```

## 总结

这个模块目前封装的不够好，代码虽然介绍完了，但是其实比较片面，
因为在其他模块中的也存在很多的裸sql ，直接操作 "mem_accounts" 等数据库表。
所以先大概浏览过去有个印象即可。

[Asch源码base模块基础之共识]:https://yanyiwu.com/work/2018/02/08/asch-base-consensus.html
