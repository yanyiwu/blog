---    
published: true
layout: post    
title: 区块链开源项目Asch源码初探
date: 2017-07-29  
category: work    
---    

<center>  
<img src="http://7viirv.com1.z0.glb.clouddn.com/xas.jpg" class="photo"></img>  
</center>  
  
[Asch] 这个名字是 App Side Chain 的缩写。
是一种基于区块链跨链技术的应用开发平台，目前全部核心代码已经在 [GitHub] 上开源。

区块链是比特币的底层技术，但是名气低于比特币，但是个人认为潜力远远大于比特币。是最值得技术人员关注的技术之一。

我一般研究一门新技术，倾向于研究更新更早期的代码。
因为非常成熟有名的代码往往已经过度设计，对于阅读代码入门不一定是好的选择。
而一些出于项目早期的代码，而且更容易阅读理解其核心原理。
[Asch] 目前来说是一个非常好的区块链学习入门的开源项目。

『整体架构』

目前整个阿希链主要由以下源码库组成

+ [asch] 阿希链的核心服务端源码，主要由 Node.js 开发。
+ [asch-frontend] 阿希链的网页钱包源码。
+ [asch-js]&[asch-cli] 阿希链的客户端实现。

目前源码阅读主要基于 [asch]@1.3.0 version

『目录结构』

+ `proto/index.proto` 
+ `genesisBlock-mainnet.json`
+ `config-mainnet.json`
+ `public/`
+ `src/core`
+ `src/base`

『proto/index.proto』

Asch 的区块核心数据结构通过 [protobuf] 和进行序列化和反序列化。
所以 `proto/index.proto` 这个数据结构就是核心区块的数据结构。
依我的理解，index.proto 这个名字应该叫 block.proto 更合适。

『目录 public/』

网页钱包的代码根目录，由 [asch-frontend] 打包生成的网页钱包代码。

『源码目录结构 src/』

src/init.js 负责初始化，用 async 来处理各种先后顺利，避免回调地狱，刚开始看的时候会比较绕， 但是看懂了就很清晰了。  
在代码中很多模块都有共同的模块变量，最典型的是 `var moduels, library` ，

+ modules 对应的是 src/core/ 下面的模块。
+ library.base 对应的是 src/base/ 下面的模块。

『受托人的轮流锻造(Forging)机制』

Asch 不像比特币那种挖矿机制，而是受托人的轮流锻造机制，主要有以下流程。

0. onBlockchainReady(core/delegates.js)  当区块链数据库载入完成，开始锻造初始化。
1. loadMyDelegates: 从配置文件中获取secret(依次读取若干个)，用 secret 生成密钥对(公钥和私钥)。
2. accounts.getAccount: 用公钥从区块链数据库中获取账号，并检查该账号是否是受托人，是受托人才继续进行。
3. loop: 开始进入轮询，每次轮询间隔100ms 。
4. slots.getSlotNumber (utils/slots.js) 先获取 epochTime ，epochTime 记录从 2016-5-27T20:00:00 后到某一个特定时间经过了多少秒。然后  getSlotNumber = epochTime / interval, interval = 10 。也就是每过10s出现一个新的slot 。
5. blocks.getLastBlock: 顾名思义，获取当前最新的区块
6. getBlockSlotData->generateDelegateList (core/delegates.js) 先获取当前受托人列表，按票数排序，获取票数最高的 101 个受托人的公钥。并且对这些受托人列表进行『随机』排序。这里的随机应该是每个节点一样的随机，不是完全随机。
7. getBlockSlotData: 获取当前slot的检查受托人列表，如果在配置中该受托人的密钥对的，则进入到『区块的产生流程』。

『区块的产生流程』

0.  loop(core/delegates.js): 对于注册了受托人的节点，会有一个定时触发器，调用 blocks.js 里面的 generateBlock 。
1.  generateBlock(core/blocks.js): 首先从 transactions 里面获取未确认的交易列表。  
2.  generateBlock: 从未确认的交易列表中过滤出验证通过的交易列表。  
3.  base.block.create: 创建包含这些交易列表的新区块，验证区块是否合法。   
4.  hasEnoughVotes: 检查该受托人是否有足够的票数，如果票数不够，则不可生成区块。(这个步骤应该提前吧？)  
5.  processBlock: 通过 block.id 查询本地数据库，如果已经还未存在，则继续进行下面行为。
6.  applyBlock: 生效刚才验证通过的交易列表，就是对交易涉及的账号进行一些转账等操作，这部分逻辑在 src/base/transaction.js apply 函数中实现。交易有多种类型，后面再详述。
7.  base.block.dbSave: 存储 block 
8.  base.transaction.dbSave: 存储交易列表
9.  accounts.mergeAccountAndGet: 对新区块的创建者进行数据更新，创建者其实就是这个注册了受托人的节点。
10. setLastBlock: 将这个新的区块设置成当前最新的区块。
11. bus.message('newBlock') 广播这个新的区块。

『ToDo』

+ Asch链的交易流程
+ Asch链的HTTP接口实现原理
+ DApp原理和开发流程
+ ...

[Asch]:https://github.com/aschplatform/asch
[GitHub]:https://github.com/aschplatform/asch
[asch]:https://github.com/aschplatform/asch
[asch-frontend]:https://github.com/aschplatform/asch-frontend
[asch-js]:https://github.com/aschplatform/asch-js
[asch-cli]:https://github.com/aschplatform/asch-cli
[protobuf]:https://github.com/google/protobuf
