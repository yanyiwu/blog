---    
published: true
layout: post    
title: Asch源码base模块之transaction
date: 2018-03-10
category: work    
display: onlydetail
---    

# Asch源码base模块之transaction

<center>  
<img src="http://images.yanyiwu.com/xas.jpg" class="photo"></img>  
</center>  

## 背景

在 [Asch源码base模块之block创建] 中，已经介绍了 block 创建核心流程，
包括 序列化，签名，验证，数据库存储，transaction 交易的核心流程和 block 如出一辙，
只不过交易是更泛化的概念，含义比较广，可以代表转账，投票等类型，所以代码量更多。

接下来继续介绍 base 目录的 Transaction 模块。

+ consensus.js
+ account.js
+ block.js
+ **transaction.js**

## 概览 

照常从主要的接口函数中开始分析，Transaction 主要有如下接口函数：

+ Constructor 构造函数
+ create 创建函数
+ attachAssetType 添加交易类型 
+ sign 签名
+ multisign 多重签名
+ getBytes -> getHash -> getId 序列化后取hash再取id
+ ready 和多重签名有关，多重签名需要所有签名都ready
+ process
+ verify,verifySignature,verifySecondSignature 验证
+ apply 交易生效，修改数据库中相关字段，比如balance等。
+ undo 交易回滚
+ applyUnconfirmed
+ undoUnconfirmed
+ dbSave 数据存储
+ dbRead
+ dbReadAsset

其实 Transaction 这个模块的实现和 Block 非常类似，
都需要创建，二进制序列化，验证等。
所以后面类似的部分就简单带过了。
如果 Block 没有看明白的，建议研究明白，再看这个。

## 核心逻辑

### attachAssetType

transaction 在源码里是一个抽象名词，可以具体表现为转账，投票，设置密码等若干种类型，
类型大概有如下：

``
SEND: 0, // XAS TRANSFER
    SIGNATURE: 1, // SETUP SECOND_PASSWORD
    DELEGATE: 2, // SECOND_PASSWORD
    VOTE: 3, // VOTE FOR DELEGATE
    MULTI: 4, // MULTISIGNATURE
    DAPP: 5, // DAPP REGISTER
    IN_TRANSFER: 6, // DAPP DEPOSIT
    OUT_TRANSFER: 7, // DAPP WITHDRAW
    STORAGE: 8, // UPLOAD STORAGE
    
    // UIA: USER ISSUE ASSET
    UIA_ISSUER: 9, // UIA ISSUER REGISTER
    UIA_ASSET: 10, // UIA ASSET REGISTER
    UIA_FLAGS: 11, // UIA FLAGS UPDATE
    UIA_ACL: 12, // UIA ACL UPDATE
    UIA_ISSUE: 13, // UIA ISSUE
    UIA_TRANSFER: 14, // UIA TRANSFER
    
    LOCK: 100 // ACCOUNT LOCK
    ``
    
    上面这些类型具体示意在注释里面写得很清楚了，
    后面在创建交易的核心部分会以 SEND 类型为例介绍。
    
### create
    
    创建交易（这里的交易是泛指，含转账，设置密码，投票等类型），
    具体类型可以在 attachAssetType 里配置。
    
    + type: 交易类型
    + amount: 金额
    + senderPublicKey: 发送者公钥 
    + requesterPublicKey: 请求者公钥
    + timestamp: 时间戳
    + asset: 资产（Asch平台里发行的各种资产）
    + message: 转账备注
    + args: 当交易类型的投票时，这里可以带上被投票的用户列表
    + recipientId: 接受者
    
### 交易签名的安全性
    
    但是这里有一个点需要分辨清楚的是，创建交易的时候，
    需要用到私钥对这个交易进行签名。
    所以，如果我们在服务器运行时候去创建交易，
    则需要私钥，如果服务器需要私钥，则客户端需要把自己私钥上传给服务器，
    但是如果客户端需要上传他们的私钥，安全性则完全无法保证。
    
    所以事实上，客户端从来不会上传私钥到服务器上。
    而是在客户端直接本地使用私钥进行交易签名的逻辑，
    然后上传签名后的交易到服务器节点。这样才能保证安全。
    
    所以，其实这里的 create 函数基本上不会被使用到。
    交易基本上都是在客户端创建。
    
    后续会举个例子简单讲一下交易的流程。
    
### getBytes
    
    和 block 的 getBytes 一样，也是二进制序列化，负责把 transaction 对象序列化成字节数组，
    然后才能再后续进行 hash 签名等 。
    
    + 1: type 交易类型
    + 4 bytes: 时间戳
    + 32 bytes: 发送者公钥
    + 32 bytes: 请求者公钥
    + 8 bytes: 接受者
    + 8 bytes: 交易金额
    + 64 bytes: message 转账备注
    + 64 bytes: args 交易参数，比如交易类型是投票的时候，这里的args会带上被投票的名单。
    + assetSize bytes: 资产
    
    具体序列化和上文的 block 中差不多，以此类推吧。
    
### getHash
    
    先用 getBytes 获取二进制序列化的字节数组，然后使用这个字节数组进行 sha256 hash 就是本 block 的 Hash 值。
    
### getId & getId2
    
    目前使用的 getId 是 getId2 的封装。
    getId2 其实就是 getHash 的哈希值的16进制的字符串。 
    
### ready
    
    对于多重签名的交易，需要检查这个交易的多重签名是否都ok了，比如对于需要5个人签名的交易，目前只有4个签名的话，
    则为还未ready。
    
### process
    
    通过 getId 填充交易 id，额外验证一些信息等。
    还有就是去重，如果从 trs 数据库里面通过这个 id 
    找到存在的交易，则去重。
    
### apply
    
    输入参数如下：
    
    + trs
    + block
    + sender
    
    trs
    
    ``
{  
   "type":0,
   "amount":66,
   "fee":10000000,
   "recipientId":"15748476572381496732",
   "timestamp":53616276,
   "asset":{},
   "senderPublicKey":"8e5178db2bf10555cb57264c88833c48007100748d593570e013c9b15b17004e",
   "signature":"d045bb51637351c0794b6475fc6aa719563d64c7529f44317604f642e23868372d0ee6f771daa76a749feda0f135603c0ff6c77d29f7ab465a84f0c877593c00",
   "id":"9c6ef8ec5155029d2846464562be0bf1ade5d6d5a8deb37ad2537bfc3d815cfe",
   "senderId":"6518038767050467653",
   "blockId":"5b86f1369037b67d63a76141d1a8ebf74fd6aaae4ef5ff0a3c0f4857ff8d1e41"
}
``

block

``
{  
   "version":0,
   "totalAmount":66,
   "totalFee":10000000,
   "reward":350000000,
   "payloadHash":"9c6ef8ec5155029d2846464562be0bf1ade5d6d5a8deb37ad2537bfc3d815cfe",
   "timestamp":53616290,
   "numberOfTransactions":1,
   "payloadLength":117,
   "previousBlock":"236c2cb0f725fed4005f22df4263379566be8d92c0aaecbd6e78da839bd4e7f4",
   "generatorPublicKey":"16cc00742f22108861f0b22e82ad3082a0eacd3a655b42315ec496ee0af42495",
   "transactions":[  
               {  
                            "type":0,
                            "amount":66,
                            "fee":10000000,
                            "recipientId":"15748476572381496732",
                            "timestamp":53616276,
                            "asset":{},
                            "senderPublicKey":"8e5178db2bf10555cb57264c88833c48007100748d593570e013c9b15b17004e",
                            "signature":"d045bb51637351c0794b6475fc6aa719563d64c7529f44317604f642e23868372d0ee6f771daa76a749feda0f135603c0ff6c77d29f7ab465a84f0c877593c00",
                            "id":"9c6ef8ec5155029d2846464562be0bf1ade5d6d5a8deb37ad2537bfc3d815cfe",
                            "senderId":"6518038767050467653",
                            "blockId":"5b86f1369037b67d63a76141d1a8ebf74fd6aaae4ef5ff0a3c0f4857ff8d1e41"
                       }
      ],
   "blockSignature":"e1bce2470e8bf60b7a06fbc548daa7f40a16756f53f572637d1cdae5884255f6ffa08e7837fb49e38cc7c765532a758595586af50608b2f7cb948f81294de30f",
   "id":"5b86f1369037b67d63a76141d1a8ebf74fd6aaae4ef5ff0a3c0f4857ff8d1e41",
   "height":35296
}
``

sender

``
{  
   "username":"asch_g1",
   "isDelegate":true,
   "u_isDelegate":true,
   "secondSignature":false,
   "u_secondSignature":false,
   "u_username":"asch_g1",
   "address":"6518038767050467653",
   "publicKey":"8e5178db2bf10555cb57264c88833c48007100748d593570e013c9b15b17004e",
   "secondPublicKey":"",
   "balance":122721187267,
   "u_balance":122721187267,
   "vote":10000000000000000,
   "rate":0,
   "delegates":[  
          ],
   "u_delegates":[  
          ],
   "multisignatures":[  
          ],
   "u_multisignatures":[  
          ],
   "multimin":0,
   "u_multimin":0,
   "multilifetime":0,
   "u_multilifetime":0,
   "blockId":"17034f44c653a0351d9ddd166ed8a4bb7523488848bbc4c8baa20bcee55ec488",
   "nameexist":false,
   "u_nameexist":false,
   "producedblocks":351,
   "missedblocks":0,
   "fees":1188116,
   "rewards":122850000000,
   "lockHeight":0
}
``

在 apply 中，主要是调用 base.account.merge 去更新用户的信息，比如余额值。
对于投票类型的交易，会更新投票受托人票数等。

### undo

undo 就是 apply 的反操作，比如 apply 对 sender 减少了余额，undo 则会增加相同的余额。

### applyUnconfirmed

这个和 apply 的区别在于，比如 apply 更新的是 balance 这个字段，
而 applyUnconfirmed 更新的是 "u_balance" 这个字段，
"u_balance" 同时也会更新 balanceCache 的值。

## 总结

transactions 这个模块代码量是 src/base 目录下的模块代码中最多的，
毕竟在区块链中，交易代表的含义比较广，可以代表转账，投票等，有不同的逻辑。
但是具体逻辑不一一吸毒，后续涉及到再展开。
核心本质上和 block 差不多，都是序列化，hash，签名，验证等。

写完这篇之后，./src/base 这个目录的源码阅读就完成了，后续开始分析 ./src/core 源码。

[Asch源码base模块之block创建]:https://yanyiwu.com/work/2018/03/04/asch-base-block.html
