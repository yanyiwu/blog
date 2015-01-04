---
published: false
layout: post
title:  "分布式存储WeedFS源码分析"
date:   2014-12-27
category: work
---


基于源码版本是 0.67 版本

[WeedFS] 是一个非常优秀的由 golang 开发的分布式存储开源项目，
虽然在我刚开始关注的时候它在 github.com 上面只有 几十个 star，
但是我觉得这个项目是一个几千star量级的优秀开源项目。

[WeedFS] 这个开源系统涵盖的知识很多，
很难在一篇文章里面说清楚，
只能尽可能的说清楚核心和主要的部分。

## 理解Fid

```
curl -F "file=@/tmp/test.mp3" http://127.0.0.1:9333/submit
{"fid":"13,a63757c449","fileName":"test.mp3","fileUrl":"localhost:8080/13,a63757c449","size":7}
```


## 源码目录结构

核心模块

- weed 入口目录
- weed/weed\_server 入口目录与HTTP服务相关
- storage 核心模块，主要包括【store, volume, needle】这三大块存储相关的源码。
- topology  
- sequence  负责FileID的全局有序生成


- filer 提供支持 HTTP REST 操作的文件服务器，其实就是基于 leveldb 把文件名和目录结构存储起来。
- stats 和操作系统内存和磁盘使用状况有关的模块
- operation 由protobuf生成的代码们
- proto 存放protobuf的描述文件
- glog 日志模块
- images 图片服务
- util 工具函数
- tools 工具，暂时只有一个读索引的文件。

### TTL(Time To Live)

定时删除功能，这个感觉很酷炫，但是在WeedFS里面的实现原理很简单，
按 Volume 来进行分块，当每次用户上传一个自带TTL的文件（需要定时删除的文件）时，
会把这个文件存储在合适的 Volume 里面（如何选出合适的 Volume 之后再说），
存储的时候每个文件会带有 TTL 这个属性，
当读取出来之后发现该文件已经过期（超时时间到），则会返回一个 Not Found 结果，
而每个 Volume 维护一个最大超时时间，当这个时间抵达时，说明整个 Volume 所有的文件都超时了，
然后 VolumeServer 通知 MasterServer 这个 Volume 已经被标识为 Dead 状态，
意味着 MasterServer 不会再为这个 Volume 分配新的 Fid。
然后再经过一段合适的时间后由 VolumeServer 将这个 Volume 从磁盘上安全的删除掉。
详细请看在[WeedFS]自带的文档[ttl]，

## Topology

topology 整个模块最核心的数据结构是三个：

+ DataCenter
+ Rack
+ DataNode

topology 是树状结构，DataNode 是树的叶子节点，
DataCenter 和 Rack 是树的非叶子节点，
DataCenter 是 Rack 的父母节点。
如下图

```
            DataCenter
                |
                |
       ------------------
       |                |
       |                |
      Rack            Rack
       |
       |
   ------------
   |          |
   |          |
 DataNode  DataNode
```

也就是在 MasterServer 维护的拓扑结构里，
是把 VolumeServer 的相关信息存储在 DataNode 里，
所以在代码里面可以看到如下：

```
dc := t.GetOrCreateDataCenter(dcName)
rack := dc.GetOrCreateRack(rackName)
dn := rack.FindDataNode(*joinMessage.Ip, int(*joinMessage.Port))
```

每次查找对应的DataNode，都需要从 DataCenter -> Rack -> DataNode 依次找下去。

通过 `curl "http://localhost:9333/vol/vacuum"`

## Replication

Replication 和 Topology 严重相关，
在配置文件中可以配置多种备份模式，详见 [weed-fs/docs] 。

```
+-----+---------------------------------------------------------------------------+
|001  |replicate once on the same rack                                            |
+-----+---------------------------------------------------------------------------+
|010  |replicate once on a different rack in the same data center                 |
+-----+---------------------------------------------------------------------------+
|100  |replicate once on a different data center                                  |
+-----+---------------------------------------------------------------------------+
|200  |replicate twice on two other different data center                         |
+-----+---------------------------------------------------------------------------+
```

比如在 001 模式，即在同一个 rack 中的不同 DataNode 中备份一份。
假设在 rack1 中含有 DataNode1, DataNode2, DataNode3 三个数据节点中随机选出两个数据节点，
比如选出 DataNode1, DataNode2 然后同时写入这两个数据节点。
假设 rack1 只有一个数据节点的时候，而备份模式是 001 模式，
则无法正常备份，服务会报错。

































[weed-fs/docs]:
[WeedFS]:https://github.com/chrislusf/weed-fs
[ttl]:http://weed-fs.readthedocs.org/en/latest/ttl.html
