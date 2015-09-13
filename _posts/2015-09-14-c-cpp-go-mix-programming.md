---
published: false
layout: post
title:  C/C++/Go混合编程实践之GoJieba
date:   2015-09-14
category: work
---

最近想在团队中推动Go在项目中更多场景的应用，提高开发效率。
但是遇到了一个顾虑，就是有些功能库是 C++ 写的，
切换到 Go 开发之后如果需要这些功能的话，
完全重写一个短期内不现实。
所以就产生了探究 C/C++/Go 混合编程的想法。

很早之前就听说 Go 语言对 C 语言非常友好，
几乎可以无缝使用 C 的一些丰富遗产。
刚学 Go 的时候尝试了一下，应该是因为参考的资料的问题，
没有顺利跑通。后来忙其他事情了，也没有深究为什么。

所以趁这个周末捣鼓了一下，跑通了 C/C++/GO 混合编程。
主要参考 [how-to-use-c++-in-go] 和 [cgo] ，
不过前者的回答毕竟久远了，比如就不需要写像作者描述的，
那么复杂的 Makefile，直接 go build 即可(可以参考我跑通的这个示例[practice-cgo])。
cgo 会自动对 .cpp(.cc) 文件调用 CXX (linux 下是 g++) 去编译，
对 .c 文件调用 CC (linux 下是 gcc) 去编译。
当然前提是 CGO_ENABLED="1" (默认就是打开的，通过 go env 可以看到)。
至于编译和链接参数，
直接在 .go 文件里面的 import "C" 上面注释里面著名即可。
import "C" 是一个伪模块，在该行上方注释里面可以写 C代码，
比如 #include 之类的都可以写在里面，
调用的时候就是用 C.xxx 去调用。
所以对于自己的C++库，想在 Go 中调用，
只需要把他们封装好 C的 .h 接口，然后再 Go 中include然后调用即可。
因为对于对应目录下的 .c 或者 .cpp 都会在 go build 的时候被自动编译成链接库。
甚至，连 Go 中 include 的头文件如果被修改了， 
go build 也会自动的识别并重新编译。
也就是在 C/C++ 开发中 Makefile 的作用，
在 Go 中已经被 go build 直接完成了。
简直是太体贴周到了。

[gojieba]:https://github.com/yanyiwu/gojieba
[how-to-use-c++-in-go]:http://stackoverflow.com/questions/1713214/how-to-use-c-in-go
[cgo]:http://golang.org/cmd/cgo/
[practice-cgo]:https://github.com/yanyiwu/practice/tree/master/go/cgo/foo
