---
published: true
layout: post
title:  "WAND算法核心部分梳理"
date:   2014-08-18
category: work
---

# WAND算法核心部分梳理

## 背景

Wand(Weak And) 不是什么新颖的算法，几乎所有搜索方向的工程师都有所耳闻过。  
而且其对于长 query 的搜索速度提升显著且召回率高，在搜索和广告方向中有广泛的应用。  
但是现在网络上对于 Wand 算法的文档还是偏少，一般都是攻读 [Wand经典论文]来理解的。  
我也是如此，在此记录自己在应用中的一些实际理解和感悟。  

## 算法核心

Wand(Weak And) 算法的核心就是这个 next 函数的过程：  
（当然对于论文中的这个 next 函数伪代码在工程上有很大的优化空间，但是在此先照着论文的伪代码来理解。）

```
1. Function next(θ)
2.   repeat
3.     /* Sort the terms in non decreasing order of DID */
4.     sort(terms, posting)
5.     /* Find pivot term - the first one with accumulated UB ≥ θ */
6.     pTerm ← findPivotTerm(terms, θ)
7.     if (pTerm = null) return (NoMoreDocs)
8.     pivot ← posting[pTerm].DID
9.     if (pivot = lastID) return (NoMoreDocs)
10.    if (pivot ≤ curDoc)
11.        /* pivot has already been considered, advance one of the preceding terms */
12.        aterm ← pickTerm(terms[0..pTerm])
13.        posting[aterm] ← aterm.iterator.next(curDoc+1)
14.    else /* pivot > curDoc */
15.        if (posting[0].DID = pivot)
16.            /* Success, all terms preceding pTerm belong to the pivot */
17.            curDoc ← pivot
18.            return (curDoc, posting)
19.        else
20.            /* not enough mass yet on pivot, advance one of the preceding terms */
21.            aterm ← pickTerm(terms[0..pTerm])
22.            posting[aterm] ← aterm.iterator.next(pivot)
23.   end repeat
```

## 主要函数

【findPivotTerm】

找到中心轴，此函数过程其实就是累加有序的 terms 找到上限值（upper bound） 累加和 超过 θ 这个阈值的，将该 term 的位置返回给 pTerm 。

【pickTerm】

找出合适的 term，对此 term 进行 iterator.next 来迭代到更高的 dicid 。什么样才算合适？
论文中的说法是选择 IDF 值最高的 term。

【posting[aterm] ← aterm.iterator.next】

迭代器前进的，这个很关键，WAND 算法的高效原因就在乎算法过程中跳过了大量相关度不大的 doc 。  


## 三个分支

建议先理解分支2，再来理解分支1。

【分支1：算法第10行】

当 pivot <= curDoc 时，会进入本分支。  
本分支的含义是当 pivot 选择的 doc id <= curDoc 的话，就说明该 docid 已经被考虑过了。    
这里需要**注意**的是：**其实 pivot 不可能小于 curDoc** 。  

具体原因需要理解分支2  
在分支2中可以看出来，curDoc 的值其实是 pivot 给的，  
而且**当且仅当** pivot 的值等于 sort 后的 posting 里 docid 最小的那个 docid 值的时候，才赋值给 curDoc。
所以 curDoc 每次赋值都是当前posting 里面，最小的 docid 值。
因此**其实 pivot 不可能小于 curDoc** 。

在实践中也可以通过在本分支1中添加 `assert(pivot == curDoc);` 语句可以验证。

【分支2：算法第15行】：

只有当 pivot > curDoc 且 posting[0].DID == pivot 才会修改 curDoc 的值为 pivot 。  
（posting[0] 代表的是 sort 完之后排在第一个的 posting ）
并且将 curDoc 的值作为返回值 return 。  

这个过程非常重要，首先需要注意到的是 curDoc 的值只有在这个分支中，才会被修改。  
而且该修改只会使得 curDoc 是增加的（因为这个分支的条件是 pivot > curDoc）。
** 同时，只有在这个分支里面才会 return 有效的 docid 。**  该有效 docid  会在 WAND 检索的第二阶段被 Full Evaluated。     
所以这个分支非常重要，这个分支进来的越少，被 Full Evaluated 的 doc 越少，**检索的性能越高**。  

对于这里的 posting[0] 为什么要取0 要理解透彻。  
【这里的0代表的是从 posting[0 : pTerm] 范围内的所有 DID 都等于 pivot 的含义】。  
也就是这里体现了【Weak And】的思想，也就是只有满足这个条件，  
才说明了 pivot 这个 document 含有所有累加和超过阈值的 term ，所以该 pivot 才被选中并且返回。  

【分支3：算法第21行】

进入该分支的条件是： pivot > curDoc 而且 posting[0].DID != pivot （其实也就是 posting[0].DID < pivot）。    
而且根据分支1可以得出 posting[0].DID >= curDoc 恒成立。  
也就是说此时 curDoc <= posting[0].DID < pivot 。  


## 参数选择

最最关键的其实就是参数选择，因为对于不同的业务场景可以设定选择不同的属性作为算法的参数。  
详情就不细说了，在此聊聊论文里参数选择的思想把。  

在 Wand 的 Next 迭代过程中，最核心的函数其实在 findPivotTerm 这个函数。  
在该函数中，会累加每个 term 的【UpperBound】的值，直到【累加和】超过阈值 θ  。  

所以在此谈谈 【UpperBound】这个参数的来历：    
这个参数可以有几种设计的方法。  

【方法一】


```
UBt ≥ αt * max(w(t,d1),w(t,d2),...).



```


αt 代表的是 term 在 query 中出现的次数 乘以 term 的 idf 值。（所以这个是和 query 相关的，也就是 query-dependent ）  
w(t,d) 是 term 在 document 中出现的次数 除以 该 document 的长度。 （所以这个是和 document 相关的） 

该方法是非常精准的，没有任何召回率的损失，也就是正确答案肯定能被召回（无损），但是却不是**高效**的。  
论文中就举过对应的例子，因为上式中的 max 是取最大，在某些 term 中，如果该 term 只个特定的 document 里面极度频繁的出现。  
而在其他 document 中都是低频出现，则会导致该 term 的 UB 特别高，但是该 term 其实对于 大部分的 document 的贡献度都很低。  
因此导致该方法效率低下。    
这种 Wand 第一阶段（Next 函数过程）中召回，但是在第二阶段（Full Evaluation）被拒绝（没有进堆）的情况被称之为【false positive errors 】。  


【方法二】

```
UBt = C * αt
```

αt 和方法一的 αt 含义一样。
C 是常数。

注意到，上式和方法一的主要区别是，上式和 document  无关。  
也就是说对于所有的 document 一视同仁。 
这样的好处在于比方法一大大提高了**效率**。  
坏处是因为忽略掉 term 在 document 中的频率等信息，会造成某些我们期望的结果没有召回（有损）。  
即在 Wand 的第一阶段就没有召回，自然在第二阶段就不可能进堆了。  
这种有损的情况在论文中被称之为【false negative errors】。  

综上，【方法一】为了【无损】就只能牺牲效率，而【方法二】为了提高效率而导致【有损】
所以【方法二】式中的 C 就是为了调节【有损】的程度来提高效率的同时，又不会损失太多的召回。  

但是其实在论文中最后的方法就是【方法二】，【方法一】只是为了引出需要解决的问题。  
而在工程中，也是【方法二】实用，【方法一】的效率不可忍受，而【方法二】在非常微小的【有损】之下能做到比【方法一】提高起码一个数量级的速度。    
而且，需要重点强调的是，对于长 query，【方法二】的【有损】几乎根本察觉不到。  
为什么呢，因为对于【方法二】重点使用的是 idf 信息，而长 query 因为词语多，idf 信息【累加和】足够高。  
所以忽略 term 在 document 中的频率等信息造成的信息丢失，对【Wand 第一阶段】计算分数的影响已经可以忽略不计。  
所以也是为什么 Wand 在长 query 情景应用非常普遍的原因，既能提高性能，又几乎无损召回。  
可以说非常漂亮的解决了长 query 场景中耗时问题。  

## 总结

对于 Wand 算法刚开始的时候只是想当成 快速排序 之类的工具性算法来使用而已。  
但是使用过程中发现参数的选用和设计都有比较大的灵活调优空间，而调优需要对算法核心有较好的理解。  
往往经常在某些点上理解有偏差，会导致在调优方面的尝试做了不少无用功，并且还想不通为什么。  
所以写篇文章梳理一遍，查缺补漏，是为了更好的使用。  

## 参考

+ [Wand经典论文]

[Wand经典论文]:http://images.yanyiwu.com/4331f68fcd_wand.pdf
