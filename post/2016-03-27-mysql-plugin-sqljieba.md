---
published: true
layout: post
title: MySQL中文分词插件SqlJieba
date: 2016-03-27
category: work
---

# MySQL中文分词插件SqlJieba

<center>        
<img src="http://images.yanyiwu.com/sqljieba.jpg" class="photo", style="width:60%"></img>      
</center>        

『关键词』

MySQL, 插件(Plugin), 中文分词, 结巴分词(Jieba), 全文检索(Full-Text), SqlJieba

『需求背景』  
  
之前也老有人问我啥时候能搞一个MySQL中文分词插件。  
无奈自己对MySQL插件开发实在不熟悉，再加上感觉这种插件的需求量并不大，所以迟迟没有抽出时间开发。  
直到十来天前的 [cppjieba] 一个 [issue-58] 把MySQL插件开发的文档和版本都推荐给我了。  
所以那个 [issue-58] 成了我铁心要把这个MySQL中文分词插件 Finished 掉的最后一根稻草。  
到今天总算是把 [SqlJieba] 撸出来了。  
  
『开发体验』  
  
以前觉得搞一些名牌开源项目的插件开发是一个很日天的技术活。  
但是结合之前搞Nginx中文分词插件 [ngx\_http\_cppjieba\_module] 和现在这个MySQL中文分词插件 [SqlJieba] 的经历来看。  
感觉这玩意的工作量倒不是技术难度，而是熟悉程度。  
搞人家项目的插件开发就得熟悉人家项目的文档，给的接口函数，  
还得搭建人家的开发环境，这些说实话挺繁琐的。  
大部分时间都是耗这上面了。  
让我想起在学校做单片机编程的实验的时候，  
搞软件编程是『面向对象编程』；  
搞单片机编程是『面向芯片说明书编程』，看着说明书写代码。  
  
『欢迎反馈』  
  
不过 Anyway, 总算撸通了整个插件的开发和安装过程。还是很『一颗赛艇』的。  
So, 具体使用说明之前的也在 [SqlJieba] 的 README.md 里面尽可能详细的阐述了。   
希望对MySQL分词有需求的朋友能试试 [SqlJieba]，欢迎反馈。  
  
[ngx\_http\_cppjieba\_module]:https://github.com/yanyiwu/ngx_http_cppjieba_module
[pg\_jieba]:https://github.com/jaiminpan/pg_jieba
[cppjieba]:https://github.com/yanyiwu/cppjieba
[issue-58]:https://github.com/yanyiwu/cppjieba/issues/58
[SqlJieba]:https://github.com/yanyiwu/sqljieba
