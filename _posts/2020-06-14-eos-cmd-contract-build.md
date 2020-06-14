---
layout: post
title: EOS命令行智能合约部署
date: 2020-06-14
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

> 编译合约的时候在 ubuntu 上会出现编译最后一步卡死的情况，详细可查：
> [issue: compile token never finish](https://github.com/EOSIO/eosio.cdt/issues/471)

不过在 mac 上就可以编译成功。
编译成功后会出现 eosio.token.wasm 和 eosio.token.abi 这两个文件。

开始往我们的账号上传我们编译好的合约。

```
cleos -u https://api.testnet.eos.io set contract zbldzychiboa ./ eosio.token.wasm eosio.token.abi -p zbldzychiboa@owner
Reading WASM from /home/yanyiwu/code/eosio/contracts/eosio.contracts/contracts/eosio.token/eosio.token.wasm...
Publishing contract...
Error 3080001: Account using more than allotted RAM usage
Error Details:
account zbldzychiboa has insufficient ram; needs 180604 bytes has 9579 bytes
```

提示说我RAM不足，如果在主网上遇到这个问题，就需要真金白银的用EOS买内存了。
不过在测试网的优势就是，无限印钞。反正在测试网上可以无限申请代币。在测试网上的代币是TNT，所以是通过TNT购买内存。

用TNT购买内存的方式如下：

```
cleos -u https://api.testnet.eos.io system buyram zbldzychiboa zbldzychiboa "10 TNT" -p zbldzychiboa@owner
executed transaction: ff8b64455eca5b3e0785a871341ba5f70a2850bc52a9e5332f74be1265d7c8cf  128 bytes  597 us
#         eosio <= eosio::buyram                {"payer":"zbldzychiboa","receiver":"zbldzychiboa","quant":"10.0000 TNT"}
#   eosio.token <= eosio.token::transfer        {"from":"zbldzychiboa","to":"eosio.ram","quantity":"9.9500 TNT","memo":"buy ram"}
#  zbldzychiboa <= eosio.token::transfer        {"from":"zbldzychiboa","to":"eosio.ram","quantity":"9.9500 TNT","memo":"buy ram"}
#     eosio.ram <= eosio.token::transfer        {"from":"zbldzychiboa","to":"eosio.ram","quantity":"9.9500 TNT","memo":"buy ram"}
#   eosio.token <= eosio.token::transfer        {"from":"zbldzychiboa","to":"eosio.ramfee","quantity":"0.0500 TNT","memo":"ram fee"}
#  zbldzychiboa <= eosio.token::transfer        {"from":"zbldzychiboa","to":"eosio.ramfee","quantity":"0.0500 TNT","memo":"ram fee"}
#  eosio.ramfee <= eosio.token::transfer        {"from":"zbldzychiboa","to":"eosio.ramfee","quantity":"0.0500 TNT","memo":"ram fee"}>>>>>>>
```

如上可以看到，使用了 10 TNT 沟通内存，其中 0.05 TNT 也就是万分之五的 TNT 作为内存手续费。

然后重新再上传一次合约，就可以上传成功了。

```
cleos -u https://api.testnet.eos.io set contract zbldzychiboa ./ eosio.token.wasm eosio.token.abi -p zbldzychiboa@owner

Reading WASM from /home/yanyiwu/code/eosio/contracts/eosio.contracts/contracts/eosio.token/eosio.token.wasm...
Publishing contract...
executed transaction: e8f9e5433664efdb9173150e00c428ddf0affcf2135db1a65722903426bff51c  6992 bytes  1075 us
#         eosio <= eosio::setcode               {"account":"zbldzychiboa","vmtype":0,"vmversion":0,"code":"0061736d0100000001a0011b60000060017e00600...
#         eosio <= eosio::setabi                {"account":"zbldzychiboa","abi":"0e656f73696f3a3a6162692f312e310008076163636f756e7400010762616c616e6...}>"}>
```

上传成功后比较重要是的是看 abi ，abi可以理解为这个合约的使用说明书。
如下命令可以看abi文件。

```
cleos -u https://api.testnet.eos.io get abi zbldzychiboa

...
```

上传合约后，这个合约对外形式就是以账号的方式存在，调用合约的方式就是对这个账号的abi进行push action操作。
简单说 eosio.token 这个合约其实负责代币的生成和转账等。下面可以试一下这个合约的基本操作。

创建最大分发数量为 100 ，精度为 1 的名字叫 YY 的代币，如下：

```
cleos -u https://api.testnet.eos.io push action zbldzychiboa create '{"issuer":"zbldzychiboa", "maximum_supply":"100 YY"}' -p zbldzychiboa@owner

executed transaction: a5eed6cb13fdf7dd7f7b3913f591dd23f752a376105239399046baddf5fc8d6f  120 bytes  314 us
#  zbldzychiboa <= zbldzychiboa::create         {"issuer":"zbldzychiboa","maximum_supply":"100 YY"}
```

一个合约账号可以创建多种代币，如下是创建名字为 ZZ 的代币：

```
cleos -u https://api.testnet.eos.io push action zbldzychiboa create '{"issuer":"zbldzychiboa", "maximum_supply":"100 ZZ"}' -p zbldzychiboa@owner

executed transaction: 9b0751cc8178dabbc0e22e8ee03b085aea6e8332270523621c52478b0b0a170d  120 bytes  284 us
#  zbldzychiboa <= zbldzychiboa::create         {"issuer":"zbldzychiboa","maximum_supply":"100 ZZ"}
```

注意到此时，我们只是创建了代币，但是并没有开始发行代币，所以可以看到我们的账号目前所拥有的zbldzychiboa发行的代币还是为空。
命令如下：

```
cleos -u https://api.testnet.eos.io get currency balance zbldzychiboa zbldzychiboa
```

接下来是开始发行代币，我们发行 10 ZZ 给 zbldzychiboa 账号。

```
cleos -u https://api.testnet.eos.io push action zbldzychiboa issue '{"to":"zbldzychiboa", "quantity":"10 ZZ", "memo":"test"}' -p zbldzychiboa@owner
executed transaction: 0b00010a576df58aa7ebab5e35552fa4c12d371a1e7091edfa4e67770810889c  128 bytes  359 us
#  zbldzychiboa <= zbldzychiboa::issue          {"to":"zbldzychiboa","quantity":"10 ZZ","memo":"test"}
```

发行后就可以看到账号已经拥有了对应数量的 ZZ 代币。

```
cleos -u https://api.testnet.eos.io get currency balance zbldzychiboa zbldzychiboa
10 ZZ
```

这里需要区分的是，合约和账号是绑定的，比如同一个eosio.token 合约，可以部署在不同账号。
我们已知 eosio.token 合约被部署到 eosio.token 账号和 zbldzychiboa 账号。所以查询余额的时候可以指定那两个合约账号分别查一下就可以看出区别： 

eosio.token 这个账号的代币，就可以看到是拥有 TNT ，而不是 YY, ZZ 如下：

```
cleos -u https://api.testnet.eos.io get currency balance eosio.token zbldzychiboa
30.9996 TNT
```

发行 ZZ 代币也是同理：

```
cleos -u https://api.testnet.eos.io push action zbldzychiboa issue '{"to":"zbldzychiboa", "quantity":"10 YY", "memo":"test"}' -p zbldzychiboa@owner
executed transaction: 9ac96181e71ac868f99fda33ba10ac7073dec8e0531d98d3057cc07cf9e406f8  128 bytes  277 us
#  zbldzychiboa <= zbldzychiboa::issue          {"to":"zbldzychiboa","quantity":"10 YY","memo":"test"}>


cleos -u https://api.testnet.eos.io get currency balance zbldzychiboa zbldzychiboa
10 YY
10 ZZ
```

合约是按账号来隔离的，比如虽然 eosio.token 已经创建了一个 TNT 代币，但是在我们账号上仍然可以再创建一个 TNT 代币。如下：

```
cleos -u https://api.testnet.eos.io push action zbldzychiboa create '{"issuer":"zbldzychiboa", "maximum_supply":"100 TNT"}' -p zbldzychiboa@owner
executed transaction: 6b80ddb78160094c41284c0816ed5d249b1917fa7e892d241df7bf8b280addf1  120 bytes  344 us
#  zbldzychiboa <= zbldzychiboa::create         {"issuer":"zbldzychiboa","maximum_supply":"100 TNT"}>

cleos -u https://api.testnet.eos.io push action zbldzychiboa create '{"issuer":"zbldzychiboa", "maximum_supply":"100.0000 TNTA"}' -p zbldzychiboa@owner
executed transaction: 9b0e0bc29305632689922574bd7a1f75ac13c328c2e71151627ae5bc99b9784f  120 bytes  271 us
#  zbldzychiboa <= zbldzychiboa::create         {"issuer":"zbldzychiboa","maximum_supply":"100.0000 TNTA"}>

cleos -u https://api.testnet.eos.io push action zbldzychiboa issue '{"to":"zbldzychiboa", "quantity":"10.0000 TNTA", "memo":"test"}' -p zbldzychiboa@owner
executed transaction: 6f1a825f848ae66b0076fe6371a5990a2b335b5b3d4fec1bf2d55944b29ad7aa  128 bytes  310 us
#  zbldzychiboa <= zbldzychiboa::issue          {"to":"zbldzychiboa","quantity":"10.0000 TNTA","memo":"test"}>
```

到这里基本上关于 eosio.token 这个合约的操作就比较清楚了，包括如何去发行代币，都比较清楚了。

## ABI 数据库

上面 push action 本质上其实都是在操作区块链这个数据库。
ABI 里也有这个数据库的查询接口，如下：

```
"tables": [
    {
        "name": "accounts",
        "type": "account",
        "index_type": "i64",
        "key_names": [],
        "key_types": []
    },
    {
        "name": "stat",
        "type": "currency_stats",
        "index_type": "i64",
        "key_names": [],
        "key_types": []
    }
],
```

根据上面的接口，我们可以通过 get table 获取数据库内容信息。

获取 ZZ 代币的数据信息，如下：

```
cleos -u https://api.testnet.eos.io get table zbldzychiboa ZZ stat
{
  "rows": [{
        "supply": "10 ZZ",
        "max_supply": "100 ZZ",
        "issuer": "zbldzychiboa"
      }
    ],
  "more": false,
  "next_key": ""
}
```

获取某账号的相关代币信息。

```
cleos -u https://api.testnet.eos.io get table zbldzychiboa zbldzychiboa accounts
{
  "rows": [{
        "balance": "10 YY"
      },{
            "balance": "10 ZZ"
          },{
                "balance": "10.0000 TNTA"
              }
    ],
  "more": false,
  "next_key": ""
}
```

后面再介绍一下 eosio.token 这个合约的源码，
会比较清楚 action 和 table 的关系。

