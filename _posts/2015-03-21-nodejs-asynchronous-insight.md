---
published: true
layout: post
title:  "由NodeJieba谈谈Node.js异步实现"
date:   2015-03-21
category: work
---

有些人刚接触 Node.js 的时候，
都会以为异步是多么高深莫测的技术。
所以在此结合 [NodeJieba] 代码(加上详细注释)说说 Node.js 异步实现原理，
你就会发现异步其实原理很通俗易懂。

示例代码来自 [mix\_segment.cpp] 和 [mix\_segment.h] 。

在 [NodeJieba] 里面有个异步调用函数 `cut(arg1, arg2)` ，
arg1 是一个待切词的字符串，arg2 就是切完词后调用的回调函数。

```
NAN_METHOD (cut) {
    NanScope(); // 不用管这行
    if (args.Length() == 2){ // 检查参数个数是否正确。
        string inputStr = ValueToString(args[0]); // 参数1是是待切词的字符串
        Local<Function> callback = args[1].As<Function>(); // 参数2是回调函数

        NanCallback* nanCallback = new NanCallback(callback); // 格式转换，不用管。

        // 重点是以下两行，下文详细分析。
        CutWorker* worker = new CutWorker(nanCallback, inputStr); 
        NanAsyncQueueWorker(worker); 
    }
    else {
        NanThrowTypeError("argc must equals to 2");
    }
    NanReturnUndefined();
}
```

整个过程的重点是以下两行：

```
CutWorker* worker = new CutWorker(nanCallback, inputStr); 
NanAsyncQueueWorker(worker); 
```

先说说 CutWorker 是什么？以下是 CutWorker 的类定义

```
class CutWorker : public NanAsyncWorker {
    public:
        // 注意到构造函数主要初始化两个私有参数。
        CutWorker(NanCallback *callback, const string& s) 
            : NanAsyncWorker(callback), inputStr(s) {}

        ~CutWorker() {}


        // 真正的执行函数
        void Execute () {
            segment.cut(inputStr, outputWords);
        }

        // 当 Execute 被执行之后，
        // HandleOKCallback 会被自动调用。
        void HandleOKCallback () {
            NanScope();
            Local<Value> args[1];
            Local<Array> wordList;
            WrapVector(outputWords, wordList);
            args[0] = wordList;
            callback->Call(1, args);
        }

    private:
        // 注意，这两个私有参数不能是引用类型。
        string inputStr;
        vector<string> outputWords;
};
```

CutWorker 的定义非常简单，核心函数就是两个，
Execute 和 HandleOKCallback 。
然后再返回看刚才那两句代码：

```
CutWorker* worker = new CutWorker(nanCallback, inputStr); 
NanAsyncQueueWorker(worker); 
```

CutWorker 被初始化后，只是被扔进 NanAsyncQueueWorker 之后就不管了。
而实际上发生的时候是，很一个后台线程，
一直在等待 NanAsyncQueueWorker 这个队列。
当队列有 Worker 被 Push 进去的时候，
后台线程则会将 Worker 从队列中 Pop 出来，
然后先后调用 Execute 和 HandleOKCallback 这两个函数。
(这里说的先后只是顺序，不一定紧挨着，
具体得看 Node.js 后台线程的源码实现。）

所以在 Execute 函数里面写上真正的切词过程。
切词的结果存在 CutWorker 的私有变量 outputWords 里面。
然后在 HandleOKCallback 执行回调函数，
将私有变量 outputWords 作为回调函数的参数。

这样的过程就实现了在调用 cut 函数的时候，
是异步非阻塞的，
因为调用过程中只是将参数暂存在 CutWorker 这个类的私有变量成员里。
实际的执行过程是在后台线程中执行。
所以主线程是非阻塞的，
而后台线程是阻塞型的，当队列为空的时候，后台线程一直阻塞等待。

【还有一个有助于理解异步的问题】

Q: 为什么 CutWorker 的两个私有参数不能是引用类型。
A: 因为这两个私有参数是在构造函数被调用的时候被初始化的，
在 CutWorker 被构造的时候，
传入参数有可能是一个栈上的临时变量。
而且 CutWorker 的私有参数其实在整个异步调用过程中，
是作为状态保持者：
待分词的句子，分词后的结果，都是存在私有变量中。
所以只要这个 CutWorker 没有被析构。这些状态就一直被保持者。
才能做到无论何时这个 CutWorker 被后台线程执行。
都能保证参数有效。
哪怕这些参数在主线程里面早就被析构了。

其实写过线程池的人就一眼就看明白了，线程池也是类似这样的原因 。
都是需要使用 Worker 类的私有成员变量来保持着当时传入的参数。

【总结】

其实异步的实现原理非常的简单，
但是总是会有一些不明真相的人觉得异步是多么高深的技术，
然后不明觉厉，而且如教徒般迷信异步。
其实说白了就是两个核心问题：

+ 一是状态的保持，
+ 二是后台线程对任务队列的悄悄执行。

[NodeJieba]:http://github.com/yanyiwu/nodejieba
[mix\_segment.cpp]:https://github.com/yanyiwu/nodejieba/blob/master/src/mix_segment.cpp
[mix\_segment.h]:https://github.com/yanyiwu/nodejieba/blob/master/src/mix_segment.h
