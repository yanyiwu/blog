---
layout: post
title:  "gtest的使用和源码分析"
date:   2014-04-01
categories: jekyll update
---

本文基于`gtest-1.6.0`的源码版本。

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



```

Running main() from gtest_main.cc
[==========] Running 1 test from 1 test case.
[----------] Global test environment set-up.
[----------] 1 test from Test
[ RUN      ] Test.Case1
[       OK ] Test.Case1 (0 ms)
[----------] 1 test from Test (1 ms total)

[----------] Global test environment tear-down
[==========] 1 test from 1 test case ran. (5 ms total)
[  PASSED  ] 1 test.

```

## 
