---
title: openeuler
tags: linux
description: ict培训linux
cover: https://images.wallpaperscraft.com/image/single/snowflake_winter_macro_98434_1280x720.jpg
swiper_index: 1
---





# openeuler1

安装配置不做记录，网上博客有

## 常见命令

### 命令语法格式

![image-20240330172007823](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240330172007823.png)<这个内容不可以省>

### 命令分类

![image-20240330172141445](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240330172141445.png)



### passwd

修改用户密码命令

### last

查看登录到系统的用户

### exit

退出命令

### reboot

重启命令

### poweroff

关机命令

### pwd

print working dir

打印当前工作目录

### cd

改变当前的工作目录

![image-20240330172802462](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240330172802462.png)

### ls

列出当前目录下的文件

![image-20240330172840797](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240330172840797.png)//-t是按照文件的修改时间先后列出，图片有误

### mkdir

创建文件夹

![image-20240330173025525](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240330173025525.png)

-p选项是迭代创建目录

### touch

- 创建空文件
- 修改文件时间戳（**access** **change** **modify**）

**modify是文件内容变换，change是文件属性变化，当Atime在Mtime和Ctime之前才会被修改**

![image-20240330173312612](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240330173312612.png)

### cp

复制文件

![image-20240330173345910](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240330173345910.png)

### mv

移动文件命令（当移动的目录不变时就是重命名操作）

### rm

最刑的命令（rm -rf/*）

![image-20240330173733120](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240330173733120.png)

### cat

读取文件内容，将文件合并

![image-20240330173840578](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240330173840578.png)

### head和tail

head显示文件前多少行内容，tail显示尾部多少行内容

选项-n

## 常见快捷键

### tab

可以双击tab键进行命令补齐，快速输入命令或者参数

### history

查看历史命令，可以用history n执行代码

### 上下键

快速翻阅历史命令

### home和end

将光标快速移动到行首和行尾

### clear与ctrl +l

清屏



## 文件结构

- **linux下所有都是文件**
- 树型结构，“/”为根目录

![image-20240330172613773](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240330172613773.png)



![image-20240330172629494](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240330172629494.png)

![image-20240330172639188](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240330172639188.png)



## 较为复杂命令

### more

按一页一页的显示文件内容，方便我们阅读，space控制下一篇，b上一篇，q退出

### 语法

- +n 从第n行开始显示
- -n 定义屏幕大小为n行
- +/pattern 搜索字符串
- -c 清屏





### less

与more类似，但more会加载整个文件，less不会

### 常见操作

- /字符串：向下搜索“字符串”的功能
- ？字符串：向上搜索‘’‘字符串’
- q退出less
- 空格 滚动一页()
- 回车 滚动一行

- [pagedown]： 向下翻动一页
- [pageup]： 向上翻动一页

### find

顾名思义就是找我们的文件

#### 语法

- -name 按文件名查找文件
- -perm 按照文件权限来查找文件 。
-  -user 按照文件属主来查找文件 。
- -mtime -n +n 按照文件的更改时间来查找文件



• 文件类型：
▫ d: 目录
▫ c: 字型装置文件
▫ b: 区块装置文件
▫ p: 具名贮列
▫ f: 一般文件
▫ l: 符号连

​	

### locate

快速查找文件系统中是否有指定的文件

**使用之前要进行安装**

```
sudo yum install mlocate
```

 -e 将排除在寻找的范围之外。
 -f 将特定的文件排除在外。
 -r 使用正规运算式做查找条件。
 -o 指定文件的名称。
 -d 指定文件的路径



### which

which用于搜索命令是工作在哪个文件附录下，例如which ls



which 命令用于快速地确定外部命令的绝对路径。
• 查找范例：
▫ which ls 查找ls 命令的绝对路径
▫ which -a ls 如果多个目录中都有匹配的文件，则全部显示
▫ which cp mv rm 查找多个文件



### gzip

文件压缩与解压缩的命令

 -d或--decompress或----uncompress 解开压缩文件。
 -f或--force 强行压缩文件，不理会文件名是否存在以及该文件是否为符号连接。
 -l或--list 列出压缩文件的相关信息。
 -r或--recursive 递归处理，将指定目录下的所有文件及子目录一并处理。
 -v或--verbose 显示指令执行过程。



### tar

将多个文件加装在同一个包中

#### 语法

语法：tar [OPTION...] [FILE]
 -c 建立新的压缩文件。
 -x 从压缩的文件中提取文件。
 -t 显示压缩文件的内容。
 -z 支持gzip解压文件。
 -j 支持bzip2解压文件。
 -v 显示操作过程。

#### 常用用法：

▫ tar cf ball.tar dir1 把目录dir1 及其下所有内容打包
▫ tar tf ball.tar 列出包中的内容
▫ tar xf ball.tar 把包中的内容解到当前目录
▫ tar czf ball.tar.gz dir1 打包然后用gzip压缩
▫ tar cjf ball.tar.bz2 dir1 打包然后用bzip2压缩
▫ tar cJf ball.tar.xz dir1 打包然后用xz压缩
▫ tar xf ball.tar -C /tmp 解到/tmp 目录下（默认在当前目录）
▫ tar xvf ball.tar -v 显示过程



### ln

- 用于创建链接文件，(软链接)可以理解成win的桌面上的快捷方式
- linux中有软链接和硬链接两种

![image-20240422213136994](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240422213136994.png)

**• ln的功能是为某一个文件在另外一个位置建立一个同步的链接.当我们需要在不同的目
录，用到相同的文件时，我们不需要在每一个需要的目录下都放一个必须相同的文件，
我们只要在某个固定的目录，放上该文件，然后在 其它的目录下用ln命令链接（link）
它就可以，不必重复的占用磁盘空间。**



#### 语法

**默认创建的是硬链接**

语法：ln [ -f | -n] [ -s ] SourceFile [ TargetFile ]
 -b 删除，覆盖以前建立的链接。
 -d 允许超级用户制作目录的硬链接。
 -f 强制执行。
 -i 交互模式，文件存在则提示用户是否覆盖。
 -n 把符号链接视为一般目录。
 -s 软链接(符号链接)



### man

what can i say!

类似于帮助手册



### help

命令打一半参数不会填怎么办？

快使用无敌的--help

ls --help



完

# openuler2

## 常见文本编辑器

Huawei Confidential5
Linux文本编辑器介绍
⚫ 文本编辑器是操作系统基础的功能软件之一。根据使用环境的不同，Linux的文本编
辑器有很多类型。
⚫ 常见的Linux文本编辑器有：
 emacs
 nano
 gedit
 kedit



## vim

### 关于vim你需要了解

 Vim是从vi发展出来的一个文本编辑器。其代码补完、编译及错误跳转等方便编程的功能特
别丰富，在程序员中被广泛使用。和Emacs并列成为类Unix系统用户最喜欢的编辑器。
⚫ Vim的第一个版本由布莱姆·米勒在1991年发布。最初的简称是Vi IMitation，随着功能的不
断增加，正式名称改成了Vi IMproved。现在是在开放源代码方式下发行的自由软件。
⚫ 从vi派生出来的Vim具有多种模式：
 基本模式：普通模式、插入模式、可视模式、选择模式、命令行模式、Ex模式
 派生模式：操作符等待模式、插入普通模式、插入可视模式、插入选择模式、替换模式
 其他：Evim
⚫ openEuler 20.03 LTS系统安装后默认没有安装vim，需要手动安装vim



基本模式
▫ 普通模式：在普通模式中，用的编辑器命令，比如移动光标，删除文本等等。
这也是Vim启动后的默认模式。这正好和许多新用户期待的操作方式相反（大
多数编辑器默认模式为插入模式）。Vim强大的编辑能力来自于其普通模式命
令。普通模式命令往往需要一个操作符结尾。例如普通模式命令"dd"删除当前
行，但是第一个"d"的后面可以跟另外的移动命令来代替第二个"d"，比如用移
动到下一行的"j"键就可以删除当前行和下一行。另外还可以指定命令重复次数，
"2dd"（重复"dd"两次），和"dj"的效果是一样的。用户学习了各种各样的文本
间移动／跳转的命令和其他的普通模式的编辑命令，并且能够灵活组合使用的
话，能够比那些没有模式的编辑器更加高效的进行文本编辑。在普通模式中，
有很多方法可以进入插入模式。比较普通的方式是按"a"（append／追加）键
或者"i"（insert／插入）键。
▫ 插入模式：在这个模式中，大多数按键都会向文本缓冲区中插入文本。大多数
新用户希望文本编辑器编辑过程中一直保持这个模式。在插入模式中，可以按
ESC键回到普通模式。
▫ 可视模式：这个模式与普通模式比较相似。但是移动命令会扩大高亮的文本区
域。高亮区域可以是字符、行或者是一块文本。当执行一个非移动命令时，命
令会被执行到这块高亮的区域上。Vim的"文本对象"也能和移动命令一样用在这
个模式中。
▫ 选择模式：这个模式和无模式编辑器的行为比较相似（Windows标准文本控件
的方式）。这个模式中，可以用鼠标或者光标键高亮选择文本，不过输入任何
字符的话，Vim会用这个字符替换选择的高亮文本块，并且自动进入插入模式。

### vim打开文件进行编写

常见参数：
 -c ：打开文件前线执行指定的命令
 -R ：以只读方式打开，但是可以强制保存
 -M ：以只读方式打开，不可以强制保存
 -r ：回复崩溃的会话
 +
num ：从第num行开始

**如果文件不存在则创建**



### 移动光标

 上下左右键或k、j、h、l键上下左右移动光标
 0 移动到行首
 g0 移到光标所在屏幕行行首
 :n 移动到第n行。
 gg: 到文件头部。
 G: 到文件尾部



### 数据操作

**数据操作**
 yy or Y: 复制整行文本。
 y[n]w: 复制一(n)个词。
 d[n]w: 删除（剪切）1(n)个单词
 [n] dd: 删除（剪切）1(n)行

**复制**
 yy or Y: 复制整行文本。
 y[n]w: 复制一(n)个词。
⚫ **粘贴**
 面向行的数据：
◼ p 放置数据在当前行的下面
◼ P 放置数据在当前行的上面
 **面向字符的数据**
◼ p 放置数据在光标的后面
◼ P 放置数据在光标前
⚫ **删除**
 d[n]w: 删除（剪切）1(n)个单词
 [n] dd: 删除（剪切）1(n)行



### 行号显示与取消

**显示行号**

set nu 



**取消显示**

set nonu



### 查找和替换

- 查找

     /word 向后搜索

	？word 向前搜索

- 替换

  :1,5s/word1/word2/g 

  将文档中1-5行的word1替换为word2，不加g则只替换每行的第
  一个word1。
  ：%s/word1/word2/gi 

  将文档所有的word1替换为word2，不区分大小写。



### 设置搜索高亮

![image-20240422215342529](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240422215342529.png)



### 修改文件

输入i进入插入模式进行修改文件

修改完成后点击esc退出修改模式

输入：wq保存并且退出



### 撤销与重做

u撤销

ctrl+r重做



### 保存与退出

![image-20240422215621336](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240422215621336.png)

## 文件文本操作

### cat

小猫老弟

cat 是一个文本文件查看和连接工具。cat有如下功能：
 **显示文件内容**，cat filename
 **编辑一个文件**，cat > filename。
 将几个文件**合并为一个文件**，cat file1 file2 > file3
⚫ cat常用选项有：
 -n：从1开始对<u>所有行</u>**编号**并显示在每行开头
 -b：从1开始对<u>非空行</u>**编号**并显示在每行开头
 -s：当有多个空行在一起时只输出一个空行
 -E：在每行结尾增加$（？）
 --help：显示帮助信息









# openeuler3

## 文件系统类型

![image-20240421093549325](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240421093549325.png)

openeuler默认使用ext4



## 磁盘及接口

![image-20240421094202478](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240421094202478.png)

lsblk显示磁盘信息

![image-20240421094652907](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240421094652907.png)



### 分盘操作

1. lsblk查看磁盘信息

2. 磁盘分区方案MBR（最小存储单元是扇区，大小512字节）

![image-20240421095651715](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240421095651715.png)

一个MBR只能存储4个分区盘，但是可以再指向一个新的MBR，逻辑分区加主分区为16个

### GPT

为了弥补MBR的磁盘空间不足（2tb），我们发明了GPT磁盘存储模式



### 创建磁盘命令

fdisk /dev/nvme0n1

输入n进行创建

输入p显示创建信息

partprobe//刷新磁盘信息

挂载前要进行**格式化**

格式化命令：mkfs -t ext4 /dev/nvm0n1p1

会生成一个UUID信息，每次格式化都会变化，用于挂载（挂载就是给磁盘这个房间加上一个门，属于映射关系）

临时挂载：mount /dev/nvm0np1p /mnt

df -h查看挂载信息 

永久挂载：修改我们的/etc/fstab（乱改会把系统搞奔溃）

![image-20240421104710545](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240421104710545.png)

推荐使用我们的uuid进行挂载，就是为了不把系统搞崩

挂载选项，也是在etc里面改

![image-20240421105824702](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240421105824702.png)



逻辑分区只能在拓展分区的范围中创建



## 怎么**在线拓展**我们的磁盘

使用lvm创建逻辑卷

将不同的空间映射成一个物理卷，然后再将物理卷加到一个组里面，然后再分为逻辑卷

1. lsblk
2. 分区
3. 转换成物理卷（pvcreate pvdisplay pvmove pvck pvchange ）
4. 创建成卷组（vgcreate data /dev/sdb1/nvmen0n1p1     vgs      vgdisplay /dev/data     vgreduce data /dev/sdb1  vgextend ）

5. 管理逻辑卷（lvcvrate -n lv1 -L 5G /dev/data  如果使用小-l 100就是100个最小逻辑单元pe-size）
6. 格式化
7. 挂载



![image-20240421115303178](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240421115303178.png)



## 系统管理

systemctl status atd



at-t 202405141314单次进行程序的执行时间 





### 周期性进行

cronb命令

![image-20240421142254869](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240421142254869.png)



例子：为了将某个程序在每天的0点执行一遍

\*单个*号表示每1

*/5表示每5

10-15表示10到15

10，15表示10号和15号

单个数字就表示时间

（5元组是吧）

可以使用网络上的计算器进行我们的计算



## 网络管理

ip address 

- en-以太网口

- en 表示Ethernet
- wl 表示WLAN
- ww 表示无线广域网WWAN

![image-20240421151314195](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240421151314195.png)

网卡配置文件etc/sysconfig/network-scripts/

![image-20240421151800981](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240421151800981.png)



网卡最小配置文件配置

![image-20240421151856590](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240421151856590.png)



不是哥们谁记这个啊



能补全的命令就是好命令

nmcilli connection reload



awdawd&&awdawda，前面命令执行成功后，后面的命令才能执行



单核cpu同一时间片只能进行一个流程，cpu按时间片来进行，切换时保存进程的状态，放进上下文中



进程优先级越小越好





## 看看cpu使用率

df -h

lsblk



## swap空间

为防止空间占满后进程卡死使用虚拟缓存防止卡死



划分swap空间

# openeuler4

运维工具ansible学习

## ansible常见模块与操作



一次性命令



## 剧本playbook-yaml

```yaml
- name: my first playbook
  host: all
  task: 
  - name: ensure user exists
    user:
     name: demo
     uid: 2000
     group: wheel
  - name: install httpd
    yum:
     name: httpd
     state: lastest
     
     
     
  - name: config repo files
    host: all
    task:  
    - name: remove repo files
      file: 
        path: adawdasdaw
        state: absent #删除
```

不会写找模板

## ansible定义变量

### 在playbook中定义变量

```yaml
- name: use vars
  hosts: web
  vars: 
    name: bob
  tasks: 
  - name: ensure user creat
    user: 
      name: "{{ name }}"
      state: present
```



### 命令行中进行变量定义

ansible-playbook -e name=hary vars.yml

```yaml
- name: manage service
  hosts: all
  vars_files: 
    - openeuler.yml
    
  tasks: 
  - name: install {{ pkg_name }}
    yum: 
      name: "{{ pkg_name }}"
      state: latest
      
  - name: start {{service_name }}
    service: 
      name: "{{ service_name }}"
        state: started
        enabled: yes
            
           
```



```yaml

```





## ansible fact 变量





## ansible魔法变量





## 还有循环？



## 条件任务语法

使用when语法



## jinja2模板# openeuler4

运维工具ansible学习

## ansible常见模块与操作



一次性命令



## 剧本playbook-yaml

```yaml
- name: my first playbook
  host: all
  task: 
  - name: ensure user exists
    user:
     name: demo
     uid: 2000
     group: wheel
  - name: install httpd
    yum:
     name: httpd
     state: lastest
     
     
     
  - name: config repo files
    host: all
    task:  
    - name: remove repo files
      file: 
        path: adawdasdaw
        state: absent #删除
```

不会写找模板