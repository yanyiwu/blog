---    
published: true
layout: post    
title: Asch源码base模块之block创建
date: 2018-03-04
category: work    
display: onlydetail
---    

<center>  
<img src="http://7viirv.com1.z0.glb.clouddn.com/xas.jpg" class="photo"></img>  
</center>  

## 背景

在 [Asch源码base模块之Account] 中，已经介绍了 Account 相关数据库增删改查。
接下来继续介绍 base 目录的 Block 模块。

+ consensus.js
+ account.js
+ **block.js**
+ transaction.js

## 概览

block 模块对外提供的就是一个 Block 类，
主要如下一些 api :

+ public 函数
    + Block Constructor 构造函数，可跳过。
    + sortTransactions 排序待确认交易，具体逻辑后续有。
    + create 创建区块的核心逻辑，后续会详细说。
    + sign 区块签名，需要用到矿工的私钥。
    + getBytes block的二进制序列函数
    + getHash 根据block的二进制序列后的字节数组做 sha256 哈希
    + getId 取 getHash 进行哈希后取的十六进制字符串
    + verifySignature 验证签名
    + calculateFee (Asch手续费是写死的0.1 XAS ，比起比特币便宜很多)
    + dbSave&dbRead 数据库表 blocks 的读写，转换。
+ private 函数
    + blockStatus (utils/block-status.js)
        + calcReward (计算本区块的矿工奖励，只和当前block高度有关，随着高度越高越高，后续奖励会越来越少)
        + ...
    + getAddressByPublicKey 通过公钥计算地址，常用转换函数之一。

## 核心逻辑

### sortTransactions

之前介绍过，每次产块的时候都会打包当前未确认的交易，但是未确认的交易需要先排序，权重高的优先打包。

排序规则如下：

1. 设置二级密码（也是一种转账）优先级最高。
2. 转账金额越高，优先级越高。
3. ...

### create 

创建区块，主要是如下步骤：

1. 使用 sortTransactions 对目前待确认交易列表进行排序
2. 计算区块高度：根据上一个区块的高度 + 1
3. 根据区块高度计算这个区块的奖励。
4. 开始遍历待确认交易列表：
    1. 获取本次交易的字节数(普通转账交易的字节数大概是117)，累加这些字节数大小。
    2. 如果累加的字节数大于阈值 (8M)，则结束遍历。
    3. 累加遍历到的交易的手续费，转账金额。
    4. 用每个交易的hash值算出本次block的hash。
5. 赋值区块变量并返回。 

区块变量的主要字段如下：

1. version: 目前是写死的0
2. totalAmount: 累计打包交易的总金额
3. totalFee: 累加的打包交易的总手续费
4. reward: 本次产块的给旷工的奖励
5. payloadHash: 区块hash，是通过之前打包的交易计算出来。
6. previousBlock:  上一个区块的id
7. generatorPublicKey: 该区块生产者的公钥
8. transactions: 打包的交易列表
9. blockSignature: 区块签名，签名需要用到当前旷工的私钥，并打包上该区块的主要信息中打出的签名。

以下这个是示例：

```
{
    "version": 0, 
    "totalAmount": 99, 
    "totalFee": 10000000, 
    "reward": 350000000, 
    "payloadHash": "807b83f4b85c21a86449a94fce742844eca8144db177307d3828701826c16608", 
    "timestamp": 53117160, 
    "numberOfTransactions": 1, 
    "payloadLength": 117, 
    "previousBlock": "55399c10ee7cdb313d40c8f4c87a4253d4590c4fea27d29cefd60256617f9784", 
    "generatorPublicKey": "9423778b5b792a9919b3813e756421ab30d13c4c1743f6a1d2aa94b60eae60bf", 
    "transactions": [
        {
            "type": 0, 
            "amount": 99, 
            "fee": 10000000, 
            "recipientId": "15748476572381496732", 
            "timestamp": 53117146, 
            "asset": { }, 
            "senderPublicKey": "8e5178db2bf10555cb57264c88833c48007100748d593570e013c9b15b17004e", 
            "signature": "685fc7a43dc2ffb64e87ed5250d546f73e027a81faf1bd9d060c6333db37a49b47fbabf1d5f072b3320f59b0e87be6255808e270f096d2fd73a3e9d8433d3f0d", 
            "id": "807b83f4b85c21a86449a94fce742844eca8144db177307d3828701826c16608", 
            "senderId": "6518038767050467653"
        }
    ], 
    "blockSignature": "ba14abf575a5edc77972299182cfe7340e87fe4677c23ceccf7b12e340684126f8b42432fd3a0e262b2cd92b5d0e793804c9cb2e03029ae3ddb1315b74889103"
}
```

### getBytes

把 create 产出的 block 对象序列化成一个二进制序列。

序列化的字节分配方式依次如下： 

+ 4 bytes: version
+ 4 bytes: 时间戳
+ 64 bytes: 上一个区块的区块id
+ 4 bytes: numberOfTransactions 
+ 8 bytes: totalAmount
+ 8 bytes: totalFee
+ 8 bytes: reward
+ 4 bytes: payloadLength 因为 payloadLength 的最大值是 8M，而已 4bytes 足够了
+ 32 bytes: payloadHash 这里需要注意的是 block.payloadHash 字符串的是16进制的字符串，所以对于 block.payloadHash 字符串长度=64 (4bit x 64=256bit)，但是序列化后的 bytes 是 32 bytes (8bit x 32 = 256 bit)。
+ 32 bytes: generatorPublicKey
+ 64 bytes: blockSignature 

所以一个区块的字节数是 232 字节。

### getHash

先用 getBytes 获取二进制序列化的字节数组，然后使用这个字节数组进行 sha256 hash 就是本 block 的 Hash 值。

### getId & getId2

目前使用的 getId 是 getId2 的封装。
getId2 其实就是 getHash 的哈希值的16进制的字符串。 

### dbSave & dbRead

把 create 创建的 block 对象写入 dbLite 的 blocks 数据表中。
字段一一对应，没啥好讲的。
dbRead 和 dbSave 一一对应，但是比 dbSave 多出一个 confirmations 字段。

## 总结

这个模块是核心模块，读完之后具体上对区块有一个非常具体的认识了。

[Asch源码base模块之Account]:https://yanyiwu.com/work/2018/03/03/asch-base-account.html
