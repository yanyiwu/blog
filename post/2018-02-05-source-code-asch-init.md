---    
published: true
layout: post    
title: Asch源码阅读:启动过程概述
date: 2018-02-05
category: work    
display: onlydetail
---    

# Asch源码阅读:启动过程概述

<center>  
<img src="http://images.yanyiwu.com/xas.jpg" class="photo"></img>  
</center>  

以下源码阅读基于 asch@1.3.5 版本。

『入口模块: app.js』

主要有如下步骤

1. 读取配置文件 config.json
2. 读取创世区块的配置 genesisBlock.json
3. 配置 dbFile 路径，默认路径为 blockchain.db
4. 调用 src/init.js 模块开始初始化，传入 option 参数，主要包括 区块数据库路径，配合文件，创世区块等，这个初始化过程是整个启动过程的核心，后面会详解。
5. 验证创世区块。（这个环节是不是可以提前？）
6. 触发各个核心模块的 onBind 回调，主要是触发 src/core/loader.js 的相关载入数据库工作。
7. 注册各个异常处理的函数，比如收到kill信号后做一些清理善后工作。
8. 大功告成。

『src/init.js初始化详解』

src/init.js 负责初始化，用 async.auto 来处理各种先后依赖顺序，避免回调地狱，刚开始看的时候会比较绕， 但是看懂了就很清晰了。  

src/init.js 的初始化主要是以下步骤：

1. config: (1~4都是在刚才的app.js提到的，从app.js调用init.js时传入的option中读取。)
2. logger: 同上
3. genesisblock: 同上
4. protobuf: 同上
5. scheme: 这里我的理解应该叫 schema 吧？
6. network: 创建一个express框架搭建的http服务器。
7. dbSequence: 数据库的顺序操作队列
8. sequence: 主要的顺序操作队列
9. balancesSequence: 余额顺操作队列，比如转账后余额的增减。
10. connect: 给network模块创建的服务器注册一些逻辑函数，让network的http服务器开始监控端口，等于是启动服务。
11. bus: 串联各个核心模块的总线，后面会详细介绍这个。
12. dbLite: 数据库
13. oneoff: TO DO
14. balanceCache: 简单内存数据库。
15. model: dbLite 的上层模型，包装更简易的操作api
16. base: base 这里面负责初始化 ./src/base/ 目录下的模块，主要是 base.account, base.block, base.consensus, base.transaction
17. modules: 这个步骤负责载入 ./src/core/ 目录下面的各个js文件（模块），包括 blocks.js, dapps.js 等。

> 备注：以上步骤有一些前置依赖的关系，比如 network 步骤依赖 config 步骤完成，dbSequence 依赖 logger 步骤完成，
具体依赖关系详见代码吧。

『src/core/ 模块简述』

src/core/ 这个目录是整个 Asch 源码的核心部分，以 src/core/delegates.js 和 src/core/blocks.js 这两个模块为例，
前者负责受托人的锻造机制，后者负责区块的生成。
但是他们都有公共的模块变量，var moduels, library ，这两个贯穿了整个核心逻辑，所以需要先明确这两个变量的由来：

+ var library: 是之前的 init.js 初始化的合集，比如从 library 里可以找到 logger, dbLite 等。
+ var moduels: 是 src/core 的合集，在里面可以找到 transactions, accounts 等。

『Asch的事件驱动总线：bus.message』

bus.message(src/init.js) 是串联各个核心模块的总线。

举例说明：

在 core/delegates.js 中已经注册了 onBlockchainReady 这个回调函数。
而这个回调是在 core/loader.js 中通过 library.bus.message('blockchainReady'); 去触发调用。 

从 src/init.js 代码里可以看出 bus.message 的实现，
可以看出触发时事件名字和真正回调函数的映射关系是 var eventName = 'on' + changeCase.pascalCase(topic);
也就是 blockchainReady -> onBlockchainReady 的映射关系，依次类推的还有：

+ blockchainReady -> onBlockchainReady
+ newBlock -> onNewBlock
+ bind -> onBind
+ ...

『src/core/loader.js 的 onBind 初始化』

在最开始的 app.js 中，调用完 init.js 进行各种初始化之后，后面还有非常重要的一步就是触发 onBind 函数 
当然也是通过 bus.message('bind') 去触发。

对于 src/core/ 下面的各个模块，基本上每个模块都有注册 onBind 函数，
但是大部分都只是打酱油的而已。比如 accounts 等模块的 onBind 函数，只是初始化赋值了 moduels 这个变量而已。

但是，有且仅有，src/core/loader.js 这个模块的 onBind 函数做的都是干货，接下来谈谈 loader.js 的 onBind 做了什么。

所以接下来下篇文章会从 src/core/loader.js 入手来谈谈 Asch源码核心模块之 src/core/ 各个模块详解。
