---
layout: post
title:  "C++11特性学习笔记"
date:   2014-01-16
categories: jekyll update
---

主要是按照参考文档的描述来学习的，本文的目的在于整理一下思路和个人觉得比较有感触的点。
保持未完待续的节奏，慢慢积累和在使用中完善。

## auto

其实就是类型自动推导，在泛型编程时候就有的老概念了。
`auto i = 1;`
编译器帮你识别出i是整型，在后面的for等新扩展时候都会用到。

## 自动调用迭代器的`for`

这个新for特别赞!

可以写一个很通用的print如下：

```cpp
#define print(x) for(auto y: x){cout<<y<<endl;} 
```

使用示例：

```cpp
const char *a[] = {"111", "222", "333"};
vector<string> b = {"111", "222", "333"}; // 这个也是新特性，后面会说。
print(a);//此时的a也被编译器自动识别出是可以迭代的类型，很赞。
print(b);
```

值得一提的是：

```cpp
for(auto & x : t)
{
    //当x前面多一个&时候，说明x是引用，可以通过给x赋值来修改t的值。
}
```

所以上面的print写成如下会更好：

```cpp
#define print(x) for(const auto & y: x){cout<<y<<endl;}
```

## 初始化列表

如下：

```cpp
vector<double> v = { 1, 2, 3.456, 99.99 };
   list<pair<string,string>> languages = {
       {"Nygaard","Simula"}, {"Richards","BCPL"}, {"Ritchie","C"}
   }; 
   map<vector<string>,vector<int>> years = {
       { {"Maurice","Vincent", "Wilkes"},{1913, 1945, 1951, 1967, 2000} },
       { {"Martin", "Ritchards"}, {1982, 2003, 2007} }, 
       { {"David", "John", "Wheeler"}, {1927, 1947, 1951, 2004} }
   };
```

一下子就pythonic起来了有木有。

详见文末的参考文档

## 右值引用和移动语义

## 参考文档

http://blog.jobbole.com/55063/
