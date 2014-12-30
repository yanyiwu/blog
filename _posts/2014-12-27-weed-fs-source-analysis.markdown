---
published: false
layout: post
title:  "分布式存储WeedFS源码分析"
date:   2014-12-27
category: work
---

[WeedFS]

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
- sequence  负责FileID每次生成的


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


[WeedFS]
[ttl]:http://weed-fs.readthedocs.org/en/latest/ttl.html
