---
layout: post
title:  "C++11特性学习笔记"
date:   2014-01-16
categories: jekyll update
---

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


## 参考

http://blog.jobbole.com/55063/
