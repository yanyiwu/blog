---
published: true
layout: post
title:  "golang的select典型用法"
date:   2014-11-08
category: work
---

golang 的 select 的功能和 `select, poll, epoll` 相似，
就是监听 IO 操作，当 IO 操作发生时，触发相应的动作。

示例：

```
ch1 := make (chan int, 1)
ch2 := make (chan int, 1)

...

select {
case <-ch1:
    fmt.Println("ch1 pop one element")
case <-ch2:
    fmt.Println("ch2 pop one element")
}
```

注意到 select 的代码形式和 switch 非常相似，
不过 select 的 case 里的操作语句只能是【IO 操作】 。

此示例里面 select 会一直等待等到某个 case 语句完成，
也就是等到成功从 ch1 或者 ch2 中读到数据。
则 select 语句结束。

【使用 select 实现 timeout 机制】

如下：

```
timeout := make (chan bool, 1)
go func() {
    time.Sleep(1e9) // sleep one second
    timeout <- true
}()
ch := make (chan int)
select {
case <- ch:
case <- timeout:
    fmt.Println("timeout!")
}
```

当超时时间到的时候，case2 会操作成功。
所以 select 语句则会退出。
而不是一直阻塞在 ch 的读取操作上。
从而实现了对 ch 读取操作的超时设置。

下面这个更有意思一点。

当 select 语句带有 default 的时候：

```
ch1 := make (chan int, 1)
ch2 := make (chan int, 1)

select {
case <-ch1:
    fmt.Println("ch1 pop one element")
case <-ch2:
    fmt.Println("ch2 pop one element")
default:
    fmt.Println("default")
}
```

此时因为 ch1 和 ch2 都为空，所以 case1 和 case2 都不会读取成功。
则 select 执行 default 语句。

就是因为这个 default 特性，
我们可以使用 select 语句来检测 chan 是否已经满了。

如下：

```
ch := make (chan int, 1)
ch <- 1
select {
case ch <- 2:
default:
    fmt.Println("channel is full !")
}
```

因为 ch 插入 1 的时候已经满了，
当 ch 要插入 2 的时候，发现 ch 已经满了（case1 阻塞住），
则 select 执行 default 语句。
这样就可以实现对 channel 是否已满的检测，
而不是一直等待。

比如我们有一个服务，
当请求进来的时候我们会生成一个 job 扔进 channel，
由其他协程从 channel 中获取 job 去执行。
但是我们希望当 channel 瞒了的时候，
将该 job 抛弃并回复 【服务繁忙，请稍微再试。】
就可以用 select 实现该需求。

## 关于垃圾回收

`c++` 写久了的人，
刚接触 golang 的时候最不能理解的就是为什么作者要支持垃圾回收。
不管是从垃圾回收器的实现上看，
还是对于程序员编程习惯的养成方面，
都避免不了编写出的程序性能损失。
但是写了几天 golang 之后，
又觉得有垃圾回收确实大大减轻程序员的心智负担，
降低编程门槛，提高编程效率。
让我联想到 汇编 和 C语言 的关系，
即使 C语言的性能不如汇编写出来的高，
但是后者还是颠覆了前者。

## 参考

+ [go语言编程]
+ [go语言程序设计]


[go语言编程]:http://book.douban.com/subject/11577300/
[go语言程序设计]:http://book.douban.com/subject/24869910/

