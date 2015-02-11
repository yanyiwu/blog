---
layout: post
title:  "短数组优化之LocalVector"
date:   2014-06-05
category: work
---

`vector` 是 `C++ STL` 里面最常用的容器，没有之一，`vector` 本质上是**动态**数组，它帮我们动态的管理内存。

但是需要注意的是，vector这个对象自身维护的内存是在**堆上**，这就涉及到**内存布局(memory layout)**的问题。

**内存布局的目的很简单，就是希望让程序的内存分布更加紧凑，从而提高系统cache的命中率，降低换页中断等耗时行为。**

而且不断的申请和释放堆空间，本身也是一个比较耗时的行为，特别是对于【短数组】(大小较小的数组)，我们可以利用栈空间对其进行优化。

## LocalVector原理

此 `LocalVector` 的主要原理是使得内存尽量存储在栈上而不是堆上。这是因为 `LocalVector` 这个类维护了一个【缓冲区数组】，当 `LocalVector` 的对象足够小的时候，使用该缓冲区数组即可，当对象大到超过缓冲区数组大小的时候，再申请和使用堆空间。

好处：

1. 当 `LocalVector` 对象不大时，可以省略向操作系统申请堆空间这个过程（当然，在STL里面有内存池的优化，很少直接向操作系统申请堆空间。）。
2. 使内存布局更紧凑。

总之，将 `LocalVector` 应用在所需数组比较短的情景下，是可以**显著**提高程序性能的。

## LocalVector代码详解

完整代码请见 [LocalVectorCodeUrl]

完成的代码看上去似乎很长，但是其实很关键的地方就是如下四个成员变量看懂了就明白了。

```
private:
    T _buffer[LOCAL_VECTOR_BUFFER_SIZE]; //栈上缓冲区
    T * _ptr; // 当数组较小时，_ptr指向_buffer，当较大时，_ptr指向malloc申请的空间。
    size_t _size; // 当前数组大小
    size_t _capacity; // 当前容量，刚开始_capacity == LOCAL_VECTOR_BUFFER_SIZE。
```

## 总结

LocalVector 是在 [CppJieba] 优化的时候尝试的方法之一，经尝试发现这样的办法简单实用，性能也有显著提高。

[LocalVectorCodeUrl]:https://github.com/yanyiwu/limonp/blob/master/include/LocalVector.hpp
[CppJieba]:https://github.com/yanyiwu/cppjieba.git
