---
layout: posting
title: EOS命令行手记
---

> 抖音，记录美好生活；  
> 区块，记录真实历史。

## 安装

EOS命令行三巨头：keosd,nodeos,cleos.

- keosd: 存储私钥的钱包
- nodeos: 区块链节点，也可以理解为区块链Server。
- cleos: 命令行客户端。

## 启动钱包服务

私钥，区块链世界最重要的东西，就是守护你区块链财富的长密码，特别特别长，人脑记不住。
所以我们一般需要钱包来存储它，钱包存储它有个好处。一个钱包可以存储多个私钥。
keosd 就是一个托管钱包的服务。

启动服务命令如下：

```
keosd &
```

## 创建钱包


```
cleos wallet list
```

先列出目前所有钱包。

```
cleos wallet create --name testwallet --file testwallet.password
```

创建名字为 testwallet 的钱包，并且把这个钱包的密码写到 testwallet.password ，
这里的 testwallet.password 里面的密码，注意，不是私钥，只是这个钱包的密码，用来加密这个钱包所包含私钥的密码。
只是这个密码默认生成方式太复杂，看上去长得有点像私钥。

## 创建账号

之前是创建钱包，但是钱包是一个本地的东西，但是我们需要一个主网的账号，才能和外界进行转账等交互。

区块链的特点是每一个block都和前面的block有关，账号类似，每一个新账号，都是用之前已有账号创建，在创世区块中，包含了一堆创世账号，就是所有账号的鼻祖。

对于普通用户来说，创建账号目前最简单的方式是下载 tokenpocket 钱包，通过手机支付来创建eos账号。具体过程这里就不展开了。

创建好账号之后会有一个账号名和对应的私钥公钥。账号和私钥需要记下来。私钥需要保密，账号可以公开。

假设此时得到的账号名是 `{youraccountname}`, 对应的私钥是 `{yourprivatekey}` 。

```
cleos wallet import --name testwallet --private-key {yourprivatekey}
```

## 连上主网

> 我们通过 cleos 去请求主网，所以我们需要知道主网的地址，不过区块链厉害的地方就是，节点有多少个，地址就有多少个。
> 任何节点都是一个主网server，目前请求主网流行的方式是用这个节点：http://api.eosnewyork.io 

```
cleos -u http://api.eosnewyork.io get info
```

获取主网信息，主要是最新区块信息。

```
cleos -u http://api.eosnewyork.io system listproducers

Producer      Producer key                                              Url
eoshuobipool  EOS5XKswW26cR5VQeDGwgNb5aixv1AMcKkdDNrC59KzNSBfnH6TR7     https://www.eoshuobipool.com
okcapitalbp1  EOS6NqWZ1i9KSNoeBiby6Nmf1seAbEfhvrDoCbwSi1hV4cuqqnYRP     https://www.okex.com/eosbp/
eoseouldotio  EOS6SSA4gYCSZ3q9NWpxGsYDv5MWjSwKseyq25RRZexwj8EM6YHDa     https://www.eoseoul.io
newdex.bp     EOS688SnH8tQ7NiyhamiCzWXAGPDLF9S7K8ga79UBHKFgjS1MhqhB     https://newpool.io
bitfinexeos1  EOS4tkw7LgtURT3dvG3kQ4D1sg3aAtPDymmoatpuFkQMc7wzZdKxc     https://www.bitfinex.com
```

获取主网目前产块的节点信息。
只要在url后面再加上 /bp.json ，从返回结果里面找 `api_endpoint` 就是该节点的地址。比如 `https://www.eoshuobipool.com/bp.json`，

```
...
api_endpoint: "http://peer2.eoshuobipool.com:8181"
...
```

```
cleos -u http://peer2.eoshuobipool.com:8181 get info
```

所以获取区块链主网信息也可以换一个节点去请求，结果也是一样的。

## 转账 

```
cleos -u https://api.eoslaomao.com/ transfer practicetest gitatyanyiwu '0.001 EOS'

executed transaction: 99a9f8e1a01f436ff0b9e8865146efdf6ce74d7eeddbe201bcad5eac66c20eae  128 bytes  408 us
#   eosio.token <= eosio.token::transfer        {"from":"practicetest","to":"gitatyanyiwu","quantity":"0.0010 EOS","memo":""}
#  practicetest <= eosio.token::transfer        {"from":"practicetest","to":"gitatyanyiwu","quantity":"0.0010 EOS","memo":""}
#  gitatyanyiwu <= eosio.token::transfer        {"from":"practicetest","to":"gitatyanyiwu","quantity":"0.0010 EOS","memo":""}
```

这个前提是之前在 cleos wallet 已经 import 了 practicetest 权限组里面的私钥。

