---
layout: post
title: EOS命令行智能合约部署
date: 2020-05-31
display: onlydetail  
---

# EOS命令行智能合约操作

## 智能合约的部署

还是以转账这个合约为例。

```
#先获取合约的开源代码
git clone https://github.com/EOSIO/eosio.contracts
cd eosio.contracts/eosio.token
```

```
# 编译合约
eosio-cpp -I include -o eosio.token.wasm src/eosio.token.cpp --abigen
```

[issue: compile token never finish](https://github.com/EOSIO/eosio.cdt/issues/471)

to be continued

