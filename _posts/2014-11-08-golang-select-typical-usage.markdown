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

## 参考

+ [go语言编程]
+ [go语言程序设计]

顺便说说，我自己对这两本书的评价：

> 【go语言程序设计】和【go语言编程】这两本书我都看过。 
> 前者偏向于学院派教科书，语言表述非常啰嗦。 
> 后者偏向于工程派，我在看完书之后写代码的时候，
> 有疑问了会经常翻看【go 语言编程】查找对应的内容看，
> 作者表述言简意赅，一翻我就能找到我想要的答案，
> 让人感觉是自己想问的，作者早就思考过并已经很好的介绍和解释。 
> 说白了，如果你是编程初学者，那么请看【go语言程序设计】。
> 如果是有良好基础的开发者，直接看【go语言编程】会高效很多。


[go语言编程]:http://book.douban.com/subject/11577300/
[go语言程序设计]:http://book.douban.com/subject/24869910/

