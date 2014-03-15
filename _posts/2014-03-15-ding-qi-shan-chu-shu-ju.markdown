---
layout: post
title:  "切割和删除过期日志的简单方法"
date:   2014-03-15
categories: jekyll update
---

日志管理一般是运维负责统一管理，开发是不用管这个事情。

但是今天意外的得知有些小公司不知道如何管理，要么干脆直接不输出日志（防止磁盘被挤爆），要么输出日志直到磁盘爆了再手动删除。。。

所以才有这篇日志，其实日志管理可以很简单的。

## 方法示例

此脚本是crontab在每天零点自动运行。

```sh
#!/bin/bash

# 指定日志所在目录
logdir="/d1/logs/"

# 切割日志
date=$(date -d "yesterday" +"%Y%m%d")
cp $logdir/run.log $logdir/run.log.$date
cat /dev/null > $logdir/run.log

# 利用find命令删除7天以前且文件前缀为www的文件
find $logdir -name "www*" -type f -mtime +7 -exec rm -f {} \;
```

不过此方法毕竟是__简单__解决方法而已，切割日志的时候会导致__微量__日志__丢失__。
但是其实对于小公司(__流量不大__)来说这个方法已经简单够用了。

而且现在很多程序输出日志都是自己切割好输出的，对于这样的，则可以直接跳过脚本里__切割日志__ 那三行代码。

Have Fun.
