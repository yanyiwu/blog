---
published: true
layout: post
title:  "Golang和Node.js的包管理对比"
date:   2014-10-01
category: work
---

Golang 和 Node.js 身为当今语言两大新贵，在使用这两者的时候常常会互相对比一下。
对语法上来讲，个人还是最喜欢 Golang 的简单和创新。而 Node.js 最让我满意的则是 npm 。
但是在此主要说说两者包管理对**依赖处理**的解决方案差异。

先说说 Golang 的。Golang 对依赖的处理宗旨是让你 **察觉不到依赖是远程的还是本地的仓库** 。
一切都是通过 `go get` 来实现。只要在源码里面是 

```
import "github.com/username/projectname"
```

在 `go get` 的时候工具自动帮你下载该依赖的源码包。
这样看上去非常简单，操作简单，但是却给我带来了不少困扰。

比如当我们今天需要依赖项目 pA 所以在源码里面写上 

```
import "code.google.com/uA/pA"
``` 

但是有天你发现 `code.google.com` 被墙且翻墙不易，你想使用 `github.com` 上的镜像仓库。
你就需要修改含有这句 `import` 的源码。也就是，对于 Golang 来说，**仓库依赖和源码耦合在一起** 。
又或者，你在 github 上面 Fork 了该项目，

从 `github.com/uA/pA` Fork 成 `github.com/uB/pA` 。

而该项目的源码里面存在 `import "github.com/uA/pA/sub1/"` 之类的依赖本项目子目录包的语句。
而你 Fork 之后，`go build` 就会**报错**说找不到 `github.com/uA/pA/sub1` 这个包里。
这个问题说白了不是什么新问题，比如在 `C/C++` 中，`#include "xxx"` 时，xxx 的路径应该是写**相对路径**。
而不能写**绝对路径**，因为当你写上绝对路径的时候，比如 `#include "/home/yanyiwu/code/xxx"` ，这样的话，源码就丧失可移植性了。
当然对付这个问题的话也是有现成的解决方案的，只是这个解决方案不是完美解决方案。

具体请看 [using-forked-package-import-in-go] 。

而对于 npm 的话，这个事情就简单很多。因为 npm 的包管理策略是 **集中式管理** ，
当你使用 `npm publish` 发布一个新包的时候，你的代码是被上传到 `npmjs.org` 上集中管理。
所以当你使用 `npm install` 安装一个新包的时候，你的代码是从 `npmjs.org` 下载得到。
当然这样集中式管理有单点故障，比如 `npmjs.org` 挂掉了或者被墙了就要悲剧？ 回答是否定的。
因为 npm 也支持指定仓库下载，比如在天朝内，勤劳自强的程序员们就搭建了一个国内的镜像 [cnpm] ，而且速度非常不错。
使用镜像也非常简单，比如这样：

```
npm --registry=http://r.cnpmjs.org install koa
```

具体用法可以参考 [faster-npm]。

说到这里，就可以注意到差别是在哪里。
就是对于依赖管理。`Node.js` 的包管理解决方案是和**源码无关**的。
在 Node 源码里面是不需要管这个包在哪个仓库下面。
就拿 [koa] 这个项目来说，在 [koa] 的 `package.json` 里可以看到：

```
"dependencies": {
    "accepts": "^1.1.0",
    "co": "^3.1.0",
     …
},
```

里面依赖了 `accepts` 这个包，在 [koa] 的源码里面直接 `var acceps = require(‘accepts’);` 即可，
源码并不需要知道 `accepts` 源码的仓库是在 `github.com` 上面还是 `gitcafe.com` 上面。
而且，由 npm 通过 `package.json` 文件来统一管理的另一个好处是依赖非常清晰，
可以看到所有的依赖和对应的版本。一目了然。
npm 这种集中式包管理的好处也能避免 golang 里面 包管理和源码 耦合在一起导致的问题。
所以个人看来，npm 的包管理解决方案确实是比较好。 希望 Golang 的之后的改进里面能参考一下这种解决方案。

其实现在国内的技术论坛有个风气不太好，就是当发表一些不同语言的分析对比时，总是会不可避免引起各种语言粉的敌意。
就比说我说 Golang 的包管理解决方案确实不如 Node 的 npm 。就会 Golang 粉们觉得我是专门来挑刺踢馆的。
其实我也是 Golang 粉，所以真心对于这种敌意很无语。

[using-forked-package-import-in-go]:http://stackoverflow.com/questions/14323872/using-forked-package-import-in-go
[cnpm]:http://cnpm.org/
[faster-npm]:http://fengmk2.cnpmjs.org/blog/2014/03/node-env-and-faster-npm.html
[koa]:https://github.com/koajs/koa
