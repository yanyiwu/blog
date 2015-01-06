---
published: false
layout: post
title:  "分布式存储Weed-FS源码分析"
date:   2014-12-27
category: work
---

基于源码版本是 0.67 版本

[Weed-FS] 是一个非常优秀的由 golang 开发的分布式存储开源项目，
虽然在我刚开始关注的时候它在 github.com 上面只有 几十个 star，
但是我觉得这个项目是一个几千star量级的优秀开源项目。
[Weed-FS] 的设计原理是基于 Facebook 的一篇图片存储系统的论文 [Facebook-Haystack]，
论文很长，但是其实原理就几句话，可以看看 [Facebook图片存储系统Haystack] ，
我觉得[Weed-FS]是青出于蓝而胜于蓝。

[Weed-FS] 这个开源系统涵盖的知识很多，
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

定时删除功能，这个感觉很酷炫，但是在Weed-FS里面的实现原理很简单，
按 Volume 来进行分块，当每次用户上传一个自带TTL的文件（需要定时删除的文件）时，
会把这个文件存储在合适的 Volume 里面（如何选出合适的 Volume 之后再说），
存储的时候每个文件会带有 TTL 这个属性，
当读取出来之后发现该文件已经过期（超时时间到），则会返回一个 Not Found 结果，
而每个 Volume 维护一个最大超时时间，当这个时间抵达时，说明整个 Volume 所有的文件都超时了，
然后 VolumeServer 通知 MasterServer 这个 Volume 已经被标识为 Dead 状态，
意味着 MasterServer 不会再为这个 Volume 分配新的 Fid。
然后再经过一段合适的时间后由 VolumeServer 将这个 Volume 从磁盘上安全的删除掉。
详细请看在[Weed-FS]自带的文档[ttl]，

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
假设在 rack1 中含有 DataNode1, DataNode2, DataNode3 三个数据节点中【随机】选出两个数据节点，
比如选出 DataNode1, DataNode2 然后同时写入这两个数据节点。
假设 rack1 只有一个数据节点的时候，而备份模式是 001 模式，
则无法正常备份，服务会报错。

注意到，选择备份数据节点的方法是【随机】，所以就会出现从三个数据节点中随机选择两个的情况下，

```
curl -v -F "file=@/tmp/test.json" localhost:8081/5,1ce2111f1
```

topo.NextVolumeId 负责生成 VolumeId ，
负责在 VolumeGrowth 里的时候分配 Volume 的时候，
生成一个全局唯一的新 VolumeId，
在 Weed-fs 中，是支持 多 MasterServer 集群的。
当有多个 MasterServer，生成一个全局唯一的新 VolumeId 是很重要，
在 Weed-fs 中是通过 [goraft] 来实现的。

Replication 是根据 VolumeId 分配的，

## Volume

```
type Volume struct {
    Id         VolumeId
    dir        string
    Collection string
    dataFile   *os.File
    nm         NeedleMapper
    readOnly   bool

    SuperBlock

    accessLock       sync.Mutex
    lastModifiedTime uint64 //unix time in seconds
}
```

+ VolumeId 通俗易懂，比如 `"fid":"3,01f9896771"` 里面逗号前面的 3 就是 VolumeId 。
+ dir 就是该 Volume 所在的目录，
+ Collection 很有用，每个 Volume 只能对应同一个 Collection，不同 Collection 的图片存储在不同 Volume，后面会讲到。
+ 所以同一个 Volume 只能针对某一个 Collection ，而 同一个 Collection 的图片可能分布在不同的 Volume。
dataFile 就是对应的文件句柄。
+ nm NeedleMapper 看上去像是个 map ，其实是个列表，包含多个 Needle ，后面会讲到。
+ readOnly 是否只读
+ SuperBlock 超块，后面会讲到。
+ accessLock 互斥锁
+ lastModifiedTime 最近修改时间

以上最关键的两个点就是 SuperBlock 和 NeedleMapper ，
这两者在文件中布局如下：

```
+-------------+
|SuperBlock   |
+-------------+
|Needle1      |
+-------------+
|Needle2      |
+-------------+
|Needle3      |
+-------------+
|Needle ...   |
+-------------+
```

```
1 Volume = 1 SuperBlock + n Needle
```

### SuperBlock

```
/*
* Super block currently has 8 bytes allocated for each volume.
* Byte 0: version, 1 or 2
* Byte 1: Replica Placement strategy, 000, 001, 002, 010, etc
* Byte 2 and byte 3: Time to live. See TTL for definition
* Rest bytes: Reserved
 */
type SuperBlock struct {
    version          Version
    ReplicaPlacement *ReplicaPlacement
    Ttl              *TTL
}
```

SuperBlock 内维护的数据基本上就是该 Volume 的元数据。

+ ReplicaPlacement 

### Needle

### Collection

示例如下：

启动 MasterServer

```
weed master
```

启动 VolumeServer

```
weed volume -dir="/tmp/data1" -max=5  -mserver="localhost:9333" -port=8080
```

申请Fid

```
curl "http://127.0.0.1:9333/dir/assign?collection=pictures"
{"fid":"4,01d50c6fbf","url":"127.0.0.1:8080","publicUrl":"localhost:8080","count":1}
```

```
curl "http://127.0.0.1:9333/dir/assign?collection=mp3"
{"error":"No free volumes left!"}
```

```
curl "http://127.0.0.1:9333/dir/assign?collection=pictures"
{"fid":"5,0147ed0fb7","url":"127.0.0.1:8080","publicUrl":"localhost:8080","count":1}
```

申请Fid的示例解释：

1. 
因为默认情况下，VolumeServer 启动时，
未申请任何 Volume，当第一次 `/dir/assign` 的时候，
会分配 Volume，因为 `weed volume` 的参数 `-max=5`
所以一次性分配 5 个 Volume ，并且这 5 个 Volume 的 Collection 属性都是 pictures，
甚至可以看到在 `ls /tmp/data1` 的结果如下：

```
/tmp/data1
pictures_1.dat pictures_1.idx pictures_2.dat pictures_2.idx pictures_3.dat pictures_3.idx pictures_4.dat pictures_4.idx pictures_5.dat pictures_5.idx
```

可以看出每个卷的文件名以 Collection 来命名。

2.
因为已有的 5 个 Volume 的 Collection 属性都是 pictures，
所以此时如果需要 `/dir/assign` 一个非 pictures Collection 的 Fid 时失败，

3.
当申请一个属于 pictures Collection 的 Fid 成功。

也就是在每次申请 Fid 时，会针对 Collection 进行检查，来保证存入 Volume 的每个 Needle 所属的 Collection 一致。
在实际应用中





















[weed-fs/docs]:http://weed-fs.readthedocs.org/en/latest/
[Weed-FS]:https://github.com/chrislusf/weed-fs
[ttl]:http://weed-fs.readthedocs.org/en/latest/ttl.html
[Facebook-Haystack]:http://yanyiwu.com/weedfs/3/564fc3ddb0/Facebook-Haystack.pdf
[Facebook图片存储系统Haystack]:http://yanyiwu.com/work/2015/01/04/Haystack.html
[goraft]:https://github.com/goraft/raft
