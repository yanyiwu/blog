---
published: true
layout: post
title:  "谈谈并发编程中的协程"
date:   2014-12-20
category: work
---

## 高并发编程里多线程(进程)的弊端

其实从著名的 [C10K] 问题的时候，
就谈到了高并发编程时，
采用多线程(或进程)是一种不可取的解决方案，
核心原因是因为线程(或进程)本质上都是操作系统的资源，
每个线程需要额外占用1M或者2M的内存空间，
所以2G内存，能承受的线程数差不多只能到1k这个量级。

而且线程的调度由操作系统调度，
当线程或者进程数到达一定量级的时候，
据有人试验的结果是并发的线程数到达1k以上后，
操作系统基本上就已经不堪重负，调度不过来了。

## 事件驱动

已知多线程已经无法解决高并发问题，
所以才有了异步IO，事件驱动等概念来解决高并发编程。
很典型的就是 [Node.js] ，传说中的事件驱动，
其实就是在底层使用了 [libuv] 
(我记得是和 [libevent] 类似，都是把 epoll 之类的异步IO库进一步的封装而已)
然后通过各种回调函数来注册事件，
当事件触发的时候回调函数也被触发。
使用事件驱动的方式确实能解决高并发的问题，
但是因为事件驱动最费劲的就是各种丧心病狂不停的回调，
在回调里面再嵌套回调，容易陷入所谓的【回调地狱】。
这也是 [Node.js] 最受人诟病的地方。

## 高并发解决方案之协程

面向对象最典型的语言是 Java ,
事件驱动最典型的语言是 [Node.js] ,
协程最典型的语言就是 [golang] ,
当然国内程序员[响马]的 [fibjs] 也是基于协程来进行并发的，
也非常出色，只不过在生态上还是发展的太慢了。
个人看来协程相对于事件驱动是一种更先进的高并发解决方案，
把复杂的逻辑和异步都封装在底层，
让程序员在编程时感觉不到异步的存在，
用[响马]的话就是【用同步抒写异步情怀】。
个人很看好协程的发展，
同时也非常看好 [golang] 的前景，

协程也叫用户级线程，
很多人分不清楚协程和线程和进程的关系。
简单的说就是:
线程和进程的调度是由操作系统来调控，
而协程的调度由用户自己调控。
所以协程调度器可以在协程A即将进入阻塞IO操作，
比如 socket 的 read （其实已经设置为异步IO ）之前，
将该协程挂起，把当前的栈信息 StackA 保存下来，
然后切换到协程B，
等到协程A的该 IO操作返回时，
再根据 StackA 切回到之前的协程A当时的状态。

## ucontext

[云风] 开源过一个简单的协程实现 [cloudwu-coroutine]，
主要是基于 [ucontext] 来进行状态的切换。

[ucontext] 由以下四个函数组成：

- getcontext
- setcontext
- makecontext
- swapcontext

具体含义谷歌一下看看例子就明白了，资料很多。
说白了其实就是一种类似 goto 的编程方法，
getcontext 就是将当前协程上下文获得并存起来，
setcontext 就是跳转到某个协程上下文状态。
前者类似 label , 后者类似 goto 。
makecontext 和 swapcontext 稍微再复杂一点点，
但是也都是干着上下文切换的勾当。

[云风] 的 [cloudwu-coroutine] 代码非常干净漂亮，
学习之余也 fork 并修改了一份云风的协程实现：[fork-coroutine] ，
没什么高明的改进，只是对我来说更加简单易懂。

[fork-coroutine]:https://github.com/aszxqw/coroutine
[ucontext]:http://pubs.opengroup.org/onlinepubs/7908799/xsh/ucontext.h.html
[云风]:http://blog.codingnow.com/
[C10K]:http://www.kegel.com/c10k.html
[响马]:http://www.weibo.com/xicilion
[fibjs]:https://github.com/xicilion/fibjs
[cloudwu-coroutine]:https://github.com/cloudwu/coroutine
[Node.js]:https://github.com/joyent/node
[libuv]:https://github.com/joyent/libuv
[golang]:https://github.com/golang/go
[libevent]:http://yanyiwu.com/work/2014/12/10/asyncronous-io-libevent.html
