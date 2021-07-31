---
layout: post
title: EOS合约源码分析:eosiopowcoin
date: 2020-07-11
display: onlydetail
---

# EOS合约源码分析:eosiopowcoin

提前假设：看这篇文章的读者之前已经看过 [EOS合约源码分析:eosio.token](http://yanyiwu.com/2020/06/20/eosio-token-source-code.html)

合约源码下载：

git clone https://github.com/NedAmarril/eosiopowcoin
cd eosiopowcoin
eosio-cpp -I . eosiopowcoin.cpp --abigen

接下来的就是按源码注释来走一遍：

## eosiopowcoin.hpp

```
#pragma once

#include <eosio/asset.hpp>
#include <eosio/eosio.hpp>

#include <string>

namespace eosiosystem {
   class system_contract;
}

namespace eosio {

   using std::string;

   class [[eosio::contract("eosiopowcoin")]] token : public contract {
      public:
         using contract::contract;

         [[eosio::action]]
         void create( const name&   issuer,
                      const asset&  maximum_supply);
         [[eosio::action]]
         void issue( const name& to, const asset& quantity, const string& memo );

         [[eosio::action]]
         void retire( const asset& quantity, const string& memo );

         [[eosio::action]]
         void transfer( const name&    from,
                        const name&    to,
                        const asset&   quantity,
                        const string&  memo );
         [[eosio::action]]
         void open( const name& owner, const symbol& symbol, const name& ram_payer );

         [[eosio::action]]
         void close( const name& owner, const symbol& symbol );

         [[eosio::action]]
         void setupminer(const name& user, const symbol& symbol);

         [[eosio::on_notify("eosio.token::transfer")]]
         void claim(name from, name to, eosio::asset quantity, std::string memo);

         static asset get_supply( const name& token_contract_account, const symbol_code& sym_code )
         {
            stats statstable( token_contract_account, sym_code.raw() );
            const auto& st = statstable.get( sym_code.raw() );
            return st.supply;
         }

         static int get_last_mine( const name& token_contract_account, const symbol_code& sym_code )
         {
            stats statstable( token_contract_account, sym_code.raw() );
            const auto& st = statstable.get( sym_code.raw() );
            return st.minetime;
         }

         static asset get_balance( const name& token_contract_account, const name& owner, const symbol_code& sym_code )
         {
            accounts accountstable( token_contract_account, owner.value );
            const auto& ac = accountstable.get( sym_code.raw() );
            return ac.balance;
         }

         // 获取当前的挖矿奖励数值，这个奖励逻辑是比特币一样，每四年产量减半。
         // 第一阶段是每次奖励 50.00000000 个 POW，每次奖励的产生的间隔是 10 分钟。
         // 所以可以算出要产完 10500000 个 POW，大概要 4 年的时间。
         // 然后第二阶段产量减半，以此类推，所以整体挖矿奖励是致敬了比特币。
         asset get_reward( asset currentsupply){

         asset reward;
         if (currentsupply.amount/10000/10000 <= 10500000){ //halvening 0
            reward =  asset(5000000000, symbol("POW", 8));
         }
         else if (currentsupply.amount/10000/10000 <= 15750000) {//halvening 1
            reward =  asset(2500000000, symbol("POW", 8));
         }
          else if (currentsupply.amount/10000/10000 <= 18375000) {//halvening 2
            
            reward =  asset(1250000000, symbol("POW", 8));
         }
          else if (currentsupply.amount/10000/10000 <= 19687500) {//halvening 3

            reward =  asset(625000000, symbol("POW", 8));
         }
          else if (currentsupply.amount/10000/10000 <= 20343750) { //halvening 4
            
            reward =  asset(312500000, symbol("POW", 8));
         }
          else if (currentsupply.amount/10000/10000 <= 20671875) { //halvening 5
            
            reward =  asset(156250000, symbol("POW", 8));
         }
          else if (currentsupply.amount/10000/10000 <= 20835938) { //halvening 6
            
           reward =  asset(78125000, symbol("POW", 8));
         }
          else if (currentsupply.amount/10000/10000 <= 20917969) { //halvening 7
            
            reward =  asset(39062500, symbol("POW", 8));
         }
          else if (currentsupply.amount/10000/10000 <= 20958984) { //halvening 8
            
            reward =  asset(19531250, symbol("POW", 8));
         }
          else if (currentsupply.amount/10000/10000 <= 20979492) { //halvening 9
            
            reward =  asset(9765625, symbol("POW", 8));
         }
          else if (currentsupply.amount/10000/10000 <= 20989746) { //halvening 10
            
            reward =  asset(4882813, symbol("POW", 8));
         }
          else if (currentsupply.amount/10000/10000 <= 20994873) { //halvening 11
            
            reward =  asset(2441406, symbol("POW", 8));
         }
          else if (currentsupply.amount/10000/10000 <= 20997437) { //halvening 12
            
            reward =  asset(1220703, symbol("POW", 8));
         }
          else if (currentsupply.amount/10000/10000 <= 20998718) { //halvening 13
            
            reward =  asset(610352, symbol("POW", 8));
         }
          else if (currentsupply.amount/10000/10000 <= 20999359) { //halvening 14
            
            reward =  asset(305176, symbol("POW", 8));
         }
          else if (currentsupply.amount/10000/10000 <= 20999680) { //halvening 15
            
           reward =  asset(152588, symbol("POW", 8));
         }
         else if (currentsupply.amount/10000/10000 <= 20999840) { //halvening 16
            
            reward =  asset(76294, symbol("POW", 8));
         }
         else if (currentsupply.amount/10000/10000 <= 20999920) { //halvening 17
            
            reward =  asset(38147, symbol("POW", 8));
         }
         else if (currentsupply.amount/10000/10000 <= 20999960) { //halvening 18
            
            reward =  asset(19073, symbol("POW", 8));
         }
         else if (currentsupply.amount/10000/10000 <= 20999980) { //halvening 19
            
            reward =  asset(9537, symbol("POW", 8));
         }
         else if (currentsupply.amount/10000/10000 <= 20999990) { //halvening 20
            
            reward =  asset(4768, symbol("POW", 8));
         }
         else if (currentsupply.amount/10000/10000 <= 20999995) { //halvening 21
            
            reward =  asset(2384, symbol("POW", 8));
         }
         else if (currentsupply.amount/10000/10000 <= 20999998) { //halvening 22
            
            reward =  asset(1192, symbol("POW", 8));
         }
         else if (currentsupply.amount/10000/10000 < 21000000){ //halvening 23
            
            reward =  asset(596, symbol("POW", 8));
         }
         else {

            reward =  asset(0, symbol("POW", 8));
         }
         return reward;
         }


         using create_action = eosio::action_wrapper<"create"_n, &token::create>;
         using issue_action = eosio::action_wrapper<"issue"_n, &token::issue>;
         using retire_action = eosio::action_wrapper<"retire"_n, &token::retire>;
         using transfer_action = eosio::action_wrapper<"transfer"_n, &token::transfer>;
         using open_action = eosio::action_wrapper<"open"_n, &token::open>;
         using close_action = eosio::action_wrapper<"close"_n, &token::close>;
      private:
         struct [[eosio::table]] account {
            asset    balance;

            uint64_t primary_key()const { return balance.symbol.code().raw(); }
         };

         struct [[eosio::table]] currency_stats {
            asset    supply;
            asset    max_supply;
            name     issuer;
            int      starttime;
            int      minetime;


            uint64_t primary_key()const { return supply.symbol.code().raw(); }
         };

         typedef eosio::multi_index< "accounts"_n, account > accounts;
         typedef eosio::multi_index< "stat"_n, currency_stats > stats;

         void sub_balance( const name& owner, const asset& value );
         void add_balance( const name& owner, const asset& value, const name& ram_payer );
   };
} 
```

## eosiopowcoin.cpp

```
#include <eosiopowcoin.hpp>
#include <eosio/system.hpp>

namespace eosio {

// 基本上和 eosio.token 一样，只不过创建的token增加了starttime, minetime两个属性，这两个属性很重要，后面在挖矿环节就可以理解。
void token::create( const name&   issuer,
                    const asset&  maximum_supply )
{
    require_auth( get_self() );

    auto sym = maximum_supply.symbol;
    check( sym.is_valid(), "invalid symbol name" );
    check( maximum_supply.is_valid(), "invalid supply");
    check( maximum_supply.amount > 0, "max-supply must be positive");

    stats statstable( get_self(), sym.code().raw() );
    auto existing = statstable.find( sym.code().raw() );
    check( existing == statstable.end(), "token with symbol already exists" );

    // 其他都和 eosio.token 一样
    // 只不过增加了 starttime, minetime
    statstable.emplace( get_self(), [&]( auto& s ) {
       s.supply.symbol = maximum_supply.symbol;
       s.max_supply    = maximum_supply;
       s.issuer        = issuer;
       s.starttime     = current_time_point().sec_since_epoch();
       s.minetime      = s.starttime;
    });
}

// 基本上和 eosio.token 一样，略过
void token::issue( const name& to, const asset& quantity, const string& memo )
{
    auto sym = quantity.symbol;
    check( sym.is_valid(), "invalid symbol name" );
    check( memo.size() <= 256, "memo has more than 256 bytes" );

    stats statstable( get_self(), sym.code().raw() );
    auto existing = statstable.find( sym.code().raw() );
    check( existing != statstable.end(), "token with symbol does not exist, create token before issue" );
    const auto& st = *existing;
    check( to == st.issuer, "tokens can only be issued to issuer account" );

    require_auth( st.issuer );
    check( quantity.is_valid(), "invalid quantity" );
    check( quantity.amount > 0, "must issue positive quantity" );

    check( quantity.symbol == st.supply.symbol, "symbol precision mismatch" );
    check( quantity.amount <= st.max_supply.amount - st.supply.amount, "quantity exceeds available supply");

    statstable.modify( st, same_payer, [&]( auto& s ) {
       s.supply += quantity;
    });

    add_balance( st.issuer, quantity, st.issuer );
}

// 基本上和 eosio.token 一样，略过
void token::retire( const asset& quantity, const string& memo )
{
    auto sym = quantity.symbol;
    check( sym.is_valid(), "invalid symbol name" );
    check( memo.size() <= 256, "memo has more than 256 bytes" );

    stats statstable( get_self(), sym.code().raw() );
    auto existing = statstable.find( sym.code().raw() );
    check( existing != statstable.end(), "token with symbol does not exist" );
    const auto& st = *existing;

    require_auth( st.issuer );
    check( quantity.is_valid(), "invalid quantity" );
    check( quantity.amount > 0, "must retire positive quantity" );

    check( quantity.symbol == st.supply.symbol, "symbol precision mismatch" );

    statstable.modify( st, same_payer, [&]( auto& s ) {
       s.supply -= quantity;
    });

    sub_balance( st.issuer, quantity );
}

// 基本上和 eosio.token 一样，略过
void token::transfer( const name&    from,
                      const name&    to,
                      const asset&   quantity,
                      const string&  memo )
{
    check( from != to, "cannot transfer to self" );
    require_auth( from );
    check( is_account( to ), "to account does not exist");
    auto sym = quantity.symbol.code();
    stats statstable( get_self(), sym.raw() );
    const auto& st = statstable.get( sym.raw() );

    require_recipient( from );
    require_recipient( to );

    check( quantity.is_valid(), "invalid quantity" );
    check( quantity.amount > 0, "must transfer positive quantity" );
    check( quantity.symbol == st.supply.symbol, "symbol precision mismatch" );
    check( memo.size() <= 256, "memo has more than 256 bytes" );

    auto payer = has_auth( to ) ? to : from;

    sub_balance( from, quantity );
    add_balance( to, quantity, payer );
}

// 基本上和 eosio.token 一样，略过
void token::sub_balance( const name& owner, const asset& value ) {
   accounts from_acnts( get_self(), owner.value );

   const auto& from = from_acnts.get( value.symbol.code().raw(), "no balance object found" );
   check( from.balance.amount >= value.amount, "overdrawn balance" );

   from_acnts.modify( from, owner, [&]( auto& a ) {


a.balance -= value;
      });
}

// 基本上和 eosio.token 一样，略过
void token::add_balance( const name& owner, const asset& value, const name& ram_payer )
{
   accounts to_acnts( get_self(), owner.value );
   auto to = to_acnts.find( value.symbol.code().raw() );
   if( to == to_acnts.end() ) {
      to_acnts.emplace( ram_payer, [&]( auto& a ){
        a.balance = value;
      });
   } else {
      to_acnts.modify( to, same_payer, [&]( auto& a ) {
        a.balance += value;
      });
   }
}

// 基本上和 eosio.token 一样，略过
void token::open( const name& owner, const symbol& symbol, const name& ram_payer )
{
   require_auth( ram_payer );

   check( is_account( owner ), "owner account does not exist" );

   auto sym_code_raw = symbol.code().raw();
   stats statstable( get_self(), sym_code_raw );
   const auto& st = statstable.get( sym_code_raw, "symbol does not exist" );
   check( st.supply.symbol == symbol, "symbol precision mismatch" );

   accounts acnts( get_self(), owner.value );
   auto it = acnts.find( sym_code_raw );
   if( it == acnts.end() ) {
      acnts.emplace( ram_payer, [&]( auto& a ){
        a.balance = asset{0, symbol};
      });
   }
}

// 基本上和 eosio.token 一样，略过
void token::close( const name& owner, const symbol& symbol )
{
   require_auth( owner );
   accounts acnts( get_self(), owner.value );
   auto it = acnts.find( symbol.code().raw() );
   check( it != acnts.end(), "Balance row already deleted or never existed. Action won't have any effect." );
   check( it->balance.amount == 0, "Cannot close because the balance is not zero." );
   acnts.erase( it );
}

// 这个是搞什么，基本上和 open 一样的函数，略过。
void token::setupminer(const name& user, const symbol& symbol){

   require_auth( user );

   auto sym_code_raw = symbol.code().raw();
   stats statstable( get_self(), sym_code_raw );
   const auto& st = statstable.get( sym_code_raw, "symbol does not exist" );
   check( st.supply.symbol == symbol, "symbol precision mismatch" );

   accounts acnts( get_self(), user.value );
   auto it = acnts.find( sym_code_raw );
   if( it == acnts.end() ) {
      acnts.emplace( user, [&]( auto& a ){
        a.balance = asset{0, symbol};
      });
   }


}

// 整个挖矿逻辑就靠这个函数撑着，详细读一下
// 在这个函数的头文件声明里可以看到 
// [[eosio::on_notify("eosio.token::transfer")]]
// 这个clean函数是在 eosio.token::transfer 调用的时候会被触发。
// 实际上就会表现为，当转账给这个合约账号的时候，这个claim函数就会被触发。
// 
// cleos -u https://eospush.tokenpocket.pro transfer practicetest eosiopowcoin '0.0001 EOS'

// executed transaction: 2c40caf8ef17af1c8d13e11f0b58a28cb89295456f7c002a9bb06ac1f8b36a0a  128 bytes  628 us
// 给 eosiopowcoin 转账时，先调用了 eosio.token::transfer 合约函数
// #   eosio.token <= eosio.token::transfer        {"from":"practicetest","to":"eosiopowcoin","quantity":"0.0001 EOS","memo":""}
// #  practicetest <= eosio.token::transfer        {"from":"practicetest","to":"eosiopowcoin","quantity":"0.0001 EOS","memo":""}
// #  eosiopowcoin <= eosio.token::transfer        {"from":"practicetest","to":"eosiopowcoin","quantity":"0.0001 EOS","memo":""}
// 以上三行日志是正常调用 eosio.token::transfer 都会出现的三行日志。

// 以下三行日志是在 claim 函数里，再一次触发了 eosio.token::transfer 函数后出现的三行日志。只不过frome和to反过来，
// 从而做到把转给 eosiopowcoin 合约的代币原封不动的转回去。
// #   eosio.token <= eosio.token::transfer        {"from":"eosiopowcoin","to":"practicetest","quantity":"0.0001 EOS","memo":"Refund EOS"}
// #  eosiopowcoin <= eosio.token::transfer        {"from":"eosiopowcoin","to":"practicetest","quantity":"0.0001 EOS","memo":"Refund EOS"}
// #  practicetest <= eosio.token::transfer        {"from":"eosiopowcoin","to":"practicetest","quantity":"0.0001 EOS","memo":"Refund EOS"}

// 这个就是
// #  eosiopowcoin <= eosiopowcoin::transfer       {"from":"eosiopowcoin","to":"practicetest","quantity":"0.00020770 POW","memo":"Mine POW"}
// #  practicetest <= eosiopowcoin::transfer       {"from":"eosiopowcoin","to":"practicetest","quantity":"0.00020770 POW","memo":"Mine POW"}

void token::claim(name from, name to, eosio::asset quantity, std::string memo)
{
    // 必须是转入方是本合约账号，且转出方不是本合约账号。
   if (to != get_self() || from == get_self()) 
         return;

   
   accounts to_acnts( get_self(), from.value );
   auto tor = to_acnts.find( symbol_code("POW").raw() );
   check(tor != to_acnts.end(), "Must initialize POW before mining. Please use setupminer action to enable mining"); 
      
   // 重新触发一次 eosio.token::transfer 函数，把 from, to 反过来
   // 从而实现把转来的代币原路转回去。
   action{
         permission_level{get_self(), "active"_n},
         "eosio.token"_n,
         "transfer"_n,
         std::make_tuple(get_self(), from, quantity, std::string("Refund EOS"))
   }.send();              

   // 获取POW的上一次挖矿时间。
   int minetime = get_last_mine(get_self(), symbol_code("POW"));
   // 当前时间，注意区块链编程当前时间是和区块有关，而不是机器的本机时间。
   int currenttime = current_time_point().sec_since_epoch();
   // 当前时间距离上一次挖矿时间的时间间隔。
   int timepassed = (currenttime - minetime);

   // 获取POW当前发行量
   asset supply = eosio::token::get_supply(get_self(), symbol_code("POW"));    
   // 根据当前发行量算出奖励值，这个奖励值就是本次合约调用要奖励给调用方的数量
   asset reward = get_reward(supply);
   // 获取当前此合约账号的POW代币余额
   asset balance = eosio::token::get_balance(get_self(), get_self(), symbol_code("POW"));

   // 上一次挖矿间隔是否已经超过了10分钟，可以理解为 10 分钟出一个新块。
   if (timepassed >= 600){
       // 如果超过10分钟的话，意味着我们需要产生一次新的货币发行，也就是 issue 。
       // 这里比较有意思的是，之前写的代币，基本上都是创建代币的人去手动操作 issue。而这里的 issue 是自动的，是根据时间来的。
       // rewardcount 大部分情况下会=1，除非这个货币冷门到几乎没人来挖，否则大概率两次触发的间隔都是小于 10 分钟的。
       // 所以也就是说这里的 issuereward 大部分情况下会等于 reward
      int rewardcount = timepassed / 600;
      asset issuereward = reward * rewardcount;

      // 调用一次自身账号合约的 issue 操作，发行 issuereward 数量的代币。
      action{
            permission_level{get_self(), "active"_n}, 
            get_self(),
            "issue"_n,
            std::make_tuple(get_self(), issuereward, std::string("Issue POW"))
         }.send(); 
         
      // 余额加上刚发行的数量
      balance += issuereward;


      // 检查POW是否存在
      stats statstable( get_self(), symbol_code("POW").raw() );
      auto existing = statstable.find( symbol_code("POW").raw() );
      check( existing != statstable.end(), "token with symbol does not exist" );
      const auto& st = *existing;

      // 把挖矿时间更新到当前时间
         statstable.modify( st, same_payer, [&]( auto& s ) {
            s.minetime = currenttime;
         });

      } 

      // 把当前余额分成40000多份，每次只转出去一份。否则如果这里不分多份的话，可以试想一下会出现什么情况？
      // 就是刚增发出来的代币，被第一个触发的交易的账号全部转走了。
      // 那显然有点太不雨露均沾了。所以分成多份。
      // 尽量让每一个挖矿的人都能拿到好处，至于多少好处，要靠挖矿的cpu来增加交易频次，从而挖更多的份额。
      // 也就是变相的 cpu 挖矿了。
      balance /= 40000;

      if (balance > asset(0, symbol("POW", 8))){
          // 只要余额分成多份后的结果，每一个的数值仍然大于0 ，则把这个份额的代币数量转回触发这次挖矿的人的账号。
          // 这就是挖矿的最后一步。
         action{
           permission_level{get_self(), "active"_n},
           get_self(),
           "transfer"_n,
           std::make_tuple(get_self(), from, balance, std::string("Mine POW"))
           }.send();
         
      }              
      
   }
     
}
```

## 小结

读懂 [EOS合约源码分析:eosio.token](http://yanyiwu.com/2020/06/20/eosio-token-source-code.html) 之后其实再读这个合约代码的时候，
基本上不会有什么难点了。
都在源码里了。
