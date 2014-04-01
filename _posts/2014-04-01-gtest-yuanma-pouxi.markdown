---
layout: post
title:  "gtest的使用和源码分析"
date:   2014-04-01
categories: jekyll update
---

本文基于`gtest-1.6.0`的源码版本，且示例源码可以在[gtest-example]里找到。

## 项目结构

```
gtest-1.6.0
|- include 
    |- gtest
        |- gtest.h 
        |- *
|- src 
    |- gtest-all.cc
    |- gtest-main.cc
    |- *
```

项目结构很简单，上面列出的是关键的文件，其余的文件用星号代替了。

整个项目的入口`main`在`src/gtest-main.cc`里面。
不过`src/gtest-main.cc`这个文件源码又及其简单，如下所示：

```cpp
#include <iostream>

#include "gtest/gtest.h"

GTEST_API_ int main(int argc, char **argv) {
  std::cout << "Running main() from gtest_main.cc\n";
  testing::InitGoogleTest(&argc, argv);
  return RUN_ALL_TESTS();
}
```

其中，可以看到头文件只包含了`gtest/gtest.h`，同时看`gtest/gtest.h`的源码可知，包含头文件只需要包含这个文件就足够了，因为在这个文件里面已经`include`其他头文件了。

## 使用示范

详细使用示范的源码在[gtest-example]。

在此主要看`TFoo.cpp`文件如下：

```cpp
//TFoo.cpp
#include "gtest/gtest.h"

TEST(FooTest, Case1)
{
    ASSERT_EQ(1, 1);
    ASSERT_NE(1, 2);
}
```

这里的`TEST`,`ASSERT_EQ`,`ASSERT_NE`都是gtest里面的宏。

注意到，在gtest的使用中，我们只需要写一些带有TEST宏的文件，然后编译的时候和gtest的源代码一起编译在一起即可，我们无须修改`gtest_main.cc`里`main`函数的任何内容，gtest的main函数就自动能察觉我们写的TEST。这似乎很神奇？请看下文分析。

## 源码分析

带着上面说的问题(main自动察觉)看了一下源码。

主要核心在于TEST这个宏，追溯TEST这个宏定义之后可以发现，这个TEST其实是一个类定义。
而且在这个类定义调用了`MakeAndRegisterTestInfo`这个函数(见源码`gtest-1.6.0/include/gtest/internal/gtest-internal.h`的1217行)。

查看`MakeAndRegisterTestInfo`函数的定义可知，此函数将会`new`出一个类的实例。
并将该类实例通过`GetUnitTestImpl()->AddTestInfo`添加到一个`vector(test_info_list_)`里面。
此`vector(test_info_list_)`是TestCase类里面的成员变量。
其中有一个关键的信息在于，gtest的源码里面定义了一些**单例对象**，这些单例是定义在函数里的static变量(也就是`<<effective c++>>`里面强调的static用法:`local static`)。

**所以实际上当你在各种使用TEST宏的时候，你同时也在`new`出对象且将它add进那些gtest定义的单例对象里面。**

所以在`gtest_main.cc`里面只需要遍历这些单例里面存在的Test对象来进行调用即可。所以上文所好奇的问题也就一目了然了。

## 总结

gtest用了有一段时间了，也是最近有空才琢磨源码看看具体的内部实现，而且带着问题看源码总是能学到不少技巧。

## 客服

wuyanyi09@foxmail.com

[gtest-example]:https://github.com/aszxqw/gtest-example.git
