---
layout: post
title: EOS Testnet 入门
date: 2020-06-13  
---

# EOS Testnet 入门

区块链编程和其他互联网编程技术很大的一点不同点就是关于『主网』和『测试网』。
在互联网里面，一般关于数据的交互，都是通过数据库，一般是启动一个本地数据库。
对于数据安全，一般是通过线上数据库和测试环境的数据库权限隔离来做。
而不存在说把线上数据库直接暴露给用户来访问和修改的情况。

而区块链就是一个特殊的数据库，这个数据库是直接把数据完全公开在链上被访问和修改。
每一个区块链用户，都是在实时访问和修改同一条主链的数据。
但是链上资源是有限的，比如发布一个智能合约，是需要占用链上内存资源。
如果在主链上操作，是需要花钱买资源才能操作。这样的话测试成本一下子就上去了。
要避开这个测试成本，所以我们需要一个Testnet，也就是测试网来进行无成本的尝试。

eos 链上之前比较流行的是 [jungle-testnet](https://monitor.jungletestnet.io/#register)，是一个社区自发做的测试链。
不过后来 eosio 出了一个官方的 testnet 来做新版本的 eos 测试等工作，也提供给开发者更好的测试体验。
也就是本文要介绍的 [testnet.eos.io]

## [testnet.eos.io]

通过入口里的 Start Building，通过邮箱注册后，就可以自助申请账号。

主要包括一下主要信息：

申请账号：网站会给你一个随机字母的账号供你使用。  

账号余额：测试链上的代币是 TNT（类似主网上的 EOS），而且如果资源不足的话，还可以持续申请更多 TNT。

## [Testnet Info]

测试网的信息可以通过 [Testnet Info]去看，主要关注以下信息：

API Endpoint: https://api.testnet.eos.io

P2P Endpoint: seed.testnet.eos.io:9876

有这些信息就可以用客户端命令 cleos 对测试网进行操作。
比如：

```
cleos -u https://api.testnet.eos.io get info
{
  "server_version": "b39b6bd3",
  "chain_id": "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f",
  "head_block_num": 1955348,
  "last_irreversible_block_num": 1955022,
  "last_irreversible_block_id": "001dd4ce9a72dcac39ccd662e254fd2600f8184e768445cb477863134dd21135",
  "head_block_id": "001dd6141229e75e3b347cfc1f4fb98fd854203574072d5bf8439c33259eda78",
  "head_block_time": "2020-05-04T12:21:18.500",
  "head_block_producer": "initj",
  "virtual_block_cpu_limit": 200000000,
  "virtual_block_net_limit": 1048576000,
  "block_cpu_limit": 199900,
  "block_net_limit": 1048576,
  "server_version_string": "v2.0.4"
}
```

## Blockchain Accounts

在测试网上我申请了两个账号，分别是 zbldzychiboa 和 lxhaduruvcio 。

```
cleos -u https://api.testnet.eos.io get account zbldzychiboa                          

created: 2020-04-23T04:49:11.500
permissions:
     owner     1:    1 EOS5zmo9epkx52b2eCf7wE3r19sz7ttDQifpazRwS8aBURzzcGdhQ
        active     1:    1 EOS5fpQxDV3gM7QLcTyiYEjzgCb7jrQU2aj4D5rEuhDscSbBkRySe
memory:
     quota:     9.354 KiB    used:     3.365 KiB

net bandwidth:
     staked:          1.0000 TNT           (total stake delegated from account to self)
     delegated:       0.0000 TNT           (total staked delegated to account from others)
     used:                 0 bytes
     available:        2.286 MiB
     limit:            2.286 MiB

cpu bandwidth:
     staked:          1.0000 TNT           (total stake delegated from account to self)
     delegated:       0.0000 TNT           (total staked delegated to account from others)
     used:                 0 us
     available:        457.1 ms
     limit:            457.1 ms

TNT balances:
     liquid:           62.0000 TNT
     staked:            2.0000 TNT
     unstaking:         0.0000 TNT
     total:            64.0000 TNT

producers:     <not voted>
```

```
cleos -u https://api.testnet.eos.io get account lxhaduruvcio 

created: 2020-04-23T04:49:11.500
permissions:
     owner     1:    1 EOS7SR4XybmtEcexnXsDfm8NAkbhwhqA91LTwBw7AQmiggHYvBHZf
        active     1:    1 EOS5ojPty5mUuuAbdV4yZfPUmxqvCxJfVSSZsub1DgiouQUt9Hsra
memory:
     quota:     9.354 KiB    used:     3.365 KiB

net bandwidth:
     staked:          1.0000 TNT           (total stake delegated from account to self)
     delegated:       0.0000 TNT           (total staked delegated to account from others)
     used:                 0 bytes
     available:        2.286 MiB
     limit:            2.286 MiB

cpu bandwidth:
     staked:          1.0000 TNT           (total stake delegated from account to self)
     delegated:       0.0000 TNT           (total staked delegated to account from others)
     used:                 0 us
     available:        457.1 ms
     limit:            457.1 ms

TNT balances:
     liquid:           42.0000 TNT
     staked:            2.0000 TNT
     unstaking:         0.0000 TNT
     total:            44.0000 TNT

producers:     <not voted>
```

## Transfer Token

通过命令行可以查到这个两个账号都有TNT代币，接下来我们试一下转账。

```
cleos -u https://api.testnet.eos.io get abi eosio.token

......
{
	"name": "transfer",
		"base": "",
		"fields": [{
			"name": "from",
			"type": "name"
		},{
			"name": "to",
			"type": "name"
		},{
			"name": "quantity",
			"type": "asset"
		},{
			"name": "memo",
			"type": "string"
		}
		]
}
......

```

```
cleos -u https://api.testnet.eos.io push action eosio.token transfer '{"from":"zbldzychiboa", "to":"lxhaduruvcio", "quantity":"0.0001 TNT", "memo": "testnet blog in yanyiwu dot com"}' -p zbldzychiboa@owner

executed transaction: a651189453d72be00f5e69aa6049c667df87127b65f92e84b353153146bf3a9e  160 bytes  336 us
#   eosio.token <= eosio.token::transfer        {"from":"zbldzychiboa","to":"lxhaduruvcio","quantity":"0.0001 TNT","memo":"testnet blog in yanyiwu d...
#  zbldzychiboa <= eosio.token::transfer        {"from":"zbldzychiboa","to":"lxhaduruvcio","quantity":"0.0001 TNT","memo":"testnet blog in yanyiwu d...
#  lxhaduruvcio <= eosio.token::transfer        {"from":"zbldzychiboa","to":"lxhaduruvcio","quantity":"0.0001 TNT","memo":"testnet blog in yanyiwu d...
```

关于转账金额精度这个还遇到一个非常反人性的体验，有遇到精度报错的可以参考 [issue](https://github.com/EOSIO/eos/issues/9037)

接下来就是尝试在测试网上测试合约的上传了，这也是测试网存在的主要意义，毕竟如果在主网上上传智能合约，是需要真金白银买ram才能上传成功的。

在后面一篇博文会专门介绍智能合约的编译和上传测试。

[testnet]:https://testnet.eos.io/
[testnet.eos.io]:https://testnet.eos.io/
[Testnet Info]:https://testnet.eos.io/explorer-info
