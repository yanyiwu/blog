---
layout: posting
title: EOS命令行账号操作入门
---

# EOS命令行账号操作入门

EOS账号体系相对BTC和ETH是一个很创新的做法，对于很多区块链入门者来说也是比较难懂的地方。

BTC和ETH没有账号的概念，只有地址，转账都是发生在地址上，所以每次转账需要手续费，矿工才愿意打包这个转账交易。

EOS的账号概念优点是转账免手续费，但是需要抵押资源，就是把EOS换成资源抵押在这个账号上（后续随时可以解除抵押，没有任何费用），只要抵押的资源足够，这个账号的任何操作，包括转账等，都能正常使用。

缺点就是，当链上交易很多的时候，要抵押很多EOS才能换取足够的资源。也就是网络拥堵问题。这是区块链的最大问题之一。

## 抵押资源

为他人抵押资源

抵押资源，抵押资源的特点在于可以回收。类似一种租借，随时可以讨回来。
比如 githubdancer 这个账号没有资源导致无法转账的话。可以用自己的账号，比如practicetest 抵押资源给 githubdancer ，

```
cleos -u http://peer1.eoshuobipool.com:8181 system delegatebw practicetest githubdancer '0 EOS' '1 EOS'

executed transaction: d8f2bd6d0514099bc91347b72a317e3103c30ac9a882082e96e508b7b1510ef4  144 bytes  2287 us
#         eosio <= eosio::delegatebw            {"from":"practicetest","receiver":"githubdancer","stake_net_quantity":"0.0000 EOS","stake_cpu_quanti...
#   eosio.token <= eosio.token::transfer        {"from":"practicetest","to":"eosio.stake","quantity":"1.0000 EOS","memo":"stake bandwidth"}
#  practicetest <= eosio.token::transfer        {"from":"practicetest","to":"eosio.stake","quantity":"1.0000 EOS","memo":"stake bandwidth"}
#   eosio.stake <= eosio.token::transfer        {"from":"practicetest","to":"eosio.stake","quantity":"1.0000 EOS","memo":"stake bandwidth"}
warning: transaction executed locally, but may not be confirmed by the network yet
```

为自己抵押资源

```
cleos -u http://peer1.eoshuobipool.com:8181 system delegatebw githubdancer githubdancer '0 EOS' '1 EOS'
executed transaction: 91cfa957e653cccd8d36d8bf02966534c62398e79fca0bb5c83acc1043ee09b4  144 bytes  516 us
#         eosio <= eosio::delegatebw            {"from":"githubdancer","receiver":"githubdancer","stake_net_quantity":"0.0000 EOS","stake_cpu_quanti...
#   eosio.token <= eosio.token::transfer        {"from":"githubdancer","to":"eosio.stake","quantity":"1.0000 EOS","memo":"stake bandwidth"}
#  githubdancer <= eosio.token::transfer        {"from":"githubdancer","to":"eosio.stake","quantity":"1.0000 EOS","memo":"stake bandwidth"}
#   eosio.stake <= eosio.token::transfer        {"from":"githubdancer","to":"eosio.stake","quantity":"1.0000 EOS","memo":"stake bandwidth"}
warning: transaction executed locally, but may not be confirmed by the network yet
```

## 创建账号

这个过程是比较复杂的过程了。

每次创建账号必须填写，创建账号的父账号（因为创建账号所需的资源是父账号来出。），
创建账号需要购买内存和抵押资源（资源包括CPU和网络），这里面可以理解为，购买内存就是真正创建账号所需要消耗的。
因为购买后，以后如果内存要卖回去，也无法全量卖出去，毕竟账号本身就占用了内存。而且卖出去的价格也不确定是当时买的价格，或涨或跌，但是长期来看，内存价格应该是下降的趋势。

抵押资源就不一样了，可以随时换回EOS。这里有些不理解的地方就是那换回EOS的操作也是需要资源的，那怎么办。可以用其他账号给这个账号抵押，去进行操作就行。

所以【购买】内存和【抵押】资源，这里的【购买】和【抵押】用词就是很耐人寻味了。

```
cleos -u http://peer1.eoshuobipool.com:8181 system newaccount practicetest abtestabtest EOS8YxL7guMHL8ro3E3PcnFUn4Hkxm7w1uPcyicZRziPVsbFyNJYj EOS6Xe5G1KZVVqYm1gGwPWHUybYph3eK9nW7Kh23Z1WXjvgJEbc2k --buy-ram "0.2 EOS" --stake-net '0.1 EOS' --stake-cpu '0.2 EOS'

executed transaction: 2e0641efd795b94ad4bd54353e3273013e156a4cb5ca8bb0d908fbba42098612  344 bytes  3437 us
#         eosio <= eosio::newaccount            {"creator":"practicetest","name":"abtestabtest","owner":{"threshold":1,"keys":[{"key":"EOS8YxL7guMHL...
#         eosio <= eosio::buyram                {"payer":"practicetest","receiver":"abtestabtest","quant":"0.2000 EOS"}
#   eosio.token <= eosio.token::transfer        {"from":"practicetest","to":"eosio.ram","quantity":"0.1990 EOS","memo":"buy ram"}
#  practicetest <= eosio.token::transfer        {"from":"practicetest","to":"eosio.ram","quantity":"0.1990 EOS","memo":"buy ram"}
#     eosio.ram <= eosio.token::transfer        {"from":"practicetest","to":"eosio.ram","quantity":"0.1990 EOS","memo":"buy ram"}
#   eosio.token <= eosio.token::transfer        {"from":"practicetest","to":"eosio.ramfee","quantity":"0.0010 EOS","memo":"ram fee"}
#  practicetest <= eosio.token::transfer        {"from":"practicetest","to":"eosio.ramfee","quantity":"0.0010 EOS","memo":"ram fee"}
#  eosio.ramfee <= eosio.token::transfer        {"from":"practicetest","to":"eosio.ramfee","quantity":"0.0010 EOS","memo":"ram fee"}
#   eosio.token <= eosio.token::transfer        {"from":"eosio.ramfee","to":"eosio.rex","quantity":"0.0010 EOS","memo":"transfer from eosio.ramfee t...
#  eosio.ramfee <= eosio.token::transfer        {"from":"eosio.ramfee","to":"eosio.rex","quantity":"0.0010 EOS","memo":"transfer from eosio.ramfee t...
#     eosio.rex <= eosio.token::transfer        {"from":"eosio.ramfee","to":"eosio.rex","quantity":"0.0010 EOS","memo":"transfer from eosio.ramfee t...
#         eosio <= eosio::delegatebw            {"from":"practicetest","receiver":"abtestabtest","stake_net_quantity":"0.1000 EOS","stake_cpu_quanti...
#   eosio.token <= eosio.token::transfer        {"from":"practicetest","to":"eosio.stake","quantity":"0.3000 EOS","memo":"stake bandwidth"}
#  practicetest <= eosio.token::transfer        {"from":"practicetest","to":"eosio.stake","quantity":"0.3000 EOS","memo":"stake bandwidth"}
#   eosio.stake <= eosio.token::transfer        {"from":"practicetest","to":"eosio.stake","quantity":"0.3000 EOS","memo":"stake bandwidth"}
warning: transaction executed locally, but may not be confirmed by the network yet
```

创建成功后可以用账号名查询到账号信息了。

```
cleos -u http://peer1.eoshuobipool.com:8181 get account abtestabtest

created: 2019-11-06T15:49:45.000
permissions:
     owner     1:    1 EOS8YxL7guMHL8ro3E3PcnFUn4Hkxm7w1uPcyicZRziPVsbFyNJYj
        active     1:    1 EOS6Xe5G1KZVVqYm1gGwPWHUybYph3eK9nW7Kh23Z1WXjvgJEbc2k
memory:
     quota:     4.077 KiB    used:     2.926 KiB

net bandwidth:
     delegated:       0.1000 EOS           (total staked delegated to account from others)
     used:                 0 bytes
     available:        74.62 KiB
     limit:            74.62 KiB

cpu bandwidth:
     delegated:       0.2000 EOS           (total staked delegated to account from others)
     used:                 0 us
     available:           20 us
     limit:               20 us
```

变更账号的权限

```
cleos -u http://peer1.eoshuobipool.com:8181 set account permission abtestabtest active '{"threshold": 1, "keys": [{"key": "EOS6Xe5G1KZVVqYm1gGwPWHUybYph3eK9nW7Kh23Z1WXjvgJEbc2k", "weight": 1}, {"key": "EOS7NQgj1E6xAHNvgjqjCvQ5eksPd2paHFyyUub9wwuyFhGZDrSgy", "weight": 1}]}' owner

executed transaction: 6fc9eb30ea547006d74e342ab5effc66bebb9539405111227a02547b4b2fd4de  200 bytes  169 us
#         eosio <= eosio::updateauth            {"account":"abtestabtest","permission":"active","parent":"owner","auth":{"threshold":1,"keys":[{"key...
warning: transaction executed locally, but may not be confirmed by the network yet
```

这里需要注意的是，每次变更都是一次重写，所以如果要删除权限，也是重写权限的时候不带上你不想要的权限的公钥就行。

```
cleos -u http://peer1.eoshuobipool.com:8181 set account permission abtestabtest active '{"threshold": 1, "keys":  [{"key": "EOS7NQgj1E6xAHNvgjqjCvQ5eksPd2paHFyyUub9wwuyFhGZDrSgy", "weight": 1}]}' owner
executed transaction: 9703e3610417dfdd44ce02b9ebf325ea440248c95fff41e53ea74b643e326114  160 bytes  232 us
#         eosio <= eosio::updateauth            {"account":"abtestabtest","permission":"active","parent":"owner","auth":{"threshold":1,"keys":[{"key...
```
