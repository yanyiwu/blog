---
published: true
layout: post
title: 放弃screen,拥抱tmux
date: 2016-03-24
category: work
---

# 放弃screen,拥抱tmux

<center>        
<img src="http://images.yanyiwu.com/firehazard.jpg" class="photo"></img>      
</center>        

『故事背景』  
  
screen/tmux 是远程ssh session的管理工具。  
可以在server端帮你保存工作现场和恢复工作现场。  
最典型的应用场景就是，你每天下班关机器的时候，先保存现场(session)。  
然后第二天上班的时候再登录上去恢复现场(session) ，可以一下子就进入到之前的工作状态，  
比如当时正使用vim编写代码编写到第N行的状态。  
  
说起screen我是感情很深厚的，从我第一份实习去阿里云开始。  
刚入职的第一天学长（北邮亲学长，对我帮助很大，也算是我生命中遇到的贵人之一）  
传授给我一份screen配置，然后叫我开始养成使用screen在服务器上面开发的习惯。  
screen的配置文件我现在仍然沿用（在一些没有tmux的环境下），在我的[GitHub]上面的代码 [screenrc] 。  
受益良多。  
  
直到有一天在另一家公司听到同事推荐tmux更强大，  
刚好我又遇到在某台机器上面使用screen死活中文编码有问题的情况。  
就直接切换到tmux了，从screen切换到tmux几乎没有任何学习成本。  
同样也仿照 [screenrc] 配置文件的写法，配置了一下 [tmuxconf] 。  
然后就用得飞起了，同时也解决了中文编码显示的问题。  
沿用至今。  
  
『东窗事发』  
  
最近刚好一直在做上线前的联调测试各种跑测试。  
然后同事发现自己那部分的server在测试的时候会莫名其妙的hang住了。  
以前没有遇到过的，以为是新增加的逻辑导致的死锁之类的故障。  
后来发现是screen的锅。
  
『Bug复现』  
  
同事使用的就是在 screen 里面启动的服务，输出的日志没有重定向到文件。  
一些最简化的复现场景如下：     
比如ssh到远程的服务器上，在screen某一个窗口下运行如下的shell脚本  
  
```  
while (true)  
do  
    echo "github.com/yanyiwu"  
done  
```  
  
然后把本地机器的网线拔掉。  
然后等连接都断开之后，再把网线插上，再登录上去。  
会发现当时那个 screen session 的状态还是 Attached ，而不是正常的 Detached .  
然后再试图通过如下命令  
  
```  
screen -d -r <session-name>  
```   
  
已经无法重新恢复session了。  
在我们的测试中也就是表现为那个服务无法正常接收请求了。  
  
但是如果是在 tmux 中做同样的事情的话。  
就不会有hang住的问题，一切正常运行。  
也就不会出现最开始以为是服务代码问题的恐慌了。  
  
『最后』  
  
好吧有点标题党了，其实tmux还有其他一些不错的功能比screen好的。  
毕竟tmux是screen的增强版。  
虽然本文其实就是一次screen踩坑记录而已。  
但是我觉得还是有必要宣传一下tmux的，所以就把标题起得比较浮夸了。  

『题图』
  
还有就是配图是今天，准确的来说应该是昨天：
2016年3月23日，中关村南大街寰太大厦二楼一家饭店着火的图。  
当时我刚好就在15楼上班。  
狂奔下楼，所幸无任何人员伤亡。  
  
[screenrc]:https://github.com/yanyiwu/etc/blob/master/linux/.screenrc  
[tmuxconf]:https://github.com/yanyiwu/etc/blob/master/linux/.tmux.conf  
[GitHub]:https://github.conf/yanyiwu
