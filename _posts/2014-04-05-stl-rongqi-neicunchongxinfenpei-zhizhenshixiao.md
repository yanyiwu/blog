---
published: false
layout: post
title:  "stl容器内存重新分配导致的指针失效"
date:   2014-04-05
category: work
---

看到标题应该就可以猜到大概是哪类问题了，但是这是开发中遇到的bug，集成在项目中，发生错误时并不是那么好查。
查完在此简化了问题背景，阐述如下：

## 背景简化

有一个结构体Item如下:

```
struct Item
{
    size_t size;
    double point;
};
```

现在需要针对该Item的数组`vector<Item> vec`建索引(索引的key是`Item.size`)。
数组小，查询效率要求也不高，在此使用`map<size_t, const Item*> mp`作为索引结构。

加载vec和建立索引mp的代码如下：

```
vector<Item> vec;
map<size_t, const Item *> mp;
size_t count = 102400;

Item item;
for(size_t i = 0 ; i < count; i ++)
{
    item.size = i;
    item.point = i * 100.0;
    vec.push_back(item);
    mp[item.size] = & vec.back(); // notice here
}
```

然后你会发现在使用mp的时候会**coredump**。

## 问题所在

在此需要对stl容器的实现有所基础，看过`<<tl源码剖析>>`的人都知道，对于`vector`这类stl容器，都会使用自己的内存分配器，所以我们在大部分情况下不需要关心vector的内存分配，可以尽情的`push_back`。

不过在此需要回顾一下vector的内存分配：vector在初始化的时候会先预定好固定大小的内存空间，直到你的`push_back`导致空间不够了，vector会自动去调用内存分配器`allocator`分配一段新的空间来使用，**注意**，像`vector`这类支持随机访问的顺序容器(`sequential container`)，新分配来的空间不是直接接在旧空间的末尾(这是和`deque`的关键区别，所以`deque`在前后插入元素的效率比`vector`高)，而是将旧内存空间的元素拷贝到新的内存空间，然后将旧的空间释放掉。

所以，如`mp[item.size] = & vec.back();`这样的代码，会发生不可预期的错误，直接表现为`core dump`。

正确的写法应该为:

```
vector<Item> vec;
map<size_t, const Item *> mp;
size_t count = 102400;

Item item;
for(size_t i = 0 ; i < count; i ++)
{
    item.size = i;
    item.point = i * 100.0;
    vec.push_back(item);
}

//等到vec初始化完毕了，再遍历一遍建mp。
for(size_t i = 0 ; i < count; i++)
{
    mp[vec[i].size] = &vec[i];
}
```

## 总结

这种问题并不一定是没有stl基础才会导致的问题，往往是写代码的时候脑子没有多一条筋深思一下可能潜在的问题。
而`C/C++`的指针本身确实又是既好用又复杂的技巧，只能说是以后与指针有关的代码都需要多留点心思来思考。

想起一位`C/C++`大师讲过的话:"**指针本质上是哲学问题**"。

在使用指针的时候，我们常常很自信的觉得指向的东西就在那，但是实际上指向的东西往往就不在那。往往会犯**刻舟求剑**的错误。


## 客服

wuyanyi09 at. foxmail.com

