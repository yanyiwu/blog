---
layout: post
title:  "cmake常用指令学习手册"
date:   2014-03-12
categories: jekyll update
---

## 环境设置

* `PROJECT` 项目名称
* `CMAKE_MINIMUM_REQUIRED` 最低版本要求
* `EXECUTABLE_OUTPUT_PATH` 可执行文件的生成地址，可执行文件是通过 `ADD_EXECUTABLE`产生
* `LIBRARY_OUTPUT_PATH` 库文件的生成地址，库文件是通过 `ADD_LIBRARY`产生
* `ADD_SUBDIRECTORY` 添加子目录，实际效果就是会引用进该子目录下的`CMakeLists.txt`，所以`CMakeLists.txt`文件的分布是和目录结构一样的树状结构，`ADD_SUBDIRECTORY`就是这个树结构的边
* `PROJECT_BINARY_DIR` 运行`make`时的运行目录，一般都是在项目根目录下新建一个`build/`目录作为运行目录
* `PROJECT_SOURCE_DIR` 项目的源代码根目录，就是最上层`CMakeLists.txt`所在的目录


## 编译器相关

* `ADD_DEFINITIONS` 增加编译器选项
* `INCLUDE_DIRECTORIES` 包含的头文件目录
* `ADD_EXECUTABLE` 生成可执行文件
* `ADD_LIBRARY` 生成库文件，包括静态库和动态库
* `TARGET_LINK_LIBRARIES` 添加目标生成需要链接的库文件列表

## 测试相关

* `ENABLE_TESTING` 打开测试功能，也就是可以通过`make test`来进行测试了
* `ADD_TEST` 添加在测试中你需要运行的可执行文件，这样在`make test`时会自动执行你的可执行文件并判断是否运行正确


## 安装相关

* `CMAKE_INSTALL_PREFIX` 指定安装时是选哪个目录作为安装的根目录下，默认是`/usr/local/`
* `INTSALL` 用来指定`make install`时会进行的动作，一般是指定将生成的哪个可执行文件或者库文件已送到`CMAKE_INSTALL_PREFIX`这个目录下的指定子目录，可执行文件一般对应到`bin/`，库文件一般对应到`lib/`

## 有待完善的地方

* 可以 `make install` 但是不可以 `make uninstall`，`make uninstall`的替代方法是:`cat install_manifest.txt | xargs rm -rf`
