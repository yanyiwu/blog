---
layout: post
title:  "Node.js的C++扩展初体验之NodeJieba"
date:   2014-02-22
category: work
---

<center>        
<img src="http://images.yanyiwu.com/NodeJiebaLogo-v1.png" class="photo", style="width:60%"></img>      
</center>        

故事要从[NodeJieba]说起，身为Node初学者，有一定的Cpp基础，又得知Node是Cpp写的，自然是根本把持不住，想来一发Node的Cpp扩展，没想到一切进展顺利，参考了几个`helloworld`就写好了。并且已发布在npm上。详见[NodeJieba]

本博文基于NodeJieba v0.1.1

## 目录脉络

```
|- src/
    |- segment.cpp
    |- CppJieba/ 
|- dict/
|- test/
|- binding.gyp
|- package.json
|- index.js
```

## 代码详解

### binding.gyp

在写node的c++ addon时，因为node是使用[gyp]作为项目管理工具。所以我们写addon时当然也是要跟着使用gyp来构建，不过gyp也足够简单，从binding.gyp这个文件内容就可以看出：

```
{
        "targets": [
        {
            "target_name": "segment",
            "sources": [ "./src/segment.cpp" ],
            "cflags": [
                "-std=c++0x", "-DLOGGER_LEVEL=LL_WARN"
                ]
        }
    ]
}
```

* target_name: 生成的addon插件的名字，比如本项目`node-gyp configure build`生成的是 `build/Release/segment.node`。
* sources: 源代码们，注意到这里只有一个`./src/segement.cpp`，是因为[CppJieba]这个库全都是hpp文件，在`segment.cpp`里面`include`即可。
* cflags: 编译选项，这个是可选项。

### package.json

这个就没什么特别的了，和其他node项目没什么两样。


### index.js

这个就是`package.json`里面写明的`main`。也就是本模块的入口。

其实就两行如下：

```js
var segment = require("./build/Release/segment");
module.exports = segment;
```

这个文件的功能其实就是将 "./build/Release/segment.node" 这个文件加载进来。
然后外部调用就直接`var nodejieba = require("nodejieba");`即可。

### src/segment.cpp

#### 包含头文件

```
#include <node.h>
#include <v8.h>
```

既然是写扩展，免不了要照着node源码的框架写。主要和node源码相关的是v8引擎（因为要让自己写的c++扩展让js来调用），所以有如上两行。

#### 模块的包装

`NODE_MODULE(segment, init)`

就是将`init`函数作为本`segment`模块被`require`时的初始化函数。

#### init函数

```cpp
void init(Handle<Object> exports) {
    exports->Set(String::NewSymbol("loadDict"),
                FunctionTemplate::New(loadDict)->GetFunction());
    exports->Set(String::NewSymbol("cut"),
                FunctionTemplate::New(cut)->GetFunction());
}
```

可以看出其实init就是在往exports这个Handle里面注册函数，分别注册了函数loadDict和cut。


#### 写addon的时候需要理解v8里面的几个概念:

* Handle : 其实就是句柄，句柄指向的对象都是在heap上。这个句柄会自动管理内容，也就是会自己进行垃圾回收。这个很好理解，因为js任何变量都是引用，当变量没有被引用时会被自动垃圾回收。
* HandleScope : 其实就是Handle的作用域，也可以理解为Handle的容器，有时候Handle一个一个析构太麻烦，直接析构掉HandleScope，HandleScope里面的Handle也就都跟着析构了。
* String: v8中基础的数据结构也都是自己写的，没有使用std（在讲究性能的开源项目里，基本上都不会使用std里面的数据结构，std里面的数据结构是模板，效率不高）。这里就是现用现谷歌了，没什么好说的。

理解了上面的概念之后看`src/segment.cpp`就一览无遗了。

## 参考

[v8HandleScope]


[NodeJieba]:https://github.com/yanyiwu/nodejieba
[CppJieba]:https://github.com/yanyiwu/cppjieba
[gyp]:http://en.wikipedia.org/wiki/Generate_Your_Projects
[v8HandleScope]:http://blog.csdn.net/feiyinzilgd/article/details/8249180

