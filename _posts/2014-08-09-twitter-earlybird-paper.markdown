---
published: true
layout: post
title:  "Twitter实时搜索引擎EarlyBird"
date:   2014-08-09
category: work
---


【背景】

工作的需要最近参看了 Twitter 的关于实时搜索引擎 EarlyBird 的论文。算是很通俗易懂的架构性的论文，论文分享地址：http://pan.baidu.com/s/1dD4BGp7 

【索引】

twitter 的这篇论文关于实时搜索引擎架构的亮点在于实时索引的设计。  

实时索引的索引结构分成静态索引(static)和动态索引(active)。  


静态索引讲究检索效率和存储压缩，一旦形成静态索引，就是只读的(read-only)。  

动态索引讲究插入效率快，特别是在 twitter 的应用场景中，当一些重大事件发生时，用户的发表 tweet 的时间会非常集中，此时索引请求的峰值就会很高。   
而插入效率快慢很关键的问题在于倒排链表增加时的内存分配，因为内存是动态分配，当分配小了，会经常导致内存的分配和回收，当分配大了会浪费内存。  
所以动态索引的设计核心主要解决倒排索引的 postinglist （term对应的倒排链表）长度的动态增加问题。  

EarlyBird 是使用四个独立的 pool 作为 postinglist 链表的内存池。这四个内存池所能分配的空间大小分别是【2^1, 2^4, 2^7, 2^11】个 postingitem 大小所需的空间。  
当倒排链表的动态索引插入第一个新 item 的时候，会先找 pool1 分配出 2^1 个单位的空间 space1 ，然后当 space1 空间满了的话再找 pool2 申请出 2^4 个单位的空间 space2，然后 space2 满了再找 pool3 分配 space3 ，以此类推最后找 pool4 分配 space4 ，此时如果 space4 满了之后。会继续找 pool4 分配 space4 。  
而且这些 space1 space2 space3 space4 space4 … 是依次串接起来，而不是替换（替换是指当space1满了之后，申请出space2，然后将space1拷贝到space2后再将space1销毁），这样就避免了内存重新分配所带来的迭代器失效问题（这里的迭代器失效是 C++ vector `push_back` 时会出现的典型问题）。  

【压缩】

压缩考虑的主要是空间压缩和解压效率，采用的算法主要是 PForDelta 和 Simple9 算法。前者解压速度非常快。  

【并发】

实习索引主要的并发控制的问题在于索引的实时增加和更新（Writer），和query进来时对索引的检索（Reader）。  

Writer 过程主要是：  
tweet 进来之后，先对每一个 term 查找词典，如果词典中存在过，就找出对应的 `term_id`，然后再根据 `term_id` 找出对应的 `posting_list` 可插入的地方，将这个 tweet 的 doc 信息插入，然后讲maxDoc值 +1，标志着此新增tweet的过程已经处理完毕。  
如果这个term在词典中未找到，就先先更新词典，增加新的`term_id`，并且为此 `term_id` 分配空闲的 `posting_list`， 之后接下来的过程和刚才一样。  

对于 tweet 的新增索引，处理并发不难，因为在 Reader 读取的时候，会先读取 maxDoc 这个变量。也就是Writer过程还没结束的话，maxDoc是不会改变的。当读取的 docid 不再 maxDoc 范围之内的话，就说明这个 docid 指向的 doc 信息还不完整，则抛弃。  
所以这样就解决了读写并发的问题。  
不过在这个设计中，要注意 【memory barrier】 ，在编译器的优化中，会为了效率上的提速，而打乱代码的执行效率，所以需要 memory barrier （内存屏障） 来保证某些线程相关的关键代码。  
比如在 EarlyBird 中，就需要用内存屏障来保证 macDoc +1 的这个行为，在新 doc 完整插入之后才发生。 避免在 doc 信息不完整的时候， macDoc 已经 +1，从而让 Reader 线程读取到不完整 doc 信息，破坏了一致性。  

【总结】

每种架构都是针对特定的业务场景来设计的，在架构层面上其实没有通解。  
这篇论文算是非常朴实和实用的设计，没有什么花哨且高大上的设计，但是却能解决很实际的问题。  


