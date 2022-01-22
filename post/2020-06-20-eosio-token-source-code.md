---
layout: post
title: EOS合约源码分析:eosio.token
date: 2020-06-20
---

# EOS合约源码分析:eosio.token

## 获取源码

先获取合约的开源代码

```
git clone https://github.com/EOSIO/eosio.contracts
cd eosio.contracts/eosio.token
```

eosio 所有内建合约都是开源的，开源也是区块链的核心基因之一，不像传统互联网的产品，
区块链的核心代码是必须开源的，而传统互联网的核心代码是禁止开源的。 

## 关键概念

里面整个源码就是两个文件，eosio.token.cpp/eosio.token.h ，其实代码量很少。

在详细阅读源码之前，需要明确一些基础概念。

### 区块链是数据库

区块链其实就是一个公开的数据库，所有人都可以增删改查，只不过修改的需要是自己有权限的那部分内容。
而这个数据库不像互联网里面常规的那种通过 rpc 去增删改查的，比如 mysql 等。
区块链本身就是一个数据库，等于是在写智能合约的时候，会有对于的接口函数来调用数据库。
这里的接口函数是通过 `eosio::multi_index` 来实现，代替了传统互联网编程里的 sql。
从而实现智能合约修改链上数据的功能。

### 安全检查是最重要的事情

安全检查是最重要的事情，没有之一。如上所述，区块链就是一个公开的数据库，所以如果安全检查没有做到位，
等于是裸奔，任何人都可以予取予求，之前美图发的币风风火火，就是出了安全问题后一夜归零。
这也是区块链行业特色。

## 源码阅读

通过给源码写注释的方式来阅读和理解源码吧。

### [eosio.token.h](https://github.com/EOSIO/eosio.contracts/blob/master/contracts/eosio.token/include/eosio.token/eosio.token.hpp)

```
// 智能合约编写主要依赖 eosio.cdt 这个仓库的代码，主要 include 的代码都是在这个仓库里。
// https://github.com/EOSIO/eosio.cdt
// libraries/eosiolib/core/eosio/asset.hpp
#include <eosio/asset.hpp>
#include <eosio/eosio.hpp>

namespace eosio {
   /**
    * eosio.token contract defines the structures and actions that allow users to create, issue, and manage
    * tokens on EOSIO based blockchains.
    */
   class [[eosio::contract("eosio.token")]] token : public contract {
      public:
         using contract::contract;
         // 这些核心函数的声明解释，先简单读过即可，其实不看源码，也就是不看函数实现的话，还是不容易深入理解。
         // 所以这些可以简单过，后面详细看函数实现。

         /**
          * Allows `issuer` account to create a token in supply of `maximum_supply`. If validation is successful a new entry in statstable for token symbol scope gets created.
          *
          * @param issuer - the account that creates the token,
          * @param maximum_supply - the maximum supply set for the token created.
          *
          * @pre Token symbol has to be valid,
          * @pre Token symbol must not be already created,
          * @pre maximum_supply has to be smaller than the maximum supply allowed by the system: 1^62 - 1.
          * @pre Maximum supply must be positive;
          */
         [[eosio::action]]
         void create( const name&   issuer,
                      const asset&  maximum_supply);
         /**
          *  This action issues to `to` account a `quantity` of tokens.
          *
          * @param to - the account to issue tokens to, it must be the same as the issuer,
          * @param quntity - the amount of tokens to be issued,
          * @memo - the memo string that accompanies the token issue transaction.
          */
         [[eosio::action]]
         void issue( const name& to, const asset& quantity, const string& memo );

         /**
          * The opposite for create action, if all validations succeed,
          * it debits the statstable.supply amount.
          *
          * @param quantity - the quantity of tokens to retire,
          * @param memo - the memo string to accompany the transaction.
          */
         [[eosio::action]]
         void retire( const asset& quantity, const string& memo );

         /**
          * Allows `from` account to transfer to `to` account the `quantity` tokens.
          * One account is debited and the other is credited with quantity tokens.
          *
          * @param from - the account to transfer from,
          * @param to - the account to be transferred to,
          * @param quantity - the quantity of tokens to be transferred,
          * @param memo - the memo string to accompany the transaction.
          */
         [[eosio::action]]
         void transfer( const name&    from,
                        const name&    to,
                        const asset&   quantity,
                        const string&  memo );

         /**
          * Allows `ram_payer` to create an account `owner` with zero balance for
          * token `symbol` at the expense of `ram_payer`.
          *
          * @param owner - the account to be created,
          * @param symbol - the token to be payed with by `ram_payer`,
          * @param ram_payer - the account that supports the cost of this action.
          *
          * More information can be read [here](https://github.com/EOSIO/eosio.contracts/issues/62)
          * and [here](https://github.com/EOSIO/eosio.contracts/issues/61).
          */
         [[eosio::action]]
         void open( const name& owner, const symbol& symbol, const name& ram_payer );

         /**
          * This action is the opposite for open, it closes the account `owner`
          * for token `symbol`.
          *
          * @param owner - the owner account to execute the close action for,
          * @param symbol - the symbol of the token to execute the close action for.
          *
          * @pre The pair of owner plus symbol has to exist otherwise no action is executed,
          * @pre If the pair of owner plus symbol exists, the balance has to be zero.
          */
         [[eosio::action]]
         void close( const name& owner, const symbol& symbol );

         // 这个功能函数并没有被使用到，不知道存在的意义是？
         // 理解起来很简单，就是查询代币的发行数量
         // 基本上理解了 stats 这个 multi_index 是个数据库后，这些就都非常好理解。
         static asset get_supply( const name& token_contract_account, const symbol_code& sym_code )
         {
            stats statstable( token_contract_account, sym_code.raw() );
            const auto& st = statstable.get( sym_code.raw() );
            return st.supply;
         }

         // 获取某账号的某代币余额
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
         // 账号维度的表，主要是代币的余额信息
         struct [[eosio::table]] account {
            asset    balance;

            uint64_t primary_key()const { return balance.symbol.code().raw(); }
         };

         // 货币统计表，从这里就可以看到货币的主要字段有三个
         // supply: 目前发行量
         // max_supply: 最大发行量。
         // issuer: 发行商
         // 主键：这个货币的货币代号。
         struct [[eosio::table]] currency_stats {
            asset    supply;
            asset    max_supply;
            name     issuer;

            uint64_t primary_key()const { return supply.symbol.code().raw(); }
         };

         // multi_index 才是源码的核心， 
         // 关于 multi_index 建议都读一下这个解释：https://github.com/EOSIO/eosio.cdt/blob/a6b8d3fc289d46f4612588cdd7223a3d549238f6/libraries/eosiolib/contracts/eosio/multi_index.hpp#L377
         // 读完基本上可以把 multi_index 理解为全局数据库的一个访问方式抽象。
         typedef eosio::multi_index< "accounts"_n, account > accounts;
         typedef eosio::multi_index< "stat"_n, currency_stats > stats;

         void sub_balance( const name& owner, const asset& value );
         void add_balance( const name& owner, const asset& value, const name& ram_payer );
   };

}
```

### eosio.token.cpp

```
// 顾名思义，这个函数负责创建代币，本质上就是在数据库中创建一个新的代币数据。
// 也就是增删改查中的『增』，只有先有『增』，才有后面的操作。
void token::create( const name&   issuer,
                    const asset&  maximum_supply )
{
    // 这个其实非常重要，因为如果没有这个的话就出事故了，导致任何人都有权限来创建代币。
    require_auth( get_self());

    // sym 是代币的代号，比如 10 TNT, sym就是 TNT
    auto sym = maximum_supply.symbol;
    // 进行基础的检查
    check( sym.is_valid(), "invalid symbol name" );
    check( maximum_supply.is_valid(), "invalid supply");
    check( maximum_supply.amount > 0, "max-supply must be positive");

    
    // typedef eosio::multi_index< "stat"_n, currency_stats > stats;
    // 这里需要先理解一下 stats 这个数据结构，stats 是别名，具体含义如上，在头文件中定义的。
    // 关于 multi_index 建议都读一下这个解释：https://github.com/EOSIO/eosio.cdt/blob/a6b8d3fc289d46f4612588cdd7223a3d549238f6/libraries/eosiolib/contracts/eosio/multi_index.hpp#L377
    // multi_index 是 eos 里封装的比较复杂的数据结构，也是非常重要。
    // 可以先理解为一个数据库的操作接口。可以通过定义变量后进行操作，从而操作数据库。
    // 所以你可以看到虽然 stats 是在函数里定义出一个局部变量，但是对这个局部变量的操作，其实就是在操作一个全局的数据库。
    stats statstable( get_self(), sym.code().raw() );
    auto existing = statstable.find( sym.code().raw() );
    check( existing == statstable.end(), "token with symbol already exists" );

    // 这里需要注意的是，在创建代币的时候，会把发行方也登记下来。因为后面 issue 代币的时候，会针对发行方进行校验。
    // 如上面所述，statstable 是一个数据库接口，所以这个操作看上去似乎只是在修改局部变量，但是其实是在修改全局数据库。
    statstable.emplace( get_self(), [&]( auto& s ) {
       s.supply.symbol = maximum_supply.symbol;
       s.max_supply    = maximum_supply;
       s.issuer        = issuer;
    });
}


void token::issue( const name& to, const asset& quantity, const string& memo )
{
    // 获取代币代号。 
    auto sym = quantity.symbol;

    // 仍然是来一波检查，智能合约的检查是非常重要的，否则分分钟家徒四壁。
    check( sym.is_valid(), "invalid symbol name" );
    check( memo.size() <= 256, "memo has more than 256 bytes" );

    // 查询数据库里是否已经存在这个代币，如果不存在则扔掉。
    stats statstable( get_self(), sym.code().raw() );
    auto existing = statstable.find( sym.code().raw() );
    check( existing != statstable.end(), "token with symbol does not exist, create token before issue" );

    const auto& st = *existing;
    // 除了常规检查之后，这里还多了一个约束，就是创建代码时登记的发行方才能发送代币。
    check( to == st.issuer, "tokens can only be issued to issuer account" );

    // 获取发行方的权限，注意，是获取发行方，而不是获取这个合约账号的权限。等于是一个合约账号可以支持N 个发行方发行代币。
    require_auth( st.issuer );

    check( quantity.is_valid(), "invalid quantity" );
    check( quantity.amount > 0, "must issue positive quantity" );

    // 检查代币精度，这个就是需要注意的地方，新手很容易没有写对精度导致失败。
    check( quantity.symbol == st.supply.symbol, "symbol precision mismatch" );

    // 检查发行数量是否超过最大限制了。
    check( quantity.amount <= st.max_supply.amount - st.supply.amount, "quantity exceeds available supply");

    // 修改数据库
    statstable.modify( st, same_payer, [&]( auto& s ) {
       s.supply += quantity;
    });

    // 给发行方账号增加对于数量的代币。
    add_balance( st.issuer, quantity, st.issuer );
}

void token::retire( const asset& quantity, const string& memo )
{
    auto sym = quantity.symbol;
    // 仍然是一波枯燥的安全检查
    check( sym.is_valid(), "invalid symbol name" );
    check( memo.size() <= 256, "memo has more than 256 bytes" );

    stats statstable( get_self(), sym.code().raw() );
    auto existing = statstable.find( sym.code().raw() );
    check( existing != statstable.end(), "token with symbol does not exist" );
    const auto& st = *existing;

    // 需要确认此次操作需要是该代币的发行者才能生效。
    require_auth( st.issuer );
    // 常规检查
    check( quantity.is_valid(), "invalid quantity" );
    check( quantity.amount > 0, "must retire positive quantity" );

    // 精度检查
    check( quantity.symbol == st.supply.symbol, "symbol precision mismatch" );

    // 修改代币数据库的发行量字段。
    statstable.modify( st, same_payer, [&]( auto& s ) {
       s.supply -= quantity;
    });

    // 减少发行方账号的代币梳理。
    sub_balance( st.issuer, quantity );
}

void token::transfer( const name&    from,
                      const name&    to,
                      const asset&   quantity,
                      const string&  memo )
{
    // 不允许给自己转账。
    check( from != to, "cannot transfer to self" );
    // 需要获取转出方的权限。
    require_auth( from );
    // 需要检查传入方是否是已存在的账号，这个检查挺好的，减少因为账号写错导致的转账错误。
    check( is_account( to ), "to account does not exist");
    auto sym = quantity.symbol.code();
    stats statstable( get_self(), sym.raw() );
    const auto& st = statstable.get( sym.raw() );

    // 对传入方和转出方的账号都需要通知下。
    // require_recipient 的定义详见：https://github.com/EOSIO/eosio.cdt/blob/master/libraries/eosiolib/contracts/eosio/action.hpp#L91
    require_recipient( from );
    require_recipient( to );

    // 常规检查
    check( quantity.is_valid(), "invalid quantity" );
    check( quantity.amount > 0, "must transfer positive quantity" );
    check( quantity.symbol == st.supply.symbol, "symbol precision mismatch" );
    check( memo.size() <= 256, "memo has more than 256 bytes" );

    // 如果有转入方账号的权限的话，则使用转入方的内存来作为所需消耗的内存。
    // 但是其实大部分情况是不需要消耗内存的，主要是在该账号第一次获取该代币的时候，需要消耗内存。
    auto payer = has_auth( to ) ? to : from;

    // 这个就是转账的必要操作
    // 减少转出方的钱
    sub_balance( from, quantity );
    // 增加转入方的钱。
    add_balance( to, quantity, payer );
    // 不过这里有意思的是，操作的对象都是账号数据库，而不是会操作代币数据库，
    // 比如不会修改代币的发行量，因为转账其实不影响代币的发行量等基础流通信息。
}

void token::sub_balance( const name& owner, const asset& value ) {
   // 其实我是觉得这里的变量名字取的可读性不高，比如 accounts 其实是一张表的定义，在上面的头文件里有定义。
   accounts from_acnts( get_self(), owner.value );

   // 先检查该账号是否拥有该代币，和拥有代币的数量是否足够。
   const auto& from = from_acnts.get( value.symbol.code().raw(), "no balance object found" );
   check( from.balance.amount >= value.amount, "overdrawn balance" );

   // 修改该账号的代币余额
   from_acnts.modify( from, owner, [&]( auto& a ) {
         a.balance -= value;
      });
}

// 给指定账号增加金额，这个很好理解。但是需要注意的是这个 ram_payer 。
void token::add_balance( const name& owner, const asset& value, const name& ram_payer )
{
   // 其实我是觉得这里的变量名字取的可读性不高，比如 accounts 其实是一张表的定义，在上面的头文件里有定义。
   accounts to_acnts( get_self(), owner.value );
   // 要给某账号增加金额的时候，首先需要先确认该账号是否拥有该代币。
   auto to = to_acnts.find( value.symbol.code().raw() );
   if( to == to_acnts.end() ) {
       // 如果未曾有过该代币，则需要在这个账号的代币数据库先插入这条代币信息。这里需要内存占用。
       // 你可以理解为数据库每次新增一行的话，就是要多占用内存的。
       // 但是如果只是修改数据库某行的值的话，内存使用量是不变的，也就是不额外消耗内存。
       // 然后把代币的金额设置成要增加的值。
      to_acnts.emplace( ram_payer, [&]( auto& a ){
        a.balance = value;
      });
   } else {
       // 如果已经有这个代币，则只需要增加这个代币余额即可。
      to_acnts.modify( to, same_payer, [&]( auto& a ) {
        a.balance += value;
      });
   }
}

// 只是创建这个账号的代币，但是不转账数额过去。有点像开户。但是其实这个函数应该是比较低频被调用。
// 因为如果有转岗的话则就会自动被开户。
void token::open( const name& owner, const symbol& symbol, const name& ram_payer )
{
    // 开户主要的消耗是内存，所以需要内存支付者的权限。
   require_auth( ram_payer );

   // 检查账号是否存在，避免账号名写错的一些误操作。
   check( is_account( owner ), "owner account does not exist" );

   auto sym_code_raw = symbol.code().raw();
   stats statstable( get_self(), sym_code_raw );
   const auto& st = statstable.get( sym_code_raw, "symbol does not exist" );
   // 检查精度
   check( st.supply.symbol == symbol, "symbol precision mismatch" );

   accounts acnts( get_self(), owner.value );
   auto it = acnts.find( sym_code_raw );
   // 检查这个账号的代币是否已存在，只有不存在才进行开户操作。
   if( it == acnts.end() ) {
       // 给这条账号的代币余额插入一条 0 数量的代币数额信息。
      acnts.emplace( ram_payer, [&]( auto& a ){
        a.balance = asset{0, symbol};
      });
   }
}

// 销户：关闭某账号的某代币数据，从而释放出内存占用。
void token::close( const name& owner, const symbol& symbol )
{
    // 获取该账号的权限。
   require_auth( owner );
   // 获取该账号的指定代币数据库信息
   accounts acnts( get_self(), owner.value );
   auto it = acnts.find( symbol.code().raw() );
   // 确认该账号的指定代币数据信息存在
   check( it != acnts.end(), "Balance row already deleted or never existed. Action won't have any effect." );
   // 确认该账号的代币数量为0，才可以进行销户操作
   check( it->balance.amount == 0, "Cannot close because the balance is not zero." );
   // 删除该账号的该代币数据，从而释放该代币所占的内存。
   acnts.erase( it );
}
```

## 后记

EOS 从技术角度来评估的话，确实是一个非常优秀的区块链产品。
把合约抽象得非常简单，源码值得一读。
