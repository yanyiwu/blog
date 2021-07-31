---
layout: post
title: EOS合约源码分析:eidos
date: 2020-07-19
display: onlydetail
---

# EOS合约源码分析:eidos

提前假设：

假设看这篇文章之前已经看过 [EOS合约源码分析:eosiopowcoin](http://yanyiwu.com/2020/07/11/eos-contract-eosiopowcoin-source-code.html)

合约源码下载：

git clone https://github.com/enumivo/eidos

## [token.hpp](https://github.com/enumivo/eidos/blob/master/token.hpp)

头文件基本上和 eosio.token 一样，唯一需要留意的是多了一个 claim 函数。
这个 claim 函数也是一个回调函数，是在调用 eosio.token::transfer 调用的时候才被触发。

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

   class [[eosio::contract("token")]] token : public contract {
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

         [[eosio::on_notify("eosio.token::transfer")]]
         void claim(name from, name to, eosio::asset quantity, std::string memo);

         static asset get_supply( const name& token_contract_account, const symbol_code& sym_code )
         {
            stats statstable( token_contract_account, sym_code.raw() );
            const auto& st = statstable.get( sym_code.raw() );
            return st.supply;
         }

         static asset get_balance( const name& token_contract_account, const name& owner, const symbol_code& sym_code )
         {
            accounts accountstable( token_contract_account, owner.value );
            const auto& ac = accountstable.get( sym_code.raw() );
            return ac.balance;
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

            uint64_t primary_key()const { return supply.symbol.code().raw(); }
         };

         typedef eosio::multi_index< "accounts"_n, account > accounts;
         typedef eosio::multi_index< "stat"_n, currency_stats > stats;

         void sub_balance( const name& owner, const asset& value );
         void add_balance( const name& owner, const asset& value, const name& ram_payer );
   };
} 
```

## [token.cpp](https://github.com/enumivo/eidos/blob/master/token.cpp)

```
#include "token.hpp"
#include <eosio/system.hpp>

namespace eosio {

// 和 eosio.token 一样，略过。
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

    statstable.emplace( get_self(), [&]( auto& s ) {
       s.supply.symbol = maximum_supply.symbol;
       s.max_supply    = maximum_supply;
       s.issuer        = issuer;
    });
}


// 和 eosio.token 一样，略过。
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

// 和 eosio.token 一样，略过。
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

// 和 eosio.token 一样，略过。
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

// 和 eosio.token 一样，略过。
void token::sub_balance( const name& owner, const asset& value ) {
   accounts from_acnts( get_self(), owner.value );

   const auto& from = from_acnts.get( value.symbol.code().raw(), "no balance object found" );
   check( from.balance.amount >= value.amount, "overdrawn balance" );

   from_acnts.modify( from, owner, [&]( auto& a ) {
         a.balance -= value;
      });
}

// 和 eosio.token 一样，略过。
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

// 和 eosio.token 一样，略过。
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

// 和 eosio.token 一样，略过。
void token::close( const name& owner, const symbol& symbol )
{
   require_auth( owner );
   accounts acnts( get_self(), owner.value );
   auto it = acnts.find( symbol.code().raw() );
   check( it != acnts.end(), "Balance row already deleted or never existed. Action won't have any effect." );
   check( it->balance.amount == 0, "Cannot close because the balance is not zero." );
   acnts.erase( it );
}

// 这个是这个合约的核心，需要细品。
void token::claim(name from, name to, eosio::asset quantity, std::string memo)
{
    // 检查，确保此次调用的触发是因为其他账号的转账转入本账号
   if (to != get_self() || from == get_self()) 
         return;

   // 把别人转来的代币转回去，就是这么潇洒。
   action{
         permission_level{get_self(), "active"_n},
         "eosio.token"_n,
         "transfer"_n,
         std::make_tuple(get_self(), from, quantity, std::string("Refund EOS"))
   }.send();              

   int elapsed = current_time_point().sec_since_epoch();

   // 1572595200 = Nov  1 08:00:00 UTC 2019
   // 也就是检查当前时间是否已经到了 Nov  1 08:00:00 UTC 2019
   // 只有到了时间，这个合约的以下环节才能生效。
   if (elapsed > 1572595200) {
      // 获取当前 EIDOS 的流通量
      asset supply = eosio::token::get_supply(get_self(), symbol_code("EIDOS"));    
      int64_t expected = (elapsed - 1572595200) * 25;

      asset balance = eosio::token::get_balance(get_self(), get_self(), symbol_code("EIDOS"));

      if (expected > 1000000000)
         expected = 1000000000;

      asset expected_supply = asset(expected, symbol("EIDOS", 4));
      expected_supply *= 10000;

      if (supply < expected_supply){
         asset claim = expected_supply-supply;

         action{
            permission_level{get_self(), "active"_n}, 
            get_self(),
            "issue"_n,
            std::make_tuple(get_self(), claim, std::string("Issue EIDOS"))
         }.send();

         balance += claim;

         claim = claim / 5;

         action{
            permission_level{get_self(), "active"_n},
            get_self(),
            "transfer"_n,
            std::make_tuple(get_self(), "eidosoneteam"_n, claim, std::string("Send to EIDOS Team."))
         }.send();              

         balance -= claim;

      }

      if (balance > asset(0, symbol("EIDOS", 4))) {
         if (balance <= asset(10000, symbol("EIDOS", 4)))
            balance = asset(1, symbol("EIDOS", 4));
         else   
            balance /= 10000;

         action{
            permission_level{get_self(), "active"_n},
            get_self(),
            "transfer"_n,
            std::make_tuple(get_self(), from, balance, std::string("Airdrop EIDOS"))
         }.send();              
      }
   }  
}    

} 
```

## 小结 

合约不知道是否会变成区块链的sql？
