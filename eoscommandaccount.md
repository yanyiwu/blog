---
layout: posting
title: EOS命令行账号操作手册
---

# EOS命令行账号操作手册

```
cleos -u http://peer1.eoshuobipool.com:8181 system delegatebw practicetest githubdancer '0 EOS' '1 EOS'

executed transaction: d8f2bd6d0514099bc91347b72a317e3103c30ac9a882082e96e508b7b1510ef4  144 bytes  2287 us
#         eosio <= eosio::delegatebw            {"from":"practicetest","receiver":"githubdancer","stake_net_quantity":"0.0000 EOS","stake_cpu_quanti...
#   eosio.token <= eosio.token::transfer        {"from":"practicetest","to":"eosio.stake","quantity":"1.0000 EOS","memo":"stake bandwidth"}
#  practicetest <= eosio.token::transfer        {"from":"practicetest","to":"eosio.stake","quantity":"1.0000 EOS","memo":"stake bandwidth"}
#   eosio.stake <= eosio.token::transfer        {"from":"practicetest","to":"eosio.stake","quantity":"1.0000 EOS","memo":"stake bandwidth"}
warning: transaction executed locally, but may not be confirmed by the network yet
```

```
cleos -u http://peer1.eoshuobipool.com:8181 system delegatebw githubdancer githubdancer '0 EOS' '1 EOS'
executed transaction: 91cfa957e653cccd8d36d8bf02966534c62398e79fca0bb5c83acc1043ee09b4  144 bytes  516 us
#         eosio <= eosio::delegatebw            {"from":"githubdancer","receiver":"githubdancer","stake_net_quantity":"0.0000 EOS","stake_cpu_quanti...
#   eosio.token <= eosio.token::transfer        {"from":"githubdancer","to":"eosio.stake","quantity":"1.0000 EOS","memo":"stake bandwidth"}
#  githubdancer <= eosio.token::transfer        {"from":"githubdancer","to":"eosio.stake","quantity":"1.0000 EOS","memo":"stake bandwidth"}
#   eosio.stake <= eosio.token::transfer        {"from":"githubdancer","to":"eosio.stake","quantity":"1.0000 EOS","memo":"stake bandwidth"}
warning: transaction executed locally, but may not be confirmed by the network yet
```


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

```
cleosm set account permission abtestabtest active '{"threshold": 1, "keys": [{"key": "EOS6Xe5G1KZVVqYm1gGwPWHUybYph3eK9nW7Kh23Z1WXjvgJEbc2k", "weight": 1}, {"key": "EOS7NQgj1E6xAHNvgjqjCvQ5eksPd2paHFyyUub9wwuyFhGZDrSgy", "weight": 1}]}' owner

executed transaction: 6fc9eb30ea547006d74e342ab5effc66bebb9539405111227a02547b4b2fd4de  200 bytes  169 us
#         eosio <= eosio::updateauth            {"account":"abtestabtest","permission":"active","parent":"owner","auth":{"threshold":1,"keys":[{"key...
warning: transaction executed locally, but may not be confirmed by the network yet
```
