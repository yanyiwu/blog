---  
published: true  
layout: post  
title:  C++之stl::string写时拷贝导致的问题
date:   2016-01-30
category: work  
---  
  
<center>  
<img src="http://images.yanyiwu.com/error.png" class="photo"></img>  
</center>  

前几天在开发某些数据结构到文件的 Dump 和 Load 功能的时候，
遇到的一个 bug 。

【问题复现】

问题主要出在 Load 过程中，从文件读取数据的时候，
直接使用 fread 的去操作 string 的内部指针地址 `(char*)s.c_str()` 。
简化后的示例代码如下（[testdata1]文件内容是12345）：

```
void Load(string& s, size_t offset, size_t size) {
  s.resize(size);
  FILE* fp = fopen("testdata1", "r");
  assert(fp != NULL);
  fseek(fp, offset, SEEK_SET);
  fread((char*)s.c_str(), sizeof(char), size, fp);
  fclose(fp);
}
```

通过 `string::resize()` 分配内存空间。
通过 `string::c_str()` 直接获取内存空间的起始地址并写入数据。

这样的用法是典型的使用 string 当数据缓冲区的用法，
省去了 malloc(new) 和 free(delete) 的过程。
通常来讲不会遇到什么问题。

不过这次遇到问题了。

简化问题代码示例如下：

```
string s;
Load(s, 0, 3);
assert(s == "123"); // success

string s2 = s;
Load(s2, 1, 3);
assert(s2 == "234"); // success
assert(s == "123"); // failed
```

注: 因为 testdata1 文件内容是 12345 的纯文本文件。  
所以 `Load(s, 0, 3)` 内容就是 "123" ，依此类推。

但是当后面的 `string s2 = s;` 
定义了一个和 string 变量 s2 。
此时 Load(s2, 1, 3); 时 s2 内容是 "234" 符合预期。

但是问题出在之后 s 的内容也变成了 "234" ，
而不是保持原来的 "123" 。

【原因分析】

其实示例代码写成那样，问题也清楚了很多了，
问题就出在 

```
string s2 = s;
``` 

和之前 Load 函数中的 

```
fread((char*)s.c_str(), sizeof(char), size, fp);
```

也就是 string 的 copy-on-write 实现上。 

（之前的问题是隐藏在各种代码之间，甚至都很难定位到原来是 string 的问题。）

C++ stl::string 有两种常见的主流实现方式:

『eager-copy』

每个 string 都是一个独立申请的内存空间，每次拷贝都是深拷贝，
哪怕内容是一模一样的，
所以每个 string 的 `c_str()` 指针地址都是**不一样**的。 
这样的优点是内存空间互不干扰，
缺点是内存浪费。

『copy-on-write』

string 之间拷贝时不是深拷贝，只拷贝了指针，
也就是共享同一个字符串内容，
只有在内容被修改的时候，
才真正分配了新的内存并 copy 。
比如 `s[0]='1'` 之类的修改字符串内容的一些write操作，
就会申请新的内容，和之前的共享内存独立开。
所以称之为 『copy-on-write』

最显然的就是 `string s2 = s;` 拷贝后，
s 和 s2 的 `c_str()` 返回的指针地址是 **一样** 的。
这样的优点就是节省内存开销，
当string字符串占用内存较大时，
也可以省去深拷贝时较大的性能开销。

不同的stl标准库实现不同，
比如 Centos 6.5 默认的 stl::string 实现就是 『copy-on-write』，
而 Mac OS X (10.10.5) 实现就是 『eager-copy』。

而这次的 bug 就是和 『copy-on-write』有关，

因为 s2 和 s 的 `c_str()` 指针是同一个，
所以 Load 函数里面的这行代码：

```
fread((char*)s.c_str(), sizeof(char), size, fp);
```

我们以为只是在操作一个字符串，
其实是 s 和 s2 两个字符串的内容都被修改了。
所以就会导致一系列的问题。

完整示例代码请看 [stringload]

【总结】

总之，原因的源头在于 `(char*)s.c_str()` ，
虽然我在 StackOverFlow 上有些高票答案也经常使用类似的把 string 当成内存缓冲区的写法。
毕竟方便嘛。但是考虑到 stl 的 copy-on-write 实现，会导致把 stl 容器当内存缓冲区的写法变得有隐藏陷阱。

虽然我在解决这个 bug 之前就知道 stl 有 『copy-on-write』 实现这么一说。
但是开发时候往往出现问题的地方并不是直接在有问题的代码那里就出现问题，
导致很难查，更何况不知道 『copy-on-write』这回事的开发者，可能就容易踩大坑了。

[stringload]:https://github.com/yanyiwu/practice/blob/master/cpp/string/string_load.cpp
[testdata1]:https://github.com/yanyiwu/practice/blob/master/cpp/string/testdata1
