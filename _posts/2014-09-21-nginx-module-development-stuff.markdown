---
published: true
layout: post
title:  "Nginx模块开发的那些事"
date:   2014-09-21
category: work
---

Nginx 太强大太流行，以至于在工作中总免不了需要和它打交道。
甚至需要开发和定制相应的 Nginx 模块满足业务需求。
所以在此讲几个 Nginx 模块开发前所需的基础知识。
即使是对于一个新手来说，得知这些也已经会让其 Nginx 的模块开发过程非常顺利。

## 1. 【Nginx 为每个连接分配一个内存池】

在带有 `ngx_http_request_t * r ` 参数的函数里面，你可以经常看到 `ngx_palloc(r->pool, …)`  之类的内存分配，
通过 `ngx_palloc` 分配出来的内存不需要手动回收。
因为该 `r->pool` 这个内存池是每个连接创建一个内存池。
当该连接断开的时候，该内存池会被整个释放掉。所以不需要担心内存泄露的问题。

## 2. 【Nginx 模块开发中利用 Linux 的 COW (Copy On Write) 机制】

关于 `Linux` 系统 进程 `fork` 出子进程时的 `Copy On Write` 机制，其实非常简单，就是父子进程共用同一个内存，
当需要对内存进行写的操作时，操作系统才会对该块内存进行复制。
这个在 Nginx 模块开发中也很重要，Nginx 的架构是 单个 master 进程带领 N 个 worker 进程。
当我们的模块需要初始化需要占用内存空间较大时（比如[ngx\_http\_cppjieba\_module]需要较大内存初始化分词所需的词库），而且该块内存只读不写。
所以我们可以在 master 进程 fork 出 worker 进程之前，将模块初始化，这样在 master fork worker 的时候，
worker 进程会继承 master 进程的内存。所以不论有多少个 worker 进程，使用的内存同样都是同一份内存。
这样就可以避免了多进程服务的内存浪费。

还有需要注意的是，当你用 `top` 等工具查看进程占用内存的时候，会显示 master 和 worker 都占用一样大的内存，
但是实际上 worker 占用的内存没有 `top` 等工具显示的那么大。所以不要慌，`top` 是会骗人的。


## 3. 【Nginx 的异步通信】

Nginx 是基于 Epoll 异步IO服务的服务器。而且 Nginx 将异步编程发挥得恰到好处。
这是因为考虑网络通信，对于很多种类型的服务器，性能瓶颈一般都没有出现在 CPU 上面。
而是在网络的通信上面，再具体点说，就是在 socket 的 recv 和 send 这两个过程上面。
在多线程的服务器中，一般是当服务器 socket accept 到一个新的客户端 socket 之后，
将该 socket 所需要的逻辑操作（包括 recv 和 send）都扔到一个单独的线程里面，一般是通过线程池来实现。
这样使得主线程只负责 accept，最大限度的响应请求。
但是这样的多线程服务模型最典型的问题就是，线程池是有线程数限制的，当并发量上去之后，线程不够用了。
主线程就从线程池获取可使用的线程这个过程会被阻塞，影响了程序的并发性能。

而 Nginx 这方面最大限度地榨干了异步编程的好处——非阻塞。
讲 socket 的 recv 和 send 都设置成非阻塞形势，并注册回调函数来异步地处理网络请求的每个阶段。
最典型的例子就拿 [ngx\_http\_cppjieba\_module] 模块开发中 HTTP 协议数据的解析过程来说，当客户端发送HTTP GET 请求过来的时候。
很简单，因为是 GET 请求。在模块开发中模块初始化的时候，就需要注册一个回调函数。
在本例中就是函数 `static ngx_int_t ngx_http_cppjieba_handler(ngx_http_request_t* r);` 
当这个函数被调用的时候，就是 Nginx 就收到了 HTTP 请求，并且 HTTP 的 header 数据已经被解析完毕的时候。
而 GET 请求通常是只需要 header 数据即可，不需要 body 数据。
所以当 GET 请求过来的时候，我们只需要在 `static ngx_int_t ngx_http_cppjieba_handler(ngx_http_request_t* r);`  函数中处理完数据，在函数结束前将结果发送给客户端即可，一般是通过 `ngx_http_output_filter(r, &out);`  这样的函数调用来结束 `ngx_http_cppjieba_handler` 。

但是处理 POST 请求时，不仅需要 HTTP 的 header，也需要 body 数据，
body 数据大小是通过 header 里面的 `content-length` 长度指定。
body 数据是异步收发，就是非阻塞的 recv 函数，当 Epoll 监听到 socket 是数据进来的时候，就调用 recv 函数去接收数据。
并将该数据累加起来，当累计的数据量大于等于 `content-length` 时，代表该请求的 body 数据已经被接收完毕。
所以在模块开发中，当我们需要完整的 body 数据时，我们需要注册一个回调函数 CallBackFunctForPost 来告诉 Nginx，
当 body 数据接收完毕之时，就是调用我 CallBackFunctForPost 之日。
在[ngx\_http\_cppjieba\_module]中，`static void ngx_http_cppjieba_post_handler(ngx_http_request_t* r);` 这个函数就是所需的这个 CallBackFunctForPost 。

```
if(r->method & NGX_HTTP_POST) {
    ngx_int_t rc = ngx_http_read_client_request_body(r, ngx_http_cppjieba_post_handler);
    if (rc >= NGX_HTTP_SPECIAL_RESPONSE) {
        return rc;
    }
    return NGX_DONE;
}
```

上述代码就是注册回调函数 `ngx_http_cppjieba_post_handler` 的代码过程。

## 4. 【POST 请求当 body 数据过大时会存储成临时文件】

Nginx 向来以省内存著名，对于 body 数据太大的时候，如果我们将这些数据存储在内存里面，很明显会经常造成内存不足的问题。
在 Nginx 中，当 body 长度大于 `client_max_body_size` 这个阈值时，会打开一个临时文件句柄，将接收到的 body 数据存储在该临时文件中。
这一点需要注意。


## 5. 【Nginx 的日志调试】

模块开发中免不了需要调试，个人认为打日志是最好的程序调试方式。
在 Nginx 中，因为讲究性能，打日志相对其他程序来说，要相对复杂一点。
不过在实际操作中，只需要知道如下几种常用日志方式即可。

```
ngx_log_error(NGX_LOG_ERR, r->connection->log, 0, “error info content”);
ngx_log_error(NGX_LOG_INFO, r->connection->log, 0, “error info content”);
ngx_log_error(NGX_LOG_NOTICE, r->connection->log, 0, “error info content");
```

并且将 Nginx 配置文件里面的

```
#error_log  logs/error.log  info;
```

前面的井号去掉。也就是讲日志级别降低到 info 这个级别。以方便看到更全面的日志信息。
从配置里面也可以看到，日志所在文件是 `logs/error.log` 。


## 参考资料：

http://www.serverphorums.com/read.php?5,79835

[ngx\_http\_cppjieba\_module]:http://github.com/aszxqw/ngx_http_cppjieba_module





