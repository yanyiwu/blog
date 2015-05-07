---
layout: post
title:  "切割和删除过期日志的简单方法"
date:   2014-03-15
category: work
---

日志管理一般是运维负责统一管理，开发是不用管这个事情。

但是今天意外的得知有些小公司不知道如何管理，要么干脆直接不输出日志（防止磁盘被挤爆），要么输出日志直到磁盘爆了再手动删除。。。

所以才有这篇日志，其实日志管理可以很简单的。

## 方法示例

此脚本是crontab在每天零点自动运行。

```sh
#!/bin/bash

# 指定日志所在目录
logdir="/opt/logs/"

# 切割日志
date=$(date -d "yesterday" +"%Y%m%d")
cp $logdir/run.log $logdir/run.log.$date
cat /dev/null > $logdir/run.log

# 利用find命令删除7天以前且文件前缀为www的文件
find $logdir -name "www*" -type f -mtime +7 -exec rm -f {} \;
```

不过需要注意的是，输出日志的进程重定向的时候要使用追加的写入方式，即:

```
./bin/server.start >> run.log 2>&1 
```

而不是

```
./bin/server.start > run.log 2>&1 
```

Have Fun.

