---  
published: true  
layout: post  
title: bleve中文分词插件之gojieba 
date: 2016-04-04  
category: work  
---  
  
<center>
<img src="http://images.yanyiwu.com/bleve-gojieba-logo.png" class="photo", style="width:80%"></img>
</center>
  
『Go语言开发的搜索引擎[bleve]』  
  
先安利一个Go语言开发的搜索引擎 [bleve] ，  
目前看来这应该是 Go语言开发的搜索引擎里面最有潜力，  
或者说最不像玩具的搜索引擎。  
  
简单试用了一下体验还可以，  
并试探性的提了一个关于打版本标签的 issue ，  
作者的回复响应速度也很快。  
网上搜的资料上显示 [bleve] 是由 CouchBase 团队打造出来的。  
但是我比较不理解的是为什么看了一下代码提交的commit ，  
主要都是由作者一个人提交的代码。  
这个比较费解。  
不过Anyway，这个项目对于Go社区来说是个好消息。  
也希望这个项目能发展越来越好，我也已经Watch了 [bleve] ,  
希望之后能有所贡献。  
  
『转入正题』  
  
有朋友在 [gojieba] 的 issue 里面提到希望把 [gojieba] 集成到 [bleve] 中作为中文分词的插件。  
所以趁这个清明假期把 [gojieba/bleve] 模块完成了。  
具体的用法非常简单明了，在 [gojieba] 的 README.md 里面有说明。  
  
[bleve] 的插件模块支持的很好，很容易就无缝集成进去。  
而且很灵活，主要是两个主要的模块 Tokenizer, Analyzer .  
前者是后者的子集。  
前者负责分词，但是其实搜索引擎分词其实其中的一个重要环节而已。  
去停用词，大小写转换等，分词前分词后，都有不少功夫需要做。  
目前的 [gojieba/bleve] 只是最简单的 Analyzer ，  
分词也是使用了最简单的最大概率法，后面应该会改进成 CutForSearch 模式，进行更细粒度的分词提高召回率。  
后续还有很多调优。  
  
与此同时，也写了一个使用 [bleve] 和 [gojieba] 对 jekyll 博文进行索引和搜索的示例代码： [blogsearch]   
很轻松就跑起来了。  
当然目前的代码都很 rush 很粗糙，  
但是或许之后在空闲的时间会针对博客系统做搜索引擎的集成，  
起码在我的博客 [yanyiwu.com] 里面可以试试。  
  
『附注』  
  
+ 本文所述基于 [gojieba] v0.12.0 版本  
  
[gojieba]:https://github.com/yanyiwu/gojieba  
[bleve]:https://github.com/blevesearch/bleve  
[gojieba/bleve]:https://github.com/yanyiwu/gojieba/tree/master/bleve  
[blogsearch]:https://github.com/yanyiwu/practice/tree/master/go/bleve/jekyllsearch  
[yanyiwu.com]:http://yanyiwu.com  
