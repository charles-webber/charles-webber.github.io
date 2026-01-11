---
title: python learning
date: 2023-10-09 16:35:02
tags: note
description: python learning for AI
cover: https://gitee.com/Charles-Webber/blog-image1/raw/master/img/1ad592ce-e2c5-4f5f-975b-9d4f04d97d41.png
---



**python学习之路**

# 预备知识

## 编程思想

python是一种面向对象**oop(Object Oriented Programming)**的[脚本语言]

对象包括数据和动作，把数据和方法组成为一个整体，然后对其进行系统的建模

*核心思想是**理解功能逻辑**！！！

## 基本程序设计模式

任何的程序IPO，它们分别代表如下：

- input输入
- process处理
- output输出

基本程序设计步骤：

- 确定IPO
- 编写程序
- 调试程序

## 解决复杂问题的有效方法

### 自顶向下

其实就是不断将大问题分解成小问题，进行模块化编写

**栗子**：斐波那契数列（递归）

```python
cache = {}
 
def fib(number):
    if number in cache:
        return cache[number]
    if number == 0 or number == 1:
        return 1
    else:
        cache[number] = fib(number - 1) + fib(number - 2)
    return cache[number]
 
if __name__ == '__main__':
    print(fib(35))
```



cache：在Python中，"cache"这个词通常是指将数据或计算结果存储起来以便以后使用的过程，而不是指计算机硬件中的高速缓冲存储器（Cache）。

Python中的cache通常用于以下几个方面：

1. 存储函数或方法的结果，以便以后可以快速地重用这些结果，而不需要重新计算。例如，可以使用`functools.lru_cache()`装饰器来缓存函数的结果。
2. 缓存数据库查询的结果，以便在需要时可以快速地获取这些结果，而不需要再次查询数据库。例如，可以使用SQLAlchemy的查询缓存功能。
3. 缓存网页或API响应的结果，以便在需要时可以快速地获取这些结果，而不需要再次发出请求。例如，可以使用requests库的响应缓存功能。

这些cache的实现通常是使用Python中的字典或其他数据结构来存储和检索数据。它们与计算机硬件中的高速缓冲存储器（Cache）不同，但是它们都使用了类似的概念，即**将数据或计算结果存储起来以便以后使用，以提高性能和效率。**

（有点数组的味道，cache[number]中number相当于一个门牌，在这个里面存放了计算后的数据）



### 自底向上-模块化集成

栗子：0-1背包问题

问题:你现在想买⼀大堆算法书，有一个容量为 **V** 的背包，这个商店⼀共有 **n** 个商品。问题在于，你最多只能拿 **W** kg 的东西，其中 **wi** 和 **vi** 分别表示第 **i** 个商品的重量和价值。最终的目标就是在能拿的下的情况下，获得最大价值，求解哪些物品可以放进背包。

作为一个聪明的贼，你用 表示偷到商品的总价值，其中i表示一共多少个商品，w表示总重量，所以求解就是我们的子问题，那么你看到某一个商品i的时候，如何决定是不是要装进背包，有以下几点考虑：

1. 该物品的重量大于背包的总重量，不考虑，换下一个商品；
2. 该商品的重量小于背包的总重量，那么我们尝试把它装进去，如果装不下就把其他东西换出来，看看装进去后的总价值是不是更高了，否则还是按照之前的装法；
3. 极端情况，所有的物品都装不下或者背包的承重能力为0，那么总价值都是0；

```python
# 循环的⽅式，自底向上求解
cache = {}
items = range(1,9)
weights = [10,1,5,9,10,7,3,12,5]
values = [10,20,30,15,40,6,9,12,18]
# 最⼤承重能⼒
W = 4
 
def knapsack():
    for w in range(W+1):
        cache[get_key(0,w)] = 0
    for i in items:
        cache[get_key(i,0)] = 0
        for w in range(W+1):
            if w >= weights[i]:
                if cache[get_key(i-1,w-weights[i])] + values[i] > cache[get_key(i-1,w)]:
                    cache[get_key(i,w)] = values[i] + cache[get_key(i-1,w-weights[i])]
                else:
                    cache[get_key(i,w)] = cache[get_key(i-1,w)]
            else:
                cache[get_key(i,w)] = cache[get_key(i-1,w)]
    return cache[get_key(8,W)]
 
def get_key(i,w):
    return str(i)+','+str(w)
 
if __name__ == '__main__':
    # 背包把所有东西都能装进去做假设开始
    print(knapsack())
    29
>>> 
```

//看不懂啊现在，史密达

## 标准库模块导入

```python
python_modules = [
  "os --- 多种操作系统接口",
  "os.path --- 常用路径操作",
  "re --- 正则表达式操作",
  "datetime --- 基本日期和时间类型",
  "heapq --- 堆队列算法",
  "enum --- 对枚举的支持",
  "math --- 数学函数",
  "random --- 生成伪随机数",
  "itertools --- 为高效循环而创建迭代器的函数",
  "functools --- 高阶函数和可调用对象上的操作",
  "shutil --- 高阶文件操作",
  "sqlite3 --- SQLite 数据库 DB-API 2.0 接口模块",
  "csv --- CSV 文件读写",
  "hashlib --- 安全哈希与消息摘要",
  "hmac --- 基于密钥的消息验证",
  "time --- 时间的访问和转换",
  "argparse --- 命令行选项、参数和子命令解析器",
  "logging --- Python 的日志记录工具",
  "threading --- 基于线程的并行",
  "multiprocessing --- 基于进程的并行",
  "socket --- 底层网络接口",
  "email --- 电子邮件与 MIME 处理包",
  "json --- JSON 编码和解码器",
  "urllib --- URL 处理模块",
  "http --- HTTP 模块"
]
```







# 基础语法

## 缩进规则

缩进来表示块作用域的开始和结束（其他语言一般使用{}）

Python 对缩进有严格的要求，同一个源文件里，缩进必须保持一致，**例如都是2个空格或者4个空格**。Python 这么做的理由是使用缩进更简洁，同时不用考虑`"{"`要放在哪一行，而且是用缩进足够Python解释器正确解析。但是使用缩进如果没有编辑器自动检测和格式化也会带来一些不必要的麻烦。

### 正确案例

```python
**# 这是一个 Python 程序** 
if i<10:    
    if i<5:    //2
        print("win more!") //4   
	else:       //2
        print("win")//4 
else:   
    print("loose")//2
```

## 错误案例

```python
if __name__ == '__main__':
	i = 0
    c = 5
    max = 10
    while i < max:
        d = max-i-i//（应该全都是4或者2）
      if abs(d) < 3:（6格）再往右边走两格
        print(i, max-i)
      else:
        pass

        i += 1
```



## 函数

### 函数定义

def 函数名(参数列表)：    

函数体

例如

def hello():    

print("hello")

print("world!")

————————

以下代码定义了无任何操作的空函数nop()。

```python
def nop():
    pass//c中就有nop函数
```

在Python代码中，pass语句通常可以用来作为占位符，表示什么操作都不执行。比如在项目起始阶段，如果还没想好函数具体实现时，可以先放置一个pass语句，让代码先成功运行起来。待项目框架搭建完毕后，在进行相应的具体实现。

### 函数定义规则

- 函数代码块以def关键字开头，后接函数标识符名称和形参列表；
- 任何传入的参数和自变量必须放在圆括号内；
- 函数的第一行语句可以选择性地使用文档字符串（即函数说明）；？？
- 函数内容以冒号起始，并且严格统一缩进；
- 函数都有返回值，默认返回None。

### 内建函数

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/7cb36988-7829-41b1-8680-3246ae9f7859.png)

除此之外的就是第三方函数，在Python语言中，还可以把函数名赋给一个变量，相当于给这个函数起了一个“别名”，如下代码所示。

```python
a = abs
print(a(-1))
```

### 自定义函数

当内建函数不能满足要求时，开发者可以根据实际需要自定义函数。函数自定义完成后，开发者可以在其他代码处通过函数名调用。如下代码演示了自定义函数printme()的定义和调用过程。

```python
# 自定义函数
def printme(str):
    "函数功能：打印传入的字符串"
    print(str)


# 调用自定义函数
printme("调用用户自定义函数！")
printme("再次调用用户自定义函数！")
```

输出结果：

```python
调用用户自定义函数！
再次调用用户自定义函数！
```

上述代码中，自定义了一个函数printme()，并对其进行两次调用，测试相应功能。在实际开发中，涉及到大量的自定义函数。在自定义函数中，也可以调用内建函数或其他自定义函数。自定义函数和内建函数的定义方式是相同，只不过是自定义函数是有开发者定义的，而内建函数是由系统定义的。两者的调用方式都是一样的。

在Python语言中，内建函数可以直接使用，第三方函数需要使用import命令导入相应的库才能使用。对于自定义函数，其定义和调用可以在同一个文件中，也可分离成不同的文件。

```python
from test import hello

hello()
```

上述代码演示了函数的定义和调用不在一个文件的情形。首先，将hello()函数定义好并保存为test.py文件，然后使用Python语言的import指令“from test import hello”将该文件导入，可以调用hello()函数了。导入时需要注意test是文件名并且不含.py扩展名。





## 类

- 类 ：是对实体的抽象，是泛指，比如：动物、植物等。

- 对象：是类的一个实例，是特例，比如：猫、狗等。

  

例如：动物可以对猫的特征和行为进行抽象，然后可以实例化为真实的动物实体。



在采用面向对象思想编程时，可依次采用以下步骤：

（1）分析哪些动作是由哪些实体发出的；
（2）定义这些实体，为其增加相应的属性和功能；
（3）让实体去执行相应的功能或动作。



### 类和对象

Python语言中，使用class关键字来创建类，其创建方式如下：

```python
class ClassName(bases):
    # class documentation string 类文档字符串，对类进行解释说明
    class_suite
```

class是`关键字`，bases是要继承的`父类`，默认继承`object`类。
class documentation string是类`文档字符串`，一般用于`类的注释说明`。class_suite是`类体`，主要包含`属性`和`方法`。



类、属性和方法的命名约定惯例如下：

- `类名`表示实例的抽象，命名时`首字母大写`；
- `属性`使用名词作为名字，比如name、age、weight等；
- `方法`名一般指对属性的操作，其命名规则一般采用动词加属性名称形式，如updataName、updataAge、updataWeight等。 举例如下图：

```python
# 类定义
class People:  # 类名
    name = "张三"  # 属性名

    def undate_name(self, name):# 方法名
        self.name = name  
```

**在Python3.x中，如果没有显示指明要继承的父类，则默认继承`object`类。**

### 对象的创建

类创建完之后，就应该创建该类的实例或对象了，该过程称之为实例化。当一个对象被创建后，就包含**标识**、**属性**和**方法**这三个方面的对象特性了。其中，对象标识用于区分不同的对象，属性和方法与类中的成员变量和成员函数相对应

```python
people = People("李四", 20, "50kg")  # 实例化一个对象
```

如例子所示，对象标识符为people，属性为括号中内容，方法为类中方法

### 类的属性

1. Python语言中，属性分为类级别和实例级别两种。实例级别的属性值默认共享类级别的属性值。除非显式进行赋值操作

2. 属性操作的三个原则：

   （1）属性的获取是按照从下到上的顺序来查找属性；
   （2）类和实例是两个完全独立的对象；
   （3）属性设置是针对实例本身进行的。

3. 属性和方法的分类：

![image-20231011002732011](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/219b743f-10fd-4d18-9c3c-f9903d81088e.png)

![image-20231011002753974](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/bfe668b7-7a09-4ff8-b3a8-908eaddcd4d0.png)



栗子：![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/cd5cdf24-ff9f-4ad6-a841-48639b397ea5.png)



### 魔术方法

在Python语言中，所有以双下划线“__”包起来的方法，都统称为“魔术方法”。 这些方法在实例化时会自动调用， 比如“_str__()”、“__init__()”、“__del__()”等。 使用魔术方法可以构造出非常优美的代码，比如将复杂的逻辑封装成简单的API等。



栗子：

```py
class People():
    name = "人"

    def __init__(self, n="非洲人"):
        self.name = n
        print("我是构造函数", self.name)  # 重写构造函数

    def __del__(self):
        print("我是析构函数", self.name)  # 重写析构函数


zhangsan = People()
lisi = People("欧美人")
zhangsan.__del__()  # 调用析构函数
print(zhangsan)
del zhangsan
print(zhangsan) #出现错误，因为del后，对象就不存在了
```



结果：

```
我是构造函数 非洲人    张三
我是构造函数 欧美人    李四
我是析构函数 非洲人    调用del后print
<__main__.People object at 0x000001EAF4D09358>
```



### 类间关系

1. 依赖关系
2. 关联关系
3. 继承关系！！！



## 条件表达式

### 运算符

算术运算符：+、-、*、/、//、%、**
关系运算符：![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/7cbdf9dd-88a4-468a-ae45-f79f23aa915d.png)

Python支持通过保留字not、and和or对判断条件进行逻辑组合：

- not，表示单个条件的“否”关系。如果“条件”的布尔属性为True，“not 条件”的布尔属性就为False；如果“条件”的布尔属性为False，“not 条件”的布尔属性就为True。
- and，表示多个条件之间的“与”关系。当且仅当使用and连接的所有条件的布尔属性都为True时，逻辑表达式的布尔属性为True，否则为False。
- or，表示多个条件之间的“或”关系。当且仅当使用or连接的所有条件的布尔属性都是False时，逻辑表达式的布尔属性为False，否则为True。

### 三元表达式

格式：条件判断为真时的结果| if 判断条件| else 条件为假时的结果
示例：**x=x-1 if x>0 else x=x+1**
等价于：

```c
if x > 0:
    x = x - 1
else:
    x = x + 1
```

栗子

```py
def fun(n):
    return n if n < 2 else fun(n - 1) + fun(n - 2)
```

## 循环

python中的for循环与c语言的有点不一样

### for循环

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/e1f64824-f8e4-4daa-a0ee-962fc196d038.png)

- 目标可以是字符串、文件、range()函数或组合数据类型等；
- 循环变量用于保存本次循环中访问到的遍历结构中的元素；
- for循环的循环次数取决于遍历的目标元素个数。

示例1：遍历字符串中的每个字符

```python
string = input("请输入一个字符串：")
for c in string:
	print(c)
```

### PASS

pass的意思是过，pass掉就是淘汰掉的意思。

在python中，pass的意思是空语句，pass语句不做任何事情，只是为了保持程序结构的完整性。

## **数据类型**

### 数字类型

1. 整型（int）
2. 浮点型（float）
3. 复数类型（complex）
4. 布尔类型（bool）

### *复数

- 复数由“实部”和“虚部”两部分组成；
- 实数部分和虚数部分都是浮点型；
- 虚数部分后面必须有j或J

Python中表示复数的两种方法：

1. a+bj
2. complex(a,b)
   其中a表示实部，b表示虚部
   举例：

```c
a = 2 + 6j
print(type(a))
b = complex(2, 6)
print(type(b))
print(id(a), id(b))
```

结果：

```c
<class 'complex'>
<class 'complex'>
2718471372752 2718437554352
```

获取复数的实部、虚部、共轭复数等

```py
a = 2 + 6j
print(a.imag)  # .imag可以获取复数的虚部
print(a.real)  # .real可以获取复数的虚部
print(a.conjugate())  # .conjugate()方法可以获取复数的共轭复数
```

结果：

```py
6.0
2.0
(2-6j)
```

### 数值计算函数库

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/2869590f-42dc-4fe3-afcd-80490718c3f6.png)

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/c834e5d7-f806-4ad9-9514-4745e83f0837.png)

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/c8d94c56-b7bc-4322-bcc0-7a3af98a43af.png)

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/d5d9d30b-669c-4334-82f5-f8e64ec89bac.png)

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/f7144f28-635e-4b38-923f-d0b56fc4384c.png)

```py
import random

print(random.random())  # random.random()作用是生成一个[0-1]范围内的随机数
print(random.randint(1, 2000))  # random.randint(a,b)作用是生成一个[a-b]范围内的随机整数
```

### 字符串类型

#### 三重引号

三重引号可以是`三个单引号`，也可以是`三个双引号`。这种方式表示的字符串也叫做`块字符串`。

三重引号是以三个同一种类型的引号开始，并以三个相同引号结束的字符串表示方式。

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/35c59eb7-30b1-47e2-ac52-3aca4f172cda.png)

//和C语言的/*  */语句类似（字符串中出现了“\n”换行符，这是因为敲了回车）

### raw字符串

raw字符串的格式是r’…’。

在raw字符串中，所有的字符都是直接按照字面意思来解释，没有转义字符或者不能打印的字符。

栗子：![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/df8aafac-9617-484d-bbe9-95cf76bc4ae4.png)

- 第一种方式的语句打开一个文件时，字符“\n”会被当作回车键的转义字符，从而使文件打开失败。
- 第二种方式对反斜杠“\”进行转义，虽然正确，但是代码看起来会令人感到费解。
- 第三种就是pthon语言中的raw字符串。

### 字符串操作

#### 索引

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/c781d4ed-cac4-4e3c-8913-3bcc5474f3bf.png)

有反向索引，很方便

#### 切片

使用Python语言的分片(slice)操作，来提取字符串中的子序列。

![img](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/3d34be90-02fb-499c-94bd-41afaceb5a24.png)

s[start:end :dir]---start是提取的开头，而end是提取的末尾，dir既有控制方向和倍数的功能，例如s[1：6：2]表示从序号1开始到六按1+2n取元素直到6，为1 3 5 

#### 连接字符串

1. 操作符+的方法

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/c3bd279d-121b-46e8-a259-22a81028cef3.png)

1. Python语言使用符串格式化操作符(%)和join()方法这两种方式连接字符串。

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/eaea0bfe-4d57-4b56-971e-063dbee5f303.png)

3. **join()方法：**

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/6f05b64b-6ee4-4a75-88e7-bad309498ff4.png)



#### 修改字符串

1. 加号完再切片
2. replace函数修改

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/89e9d2ad-41c8-4963-bc34-d225b67875f3.png)

#### 字符串格式化

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/5a2a140b-8f6b-47ef-9f3b-fffe9e4deeb5.png)

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/79803c3b-b6ac-4a70-abb6-6c227468ce2c.png)

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/9b02b845-1df4-4304-b63a-040894ee8fc7.png)



栗子：

```py
print("%c,%c" % (65, 97))
s = 'podjsd'
print("%s" % (s))
print('%r'%42)
print('%e'%200.21)
print('%g'%200.21)
print('%%'%())
```

#### 函数格式化

就是利用format（）方法对字符串进行格式化操作，format（）方法使用方法：

- 不带编号，即“{}”；

- 带数字编号，可调换顺序，如“{0}”、“{1}”等；

- 带关键字，如“{name}”、“{age}”等。
  例如：

  ```py
  print("a={},b={}".format(2, 4))
  print("a={0},b={1}".format(2, 4))
  print("a={1},b={0}".format(2, 4))
  print("a={num2},b={num3}".format(num2=2, num3=4))
  print("a={num3},b={num2}".format(num2=2, num3=4))
  ```

  

#### 数字格式化

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/260cd146-e668-4724-9205-cd0e0864070e.png)

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/16c9e886-cbf2-44cd-aa06-9d44369d6e89.png)



#### 字典格式化

在Python语言中，字典格式化是在左边的格式化字符串通过引用右边字典中的**键**来提取对应的值，实现格式化输出。

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/a4dfca4d-77ff-4d98-9e1c-a51bd98b9168.png)

（“ ”中的就叫key，注意括号外的s别忘了：“%(name)s,%(age)s”）



### 复合数据类型

#### List

##### 创建

创建列表：
`变量名 = [元素1,元素2,…,元素n]`

list类型中区分元素的顺序，且允许包含重复的元素。

##### 索引

分正向和反向索引

##### 切片

切片操作可以截取列表变量中的部分元素，并返回一个子列表变量。

##### 加法和乘法

- 加法操作使用加号（+）完成，表示把加号两端的列表变量连接形成一个新列表；
- 乘法操作使用星号（*）完成，表示对当前列表对象进行复制并连接，并形成一个新列表。

#####  修改和删除

- 通过索引值对相应元素进行修改或删除。
- 删除整个列表或列表中的部分元素，使用**del命令**。删除整个列表后，不可再次引用。

#####  追加插入和扩展

- append：在当前列表对象尾部追加元素；
- insert：在当前列表的指定索引位置插入元素；
- extend：对当前列表元素进行批量增加

#### 多维列表

栗子：

创建三个列表类型的变量a、n和x。其中，变量a和n中元素都是基本类型，变量x中的元素都是列表类型。

```py
>>> a = ['a',1] 
>>> n = ['b',2]
>>> x = [a,n]
>>> x
[['a',1],['b',2]]
>>> x[0] # 显示第一个元素 
['a', 1] 
>>> x[0][1] # 显示第一个元素中的第二个元素 
1
```

#### 迭代器

不清楚：首先创建了一个列表类型变量lst，然后创建了该列表的迭代器对象lstiter，并且通过该迭代器对象的__next__()方法遍历列表中的元素。
`__next__()`方法，返回下一个值。iter方法访问列表。

#### 列表解析

```py
>>>list=[1,2,3,4,5,6,7,8,9,10] #方法1：直接指定

>>>list=[]#方法2：先创建一个空列表，然后通过for循环实现
   for n in range(1,11):
      list.append(n);

>>>list(range(1,11)) #方法3：列表解析
[1,2,3,4,5,6,7,8,9,10] 
>>> [x * x for x in range(1, 11)] 
[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
# 或者字母所进行的两层循环
>>> [m + n for m in 'ABC' for n in 'XYZ']
['AX', 'AY', 'AZ', 'BX', 'BY', 'BZ', 'CX', 'CY', 'CZ']
```



#### 列表函数和方法

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/7c9a62ad-bd77-4f79-9a5f-cf44e743277e.png)

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/f346c1d1-2c95-4eda-8c4b-329ab28b8b26.png)



#### 元组

##### 创建

创建元组：
`变量名 = (元素1,元素2,…,元素n)`

`注意：`
当元组中只包含`一个`元素时，需要在元素后面添加`逗号`，否则括号会被当作运算符使用。

##### 访问

使用索引进行访问

##### 修改

元组中的元素值是不允许修改的，可以对元组进行连接生成新的元组。

##### 删除

元素值不允许删除的，但可使用del语句删除整个元组。
需要注意的是，删除后的元组对象不可再次引用。

##### 统计

通过内置的count方法统计某个元素出现的次数。

##### 查找

通过内置的index方法查找某个元素首次出现的索引位置。

##### 元组函数和方法

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/8d065e27-f1e0-4d4f-83d5-1540515e5631.png)

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/838061b9-ddff-4849-87db-84b79869ef74.png)

表中的count方法和index方法，实际是元组类型和列表类型所共有的方法，其使用方法和列表完全相同。

##### 元组优势

- 可以使函数返回多个值
- 可以使程序运行性能提升
- 一般来说，创建元组类型tuple的变量比列表类型list要快，而且占用更小的存储空间。
- 使用元组是线程安全的
- 元组类型变量的元素不可更改性，可保证多线程读写时的安全问题。

### dict（字典）

#### 创建

创建字典对象：
`变量名=(key1:value1, key2:value2,…, keyn:valuen)`

- 字典的元素是可变的，可以是列表、元组、字典等任意数据类型，但键(key)值必须使用不可变类型。
- 在同一个字典变量中，键(key) 值必须是唯一的。

和元组区别就是有个key

#### 访问

字典是无序的，没有索引，不能通过下标索引。通过对key值的索引进行访问。

#### 修改

通过对key值的引用对value值的修改操作。

#### 字典的嵌套

```py
>>>Va1 = {a:{b:1,c:2},d:{e:3,f:4}} #字典的value值是字典
>>>Va2 = {a:[1,2,3],b:[4,5,6]}  #字典的value值是序列
>>>n1={'surname':'wang','name':'gang'}  
>>>n2={'surname':'zhang','name':'san'}  
>>>n3={'surname':'liu','name':'wen'}  
>>>n4=[n1,n2,n3]  #序列的元素是字典
```

n1、n2、n3是字典类型的变量，n4是列表类型变量，且n4中的元素即为n1、n2、n3。

#### 字典的遍历

栗子：

```py
username={'full_name':'ZhangWei', 'surname':'Zhang', 'name':'Wei'  }  
#遍历所有的键-值对  
for k,v in username.items():
 print('key:'+k)
    print('value:'+v+'\n')
```

结果：

```py
#遍历所有键  
for k in username.keys():
print(k)
print('key:'+k+'-value:'+username[k])
#遍历所有的值
for v in username.values():
print(v)
```



#### 字典函数和方法

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/a3c8453f-1f2a-4183-821c-fa97b7a6d298.png)

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/131318f4-4dad-42f9-9b39-c4b6e9db2f89.png)



### 集合（set）

#### 创建

创建集合对象：
`变量名 = {元素1,元素2,…,元素n}`

#### 集合特性

- 无序性：元素之间没有确定的顺序。
- 互异性：不会出现重复的元素。
- 确定性：元素和集合只有属于或不属于的关系。

#### 注意

创建空集合用set()；
{}创建一个空字典。

#### 运算

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/4419ffa1-9596-4f29-af6b-487674a7fbc1.png)

#### 基本操作

**1. 更改**

- add（）：添加一个元素
- update（）：同时添加多个元素

**2. 删除**

- discard() 和 remove() 方法删除集合中特定的元素
- 若删除的对象不存在，remove（）方法会引起错误，discard（）方法不会



#### 不可变集合

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/9697e400-78f7-444c-ad43-d63ba6888af8.png)



#### 集合函数和方法

![在这里插入图片描述](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/d353a291-0b5c-4020-b18a-214621c25060.png)



# 进阶语法

## 列表推导式

### 语法结构

[表达式 for 迭代变量 in 可迭代对象 [if 条件表达式]]



列表推导式中存在两个名词，一个是 **列表**，另一个是 **推导式** ，列表我们很清楚，就是 Python 的一种数据类型，
而推导式只是一个普通的语法定义词，有的教程里，会将其叫做 **解析式**，二者是一样的概念。

列表推导式会返回一个列表，因此它适用于所有需要列表的场景。

### 使用方法

优化c类中冗长的c语言for循环

**普通**

```c
my_list = [1,2,3]
new_list = []
for i in my_list:
    new_list.append(i*2)

print(new_list)
```

**优化**

```c
nn_list = [i*2 for i in my_list]
print(nn_list)
```

<u>列表推导式语法构成 `nn_list = [i*2 for i in my_list]` ，`for` 关键字后面就是一个普通的循环，前面的表达式 `i*2` 其中的 `i` 就是 `for` 循环中的变量，也就是说表达式可以用后面 `for` 循环迭代产生的变量</u>



#### 优化两层for循环

栗子：

```c
nn_list = [(x,y) for x in range(3) for y in range(3) ]
print(nn_list)
```



**当循环次数非常大的时候列表推导式速度会更快**



#### 列表推导式的嵌套

```c
my_var = [y*4 for y in [x*2 for x in range(3)]]
print(my_var)
```

#### 转换数据

可以将可迭代对象（一般是列表）中的数据，批量进行转换操作

#### 过滤数据

if判断条件来对数据进行过滤



### 字典推导式

#### 语法格式

```c
{键:值 for 迭代变量 in 可迭代对象 [if 条件表达式]}
```

栗子

```
my_dict = {key: value for key in range(3) for value in range(2)}
print(my_dict)
```

结果

{0: 1, 1: 1, 2: 1}

#### 元组推导式



使用元组推导式生成的结果并不是一个元组，而是一个生成器对象，需要特别注意下，这种写法在有的地方会把它叫做生成器语法，不叫做元组推导式。



#### 集合推导式

因为集合是无序且不重复的，所以会自动去掉重复的元素，并且每次运行显示的顺序不一样，使用的时候很容易晕掉。
