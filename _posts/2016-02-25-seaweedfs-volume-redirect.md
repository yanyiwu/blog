---    
published: true
layout: post    
title:  Seaweedfs之Volume读请求重定向
date:   2016-02-25 
category: work  
---    

<center>    
<img src="http://images.yanyiwu.com/seaweedfs.png" class="photo" style="width:60%"></img>    
</center>    

『场景展现』

启动一个 weed master 服务。

```
weed master -mdir="/tmp/mdata" -defaultReplication="000"
```

启动两个 weed volume 服务。

```
weed volume -dir=/tmp/vol1/ -mserver="127.0.0.1:9333" -port=8080
weed volume -dir=/tmp/vol2/ -mserver="127.0.0.1:9333" -port=8081
```

上传一个文件

```
curl -F "file=1234" "http://127.0.0.1:9333/submit"
{"fid":"4,01146873ae","fileName":"","fileUrl":"127.0.0.1:8081/4,01146873ae","size":4}
```

通过返回的 fileUrl 可以正常访问到。

```
curl 127.0.0.1:8081/4,01146873ae
1234
```

但是当我们用同一个fid去请求另一台机器的时候，会获取到一个 HTTP 302 Moved Permanently 的结果。

```
curl -v 127.0.0.1:8080/4,01146873ae

...

< HTTP/1.1 301 Moved Permanently
< Location: http://127.0.0.1:8081/4,01146873ae
< Date: Wed, 24 Feb 2016 16:21:49 GMT
< Content-Length: 69
< Content-Type: text/html; charset=utf-8
<
<a href="http://127.0.0.1:8081/4,01146873ae">Moved Permanently</a>.
```

『实现原理』

根据源码验证了一下，  
原理在于 volume 本身缓存着 volumeId 到 Localtion（也就是VolumeServer的url地址）的键值对，  
根据 volumeId 可以得知应该重定向到哪台 VolumeServer。  
缓存时间目前是代码里面写死的10分钟，缓存过期后再去从 MasterServer 获取，  

所以这个重定向的功能当 MasterServer 挂掉的时候是无法实现的。即使 VolumeServer 都还存活。    
所以之前可能很多人认为 MasterServer 只和上传文件，也就是文件的写操作有关，  
和读操作没有任何关系。但是像这个Redirect的事情，就需要借助 MasterServer 实现。  

本身这部分实现原理没有太多高深的技术，    
只算是阅读源码验证一下实现思路吧，  
简单有效的实现方式就挺好的。
