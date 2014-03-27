---
layout: post
title:  "C++中unordered_map的版本兼容性问题"
date:   2014-03-27
categories: jekyll update
---

## 背景

在C++中最让我蛋疼的事情之一就是`unordered_map`千呼万唤才出来，在C++早期版本标准库里面只有`map`这个字典。
但是`map`的内部实现是采用的红黑树，众所周知，对于字典这类结构也可以用hash表来实现，也就是C++的标准库应该也要有`hash_map`这种数据结构。

* 红黑树实现的map占用内存较小，但是查找效率不高，O(logn)的查找效率。
* hash表实现的map占用内存较大，但是查找效率高，往往可以逼近O(1)的惊人查找效率。

在C++中关于map的hash表方法的实现是`unordered_map`这个数据结构，首次出现应该是在`C++98`那个年代的`tr1`这个命名空间里面出现。
使用方法写起来比较啰嗦。

```cpp
#include <tr1/unordered_map>
using std::tr1::unordered_map;
```

我认为像`unordered_map`这个数据结构差不多就是C++程序员的柴米油盐，生活必需品。
但是由于C++标准委员会的懒散，硬生生是拖到`c++0x/c++11`标准才把`unordered_map`纳入std标准。
也就是只有在支持`-std=c++0x`甚至`-std=c++11`的编译器里(对于g++来说大概是`g++4.4`这个版本以上的才开始支持)，才可以用如下代码使用`unordered_map`：

```cpp
#include <unordered_map>
using std::unordered_map;
```

假设如果全世界所有的g++都已经是4.4版本以上了，那使用`unordered_map`就不再有任何问题，但是现实是残酷的，总会在世界某些角落的服务器，
仍然在使用`g++-4.1.x`，而且对于这些服务器来说升级g++还麻烦得很。所有我们的程序就要考虑对于低级版本的__兼容__ 。

## 解决方法

```cpp
#if(__cplusplus == 201103L)
#include <unordered_map>
#include <unordered_set>
#else
#include <tr1/unordered_map>
#include <tr1/unordered_set>
namespace std
{
    using std::tr1::unordered_map;
    using std::tr1::unordered_set;
}
#endif
```

这个解决方法主要是依靠`__cplusplus`这个宏在不同C++版本中的值不同。
对于(能够使用且)使用了`-std=c++0x`或者`-std=c++11`编译选项的编译过程，`__cplusplus`的值是`201103L`，否则则是其他值。

## 结论

上述方法最低大概只能支持到C++98这个标准了，因为到了C++98才开始有`tr1/unordered_map`，所以你的编译器如果连`C++98`都不支持的话，那就乖乖用远古时代流传至今的`map`吧。
