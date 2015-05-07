---
published: true
layout: post
title:  "golang之http/FormValue踩坑记"
date:   2015-01-07
category: work
---

今天下午在试 [Weed-FS] 的 Collection 特性的时候，
发现了一个关于 FormValue 返回结果不符合预期的 bug ，
检查了一番，
才发现是因为没有正确使用导致的。
顺便为此提交了一个只包含一行代码 `r.ParseForm()` 的 [PullRequest] fix bug 。
真是【查bug千日，修bug一时】。。。

具体原因很简单，看下面这个示例代码就知道了：

## Bug 重现

```go
package main

import (
	"net/http"
)

func HelloServer1(w http.ResponseWriter, r *http.Request) {
	//r.ParseForm()
	val := r.FormValue("key")
	println("HelloServer1", val)
	w.Write([]byte(val))
}

func HelloServer2(w http.ResponseWriter, r *http.Request) {
	//r.ParseForm()
	_, fe := r.MultipartReader()
	if fe != nil {
		println("HelloServer2", fe)
		return
	}
	val := r.FormValue("key")
	println("HelloServer2", val)
	w.Write([]byte(val))
}
func HelloServer3(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	_, fe := r.MultipartReader()
	if fe != nil {
		println("HelloServer3", fe)
		return
	}
	val := r.FormValue("key")
	println("HelloServer3", val)
	w.Write([]byte(val))
}

func main() {
	http.HandleFunc("/hello1", HelloServer1)
	http.HandleFunc("/hello2", HelloServer2)
	http.HandleFunc("/hello3", HelloServer3)
	println("start ...")
	err := http.ListenAndServe(":8888", nil)
	if err != nil {
		println("error", err)
	}
}
```

三次POST请求的结果分别如下：

1. 返回结果正确

```
curl -F "name=yanyiwu" "localhost:8888/hello1?key=value1"
value1
```

虽然在调用 r.FormValue 之前没有调用过 r.ParseForm , 但是返回的结果正确。
因为在 r.FormValue 函数之内当 r.Form == nil 时会先调用 ParseMultipartForm 。

2. 返回结果错误

```
curl -F "name=yanyiwu" "localhost:8888/hello2?key=value2"

```

同样在调用 r.FormValue 之前没有调用过 r.ParseForm , 但是返回的结果错误。
是因为在 r.FormValue 之前调用了 r.MultipartReader , 
调用过 r.MultipartReader 的结果会导致在之后 r.FormValue 函数里面调用的
ParseMultipartForm 失败，
失败原因是导致一个 `http: multipart handled by MultipartReader` 的错误，
所以结果不符合预期。
具体原因可以看go源码里面的 `golang/go/src/net/http/request.go` 文件。

3. 返回结果正确

```
curl -F "name=yanyiwu" "localhost:8888/hello3?key=value3"
value3
```

因为增加了一行 `r.ParseForm()`，万事大吉。

## 解决方案

> 在调用 r.FormValue 之前记得 r.ParseForm 即可。

## go 的 net/http 源码还可以更完善一点

其实我个人看来，go源码里面 r.FormValue 函数里面调用 ParseMultipartForm
的时候，没有检查 ParseMultipartForm 的返回值 是不太完善的做法。
个人觉得应该检查返回值，虽然无法将错误返回（因为 r.FormValue 的返回值只有一个，是 string 类型），
但是可以将错误打印出来，以此提醒开发者。

专门 Fork 了一份 go源码，修改了后准备提交一个 pull request ，
才看到 golang/go GitHub 仓库的 pull request 列表里面赫然贴着一个不接受 `pull request` 形式的提交代码。
因此作罢。

[Weed-FS]:https://github.com/chrislusf/weed-fs
[PullRequest]:https://github.com/chrislusf/weed-fs/pull/45
