---
layout: posting
title: EOS智能合约操作
---

# EOS智能合约操作

## [eosio.token](https://eospark.com/contract/eosio.token?tab=abi)

转账其实就是最常见的智能合约应用。

智能合约的说明书就是合约ABI，以 eosio.token 合约为例。[eosio.token](https://eospark.com/contract/eosio.token?tab=abi) 可以看到
ABI。

比如我们想执行转账操作。我们需要通过 eosio.token 这个合约的 transfer 操作来进行。要调用 transfer ，先查询下合约ABI。

如下：

```
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
```



