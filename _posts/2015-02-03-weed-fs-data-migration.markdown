---
published: true
layout: post
title:  "Weed-FS之Volume数据迁移"
date:   2015-02-04
category: work
---

【Weed-FS又名叫Seaweed-FS】，
本篇主要是关于数据迁移相关的内容，
更详细的源码相关的请看[分布式存储Weed-FS源码分析]。

很多刚开始接触 Weed-FS 但是又不熟悉它的用户经常会使用以下的方式启动 weed 集群。

```
weed master -mdir="/tmp/mdata" -defaultReplication="001" -ip="localhost" -port=9334
weed volume -dir=/tmp/vol1/ -mserver="localhost:9334" -ip="localhost" -port=8081
weed volume -dir=/tmp/vol2/ -mserver="localhost:9334" -ip="localhost" -port=8082
weed volume -dir=/tmp/vol3/ -mserver="localhost:9334" -ip="localhost" -port=8083
```

一个 MasterServer 对应三个 VolumeServer ，设置复制模式为 "001" ，
也就是在相同 Rack 下复制副本为一份，也就是总共有两份。

经过一段时间的上传之后磁盘的文件如下：（其实只要上传一份文件之后就可以看到）

```
ls vol1 vol2 vol3
vol1:
1.dat 1.idx 2.dat 2.idx 3.dat 3.idx 5.dat 5.idx
vol2:
2.dat 2.idx 3.dat 3.idx 4.dat 4.idx 6.dat 6.idx
vol3:
1.dat 1.idx 4.dat 4.idx 5.dat 5.idx 6.dat 6.idx
```

也就是总共有6个Volume，分布在三个目录，这三个目录分别属于
VolumeServer1,VolumeServer2,VolumeServer3 。
此时如果想要缩减VolumeServer，比如去掉VolumeServer3。
不熟悉 Weed-FS 的人会很纠结是否可以直接将VolumeServer3的数据挪给
VolumeServer1 和 VolumeServer2 ？

其实这个完全是可以的，由 md5 就可以看出来：

```
md5 vol1/1.dat vol2/1.dat
MD5 (vol1/1.dat) = c1a49a0ee550b44fef9f8ae9e55215c7
MD5 (vol2/1.dat) = c1a49a0ee550b44fef9f8ae9e55215c7
md5 vol1/1.idx vol2/1.idx
MD5 (vol1/1.idx) = b9edc95795dfb3b0f9063c9cc9ba8095
MD5 (vol2/1.idx) = b9edc95795dfb3b0f9063c9cc9ba8095
```

只要名字相同，也就是 VolumeId 相同，
即使是属于不同 VolumeServer 的 Volume 
其实也是一模一样的（不一样就说明数据损坏），因为 Volume 里面并没有含有任何它所属于的 VolumeServer 的相关信息。
也有人怀疑是否会一模一样，担心备份的时候是采用最终一致性的异步备份方案。
这个也不用担心，在 [分布式存储Weed-FS源码分析] 里面就说过，
Weed-FS 是采用的强一致性的方式进行备份。
每次都是写完所有备份才完成一次上传操作。
客户端才会收到上传成功的返回值。

所以可以放心的将 VolumeServer3 的 Volume 挪到其他两个 VolumeServer，
如下，当然迁移数据之前需要将这四个服务都停止。

```
ls vol1 vol2 vol3
vol1:
1.dat 1.idx 2.dat 2.idx 3.dat 3.idx 4.dat 4.idx 5.dat 5.idx 6.dat 6.idx
vol2:
1.dat 1.idx 2.dat 2.idx 3.dat 3.idx 4.dat 4.idx 5.dat 5.idx 6.dat 6.idx
vol3:

```

然后再启动 MasterServer, VolumeServer1, VolumeServer2 即可，如下：

```
weed master -mdir="/tmp/mdata" -defaultReplication="001" -ip="localhost" -port=9334
weed volume -dir=/tmp/vol1/ -mserver="localhost:9334" -ip="localhost" -port=8081
weed volume -dir=/tmp/vol2/ -mserver="localhost:9334" -ip="localhost" -port=8082
```

其实后来这篇已经通过 `pull request` 提交到 weed-fs 的文档上面了。
但是鉴于现在搜索引擎上关于 weed-fs 的资料还是太少了，
所以还是增加这篇博文，丰富一下中文的索引数据吧。


[分布式存储Weed-FS源码分析]:http://yanyiwu.com/work/2015/01/09/weed-fs-source-analysis.html
[example]:https://github.com/yanyiwu/practice/tree/master/weedfs/example1
