---
layout: post
title: EOS命令行智能合约调用操作
date: 2020-01-19
display: onlydetail
---

# EOS命令行智能合约操作

## 转账是最常用的合约

[eosio.token](https://eospark.com/contract/eosio.token?tab=abi) 转账其实就是最常见的智能合约应用。

智能合约的说明书就是合约ABI，以 eosio.token 合约为例。[eosio.token](https://eospark.com/contract/eosio.token?tab=abi) 可以看到
ABI。

比如我们想执行转账操作。我们需要通过 eosio.token 这个合约的 transfer 操作来进行。要调用 transfer ，先查询下合约ABI。

```
cleos -u http://peer1.eoshuobipool.com:8181 get abi eosio.token

...
{
  "name": "transfer",
  "base": "",
  "fields": [
    {
      "name": "from",
      "type": "name"
    },
    {
      "name": "to",
      "type": "name"
    },
    {
      "name": "quantity",
      "type": "asset"
    },
    {
      "name": "memo",
      "type": "string"
    }
  ]
}
...
```

可以看到 fields 需要四个字段，分别是 from,to,quantity,memo ，基本上顾名思义能知道需要填写的内容。
如下：

```
cleos -u http://peer1.eoshuobipool.com:8181 push action eosio.token transfer '{"from": "abtestabtest", "to": "practicetest", "quantity": "0.0001 EOS", "memo": "hello eosio.token contract"}' -p abtestabtest@active

executed transaction: f97ae156ab4ba26e7d8d021297d841cf769423a42c7dfead21a332893a989277  152 bytes  333 us
#   eosio.token <= eosio.token::transfer        {"from":"abtestabtest","to":"practicetest","quantity":"0.0001 EOS","memo":"hello eosio.token contrac...
#  abtestabtest <= eosio.token::transfer        {"from":"abtestabtest","to":"practicetest","quantity":"0.0001 EOS","memo":"hello eosio.token contrac...
#  practicetest <= eosio.token::transfer        {"from":"abtestabtest","to":"practicetest","quantity":"0.0001 EOS","memo":"hello eosio.token contrac...
warning: transaction executed locally, but may not be confirmed by the network yet
```

这个智能合约调用需要稍微理解下。

大概可以把这个命令稍微翻译下：

```
account = eosio.token 
action = transfer 
actiondata = {"from": "abtestabtest", "to": "practicetest", "quantity": "0.0001 EOS", "memo": "hello eosio.token contract"}
```

切记：合约和账号强相关。

当我们要转账 EOS 的时候，请求的账号是 eosio.token 。
要转账其他代币的时候，就需要找到该代币对于的合约地址。
比如要转账 POW 代币，如果账号仍然是写 eosio.token ，则会报错，如下：

```
cleos -u https://eospush.tokenpocket.pro push action eosio.token transfer '{"from": "practicetest", "to": "eosioyanyiwu", "quantity": "0.0001 POW", "memo": "hello eosio.token contract"}' -p practicetest@active
Error 3050003: eosio_assert_message assertion failure
Error Details:
assertion failure with message: unable to find key
pending console output:
```

如果要正确转账，需要知道 POW 代币的合约账号是 eosiopowcoin ，并且要知道 POW 的精度是 8个小数点。这些信息可以通过区块链浏览器查阅到，比如 [bloks](https://bloks.io/tokens)

正确转账 POW 代币如下：

```
cleos -u https://eospush.tokenpocket.pro push action eosiopowcoin transfer '{"from": "practicetest", "to": "eosioyanyiwu", "quantity": "0.00000001 POW", "memo": "hello eosio.token contract"}' -p practicetest@active
executed transaction: fbcbc2cdad4f47d1c50adf883db0b8874c0e9706f89d72ecaf5098978b2419c6  152 bytes  1170 us
#  eosiopowcoin <= eosiopowcoin::transfer       {"from":"practicetest","to":"eosioyanyiwu","quantity":"0.00000001 POW","memo":"hello eosio.token con...
#  practicetest <= eosiopowcoin::transfer       {"from":"practicetest","to":"eosioyanyiwu","quantity":"0.00000001 POW","memo":"hello eosio.token con...
#  eosioyanyiwu <= eosiopowcoin::transfer       {"from":"practicetest","to":"eosioyanyiwu","quantity":"0.00000001 POW","memo":"hello eosio.token con...}>}>"}
```


