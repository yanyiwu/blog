---
published: false
layout: post
title:  "Thrift之TNonblockingServer源码分析"
date:   2014-12-04
category: work
---

最近在使用 [libevent] 开发项目，想起之前写 [Thrift源码剖析] 。
的时候说到关于 TNonblockingServer 以后会单独写一篇解析，
现在是时候了，就这篇了。

以下内容依然是基于 [thrift-0.9.0] 。

## 概述

Thrift 的 TNonblockingServer 实现代码挺干净的，
并没有用到什么奇淫巧计，核心就是使用 [libevent] 进行异步
驱动和状态的转换，只要有些 [libevent] 经验的人就很容易
能看懂。

## 事件注册

Thrift 使用 libevent 作为服务的事件驱动器，
libevent 其实就是 epoll 更高级的封装而已(在linux下是epoll)，
整个 TNonblockingServer 有三个关键的地方和libevent 有关。


第一个是服务的监听事件，也就是服务负责 listen 和 accept 的
主 socket ，如下。 

```
// Register the server event
event_set(&serverEvent_,
          listenSocket_,
          EV_READ | EV_PERSIST,
          TNonblockingIOThread::listenHandler,
          server_);
```

当新的连接请求进来的时候，TNonblockingIOThread::listenHandler 函数被
触发，在 TNonblockingIOThread::listenHandler 里主要负责 accept 新连接。

第二个是其

```
// Create an event to be notified when a task finishes
event_set(&notificationEvent_,
        getNotificationRecvFD(),
        EV_READ | EV_PERSIST,
        TNonblockingIOThread::notifyHandler,
        this);
```

第三个是每个连接的状态变化事件，

```
event_set(&event_, tSocket_->getSocketFD(), eventFlags_,
    TConnection::eventHandler, this);
```

void TNonblockingIOThread::registerEvents()


createNotificationPipe();


src/thrift/server/TNonblockingServer.cpp576
src/thrift/server/TNonblockingServer.cpp704
src/thrift/server/TNonblockingServer.cpp576
src/thrift/server/TNonblockingServer.cpp726
src/thrift/server/TNonblockingServer.cpp576
src/thrift/server/TNonblockingServer.cpp581
test1
src/thrift/server/TNonblockingServer.cpp576
src/thrift/server/TNonblockingServer.cpp651
src/thrift/server/TNonblockingServer.cpp576
src/thrift/server/TNonblockingServer.cpp688
src/thrift/server/TNonblockingServer.cpp704



APP_INIT
APP_READ_FRAME_SIZE
APP_READ_REQUEST

APP_WAIT_TASK
APP_SEND_RESULT
APP_INIT



```
    /*
     * Either notify the ioThread that is assigned this connection to
     * start processing, or if it is us, we'll just ask this
     * connection to do its initial state change here.
     *
     * (We need to avoid writing to our own notification pipe, to
     * avoid possible deadlocks if the pipe is full.)
     *
     * The IO thread #0 is the only one that handles these listen
     * events, so unless the connection has been assigned to thread #0
     * we know it's not on our thread.
     */
    if (clientConnection->getIOThreadNumber() == 0) {
      clientConnection->transition();
    } else {
      clientConnection->notifyIOThread();
    }
```



src/thrift/server/TNonblockingServer.cpp938TNonblockingServer::handleEvent
src/thrift/server/TNonblockingServer.cpp983Create a new TConnection for this client socket.
src/thrift/server/TNonblockingServer.cpp1008iothreadnumber = 0
src/thrift/server/TNonblockingServer.cpp707APP_INIT
src/thrift/server/TNonblockingServer.cpp489size known; now get the rest of the frame
src/thrift/server/TNonblockingServer.cpp729APP_READ_FRAME_SIZE
src/thrift/server/TNonblockingServer.cpp518 We are done reading, move onto the next state
src/thrift/server/TNonblockingServer.cpp584APP_READ_REQUEST
tests_server.skeleton.cpp31test1
src/thrift/server/TNonblockingServer.cpp1394notifyHandler
src/thrift/server/TNonblockingServer.cpp1408TNonblockingIOThread::notifyHandler
src/thrift/server/TNonblockingServer.cpp654APP_WAIT_TASK
src/thrift/server/TNonblockingServer.cpp558writeBufferPos_ done
src/thrift/server/TNonblockingServer.cpp691APP_SEND_RESULT
src/thrift/server/TNonblockingServer.cpp707APP_INIT

最后一次是主动从  APP_SEND_RESULT 状态跳进 APP_INIT

状态的说明

```
/**
 * Five states for the nonblocking server:
 *  1) initialize
 *  2) read 4 byte frame size
 *  3) read frame of data
 *  4) send back data (if any)
 *  5) force immediate connection close
 */
enum TAppState {
  APP_INIT,
  APP_READ_FRAME_SIZE,
  APP_READ_REQUEST,
  APP_WAIT_TASK,
  APP_SEND_RESULT,
  APP_CLOSE_CONNECTION
};
```


代表 enum TAppState 的变量是appState_ ， 属于
class TNonblockingServer::TConnection 的私有变量：

/**
 * Represents a connection that is handled via libevent. This connection
 * essentially encapsulates a socket that has some associated libevent state.
 */
class TNonblockingServer::TConnection


/// Three states for sockets: recv frame size, recv data, and send mode
enum TSocketState {
  SOCKET_RECV_FRAMING,
  SOCKET_RECV,
  SOCKET_SEND
};



src/thrift/server/TNonblockingServer.cpp942TNonblockingServer::handleEvent
src/thrift/server/TNonblockingServer.cpp987Create a new TConnection for this client socket.
src/thrift/server/TNonblockingServer.cpp1012iothreadnumber = 0
src/thrift/server/TNonblockingServer.cpp711APP_INIT
src/thrift/server/TNonblockingServer.cpp440TNonblockingServer::TConnection::workSocket()
src/thrift/server/TNonblockingServer.cpp446SOCKET_RECV_FRAMING
src/thrift/server/TNonblockingServer.cpp491size known; now get the rest of the frame
src/thrift/server/TNonblockingServer.cpp733APP_READ_FRAME_SIZE
src/thrift/server/TNonblockingServer.cpp440TNonblockingServer::TConnection::workSocket()
src/thrift/server/TNonblockingServer.cpp496SOCKET_RECV
src/thrift/server/TNonblockingServer.cpp521 We are done reading, move onto the next state
src/thrift/server/TNonblockingServer.cpp588APP_READ_REQUEST
tests_server.skeleton.cpp31test1
src/thrift/server/TNonblockingServer.cpp1398notifyHandler
src/thrift/server/TNonblockingServer.cpp1412TNonblockingIOThread::notifyHandler
src/thrift/server/TNonblockingServer.cpp658APP_WAIT_TASK
src/thrift/server/TNonblockingServer.cpp440TNonblockingServer::TConnection::workSocket()
src/thrift/server/TNonblockingServer.cpp533SOCKET_SEND
src/thrift/server/TNonblockingServer.cpp562writeBufferPos_ done
src/thrift/server/TNonblockingServer.cpp695APP_SEND_RESULT
src/thrift/server/TNonblockingServer.cpp711APP_INIT
src/thrift/server/TNonblockingServer.cpp440TNonblockingServer::TConnection::workSocket()
src/thrift/server/TNonblockingServer.cpp446SOCKET_RECV_FRAMING


链接









## 总结

Thrift 的 TNonblockingServer 注释很丰富，原理清晰。
个人认为基本上是事件驱动服务器的教科书了，
其实核心在于状态转移，因为事件驱动的原因，每次转换
事件我们都需要保存当前的状态。


[thrift-0.9.0]:http://archive.apache.org/dist/thrift/0.9.0/thrift-0.9.0.tar.gz
[libevent]:
[Thrift源码剖析]:
