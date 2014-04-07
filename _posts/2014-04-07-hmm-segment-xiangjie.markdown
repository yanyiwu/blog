---
layout: post
title:  "HMM模型在中文分词中的应用方法指南"
date:   2014-04-07
categories: jekyll update
---

## HMM模型

HMM(Hidden Markov Model): 隐式马尔科夫模型。

关于HMM模型的介绍，网上的资料已经烂大街，但是大部分都是在背书背公式，本文在此针对HMM模型在中文分词中的应用讲讲实现原理。
HMM模型可以应用在很多领域，所以它的模型参数描述一般都比较抽象，以下篇幅针对HMM的模型参数介绍直接使用它在中文分词中的实际含义来讲：

HMM典型介绍就是这个模型是一个五元组:

+ StatusSet: 状态值集合
+ ObservedSet: 观察值集合
+ TransProbMatrix: 转移概率矩阵
+ EmitProbMatrix:  发射概率矩阵
+ InitStatus:       初始状态分布

HMM模型可以用来解决三种问题：

1. 其它参数(StatusSet,TransProbMatrix,EmitRobMatrix,InitStatus)已知的情况下，求解**观察值序列**。(`Forward-backward`算法)
2. 其它参数(ObservedSet,TransProbMatrix,EmitRobMatrix,InitStatus)已知的情况下，求解**状态值序列**。(`viterbi`算法)
3. 其它参数(ObservedSet)已知的情况下，求解**(TransProbMatrix,EmitRobMatrix,InitStatus)**。(`Baum-Welch`算法)

其中，第三种问题最玄乎也最不常用，第二种问题最常用，**中文分词**，**新词发现**， **词性标注** 都有它的一席之地。所以本文主要介绍第二种问题，即**viterbi算法求解状态值序列**的方法。





## 客服

wuyanyi09@foxmail.com

