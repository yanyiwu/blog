---
published: true
layout: post
title: 谈谈Go语言的字符串设计
date: 2016-04-02
category: work
---

<center>        
<img src="http://7viirv.com1.z0.glb.clouddn.com/GoJieBaLogo-v2.png" class="photo", style="width:60%"></img>      
</center>        

『问题描述』

那天有用户向我反馈在使用 [GoJieba] 的过程中发现内存泄露的Bug。
具体现象就是这个测试代码 [test.go] 跑着跑着内存一直增长。 
刚开始以为是代码里面的C语言部分内存没有正确释放导致的，
查了很久一直没有找到问题所在。 

最后发现这个Bug非常白痴，是因为 C.CString 使用不当导致的。
在调用了 C.CString 之后需要手动释放内存。
这个Bug非常白痴，但是却反映了我之前对Go语言string理解不彻底的隐患。
才导致在我第一眼看到 C.CString 的时候，
就下意识的认为这个函数肯定没有动态申请新的内存，
和 C++ string::c_str() 一样，复用了内存。
所以也就肯定不需要手动释放。
当然这些只是『我以为』。

『问题深扒』

C语言和Go语言本是同根生嘛，
所以Go语言在设计的时候就通过cgo对C语言调用支持得很好。
而Go语言和C语言之间的数据转换就是通过 C.CString (Go->C), C.GoString(C->Go)
来进行的。

先谈谈 C.GoString ，很显然当使用 C.GoString 的时候，
会复制C语言的*char指针指向的字符串的内容拷贝到Go语言的string管理的内存空间。
Go语言的string管理的内存空间有gc管理，不需要用户主动释放内存。
也就是不需要管它。 

而 C.CString 将 Go语言 string 转换成 C语言字符串的时候。
我们就要谈谈为什么它不会像 C++ 的 string::c_str() 一样只是单纯的共用内存了。

本质原因在于对于 Go 来说， string 和 C语言最大的不同是:
在C语言中，字符串是以 '\0' 结尾。
其实我认为这个本身是一种历史遗留问题。

『C语言的字符串主要有两种存储方式可选』

比如一个 "hello" 的字符串。
我们在内存中表示可以有两种选择：

第一种：

```
"hello\0"
```

第二种：

```
typedef struct {
    char* buffer;
    size_t len;
} string;
```

C语言默认的字符串选择了第一种方式，
我认为主要原因在于当年C语言发明的时候是内存和稀缺的时代。
第一种方式比第二种方式显然更省内存。

但是随着时代的发展，内存越来越便宜。内存已经越来越不是程序开发的瓶颈。
第二种方式越来越成为字符串设计的首选。
比如在Nginx之类的著名开源项目中，也是采用了第二种方式对字符串进行存储。

而第二种方式更受青睐的主要原因我认为有两点:

『1. 更好的内存共享』

比如有一个字符串s1 = "hello world" ，
而有两种字符串s2 s3 分别是 s1 的子串："hello", "world" .
当我们使用第二种方式存储字符串的时候，
我们对于s2 s3就直接复用 s1的内存即可。
无需动态分配和释放，这样的场景在协议解析，比如HTTP包头的场景下特别常用。

而假设我们使用第一种方式存储字符串的话，
那么 s1 = "hello world\0", s2 = "hello\0",
虽然 s2 是 s1 的子串，但是因为 "\0" 结尾符的存在，
s2 就无法复用 s1 的内存，而是需要新申请一段新的内存。
这也是为什么在Go语言中， C.CString 函数返回的内存肯定是一段新的内存，
也就不得不要求调用者手动释放。

『2. 性能更高,获取长度不再是strlen这种O(N)时间复杂度的函数』

这点就比较显而易见了。

『最后』

其实Go的文档还是写的很详细的，如下，
只不过我自己思维惯性导致走入误区，这个锅得我自己背。

在 [cgo-1] 中关于 C.CString 的注释里面已经写的很清楚了。
需要手动释放，C.CString 返回的指针。

```
// Go string to C string
// The C string is allocated in the C heap using malloc.
// It is the caller's responsibility to arrange for it to be
// freed, such as by calling C.free (be sure to include stdlib.h
// if C.free is needed).
func C.CString(string) *C.char
```

在 [cgo-2] 中有释放 C.CString 返回指针的示例：

```
func Print(s string) {
    cs := C.CString(s)
    defer C.free(unsafe.Pointer(cs))
    C.fputs(cs, (*C.FILE)(C.stdout))
}
```

[cgo-1]:https://golang.org/cmd/cgo/
[cgo-2]:http://blog.golang.org/c-go-cgo
[test.go]:https://github.com/yanyiwu/practice/blob/master/go/gojieba/cstr/test.go
