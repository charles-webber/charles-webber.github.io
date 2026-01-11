---
title: answer
date: 2022-10-29 08:42:02
tags: answer
typora-root-url: ./..
description: a freshman's practice
cover: https://w.wallhaven.cc/full/0q/wallhaven-0qz5vq.jpg
swiper_index: 1
---

<meta name="referrer" content="no-referrer"/>

# *错题1**![](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/屏幕截图_20221028_132523-1667192539473-5.png)

假设b已经是a的因子之和，那么只要证明b的因子之和也等于a即可，如此简化了计算



# <u>***无题***</u>（太逆天了）

![](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/屏幕截图_20221028_140506-1667192552740-7.png)

![](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/屏幕截图_20221028_152146-1667192562705-9.png)

```c
//我的理解，虽然一开始没写出来呜呜呜（从E到A）
#include <stdio.h>
int main()
{
    int x;
    int i=1;
    for (x = 4;x<=10000; x+=4)
    {   int a=x;
        while (x % 4 == 0 && i <= 5)
        {
        
            x = 1.25 * x + 1;
            i++;
        }
        if ((x - 1) % 20 == 0 && i == 6 )
        {
            printf("Total number of fish catched=%d\n", x);
           
        }else
        x=a;
        i =1;
    }
        return 0;
}
```

`

```c
//这是直接从A到E的方法（自己写的！！！！！）
#include <stdio.h>
int main()
{
    int x=626;
    int i=1;
    int n=x-1;
    for (n;n<=3200; n+=5)
    {  
        while ((x-1) % 5 == 0 && i <= 5)
        {
        
            x =  (x - 1)*0.8;
            i++;
        }
        if ( i == 6)
        {
            printf("Total number of fish catched=%d\n", n-4);
           
        }else
        x=n+1;
        i =1;
    }
        return 0;
}
```

![](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/屏幕截图_20221030_221648.png)

​        ***<u>注意有些时候也得用上宏常量</u>***

```c

//参考答案（我和他是同一个思路，但是我忽略了金融是很“精准”的，一般情况下不可以用double这样的近似数，不然数据最后出来会有偏差，所以我们要用到宏常量）

#include <stdio.h>
#define  RATE  0.01875
#define  MONTHS 	12
#define  CAPITAL 1000
#define  YEARS 5
main()
{   	    
    int  i;
    double 	deposit = 0;
    for (i = 0; i < YEARS; i++)
    {   	    
        deposit = (deposit + CAPITAL) / (1 + RATE * MONTHS);
    }
    printf("He must save %.2f at the first year.\n", deposit);
}   	    


```

你好漂亮

yalima怎么这么难搞（scanf有返回值，每成功读取到一个数加1，没读到为0，形式为a=scanf("");		

![image-20221104213220993](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/屏幕截图_20221030_221648.pngimage-20221104213220993.png)

```c
#include <stdio.h>
int main()
{
    int x1=0,x2=0;
    int re=0;
    while (re!=2)
    {
        printf("Input x1, x2:\n");
        re=scanf("%d,%d",&x1,&x2);
        if(re!=2){
        while(getchar()!='\n');
        continue;
        }
        else
        if(x1*x2<0){
         printf("x1=%d,x2=%d\n", x1, x2);
         re=2;
        }else
        re=0; 
         
    }
    return 0;
}
```

这题要分闰年和每月的天数

问题是每年的天数还不一样，还得做一个



```c
#include <stdio.h>
int main(){
    int a,b,c;
    int sum=0,Sum=0;
    scanf("%4d-%2d-%2d",&a,&b,&c);
    int MAX[12]={31,28,31,30,31,30,31,31,30,31,30,31};
    //利用数组记录每月月数
    //闰年改二月的日期
    if(a%4==0&&a%100!=0&&a%400==0)
    MAX[1]=29;
    //计算？月距离一月一号过了多少天
    for(int i=1;i<b;i++){
        sum+=MAX[i];
    }
    for(int j=1990;j<a;j++){
        if(a%4==0&&a%100!=0&&a%400==0)
            Sum+=366;
        else
            Sum+=365;
    }
    int ret=(sum+Sum+c)%5;
    if(b<0||b>12||c<0||c>MAX[b-1]){
        printf("Invalid input.");
        exit(0);
    }else{
        if(ret==0||ret==4)
         printf("He is having a rest.");
         else
         printf("He is working.");
    }
    return 0;
}

```

# ***rand()的使用方法***

<img src="https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20221106211446271.png" alt="image-20221106211446271" style="zoom: 80%;" />

简单点：rand()%(b-a+1)+a表示【a，b】区间

一般使用：

```c
#include<stdio.h>
#include<stdlib.h>
#include<time.h>
int main(){
    int a=98;
    int b=678;
    int number;
    srand(time(0));
    number=rand()%(b-a+1)+a;
    printf("%d",number);
 	return 0;
}
```



assert用法：

类似于if语句，但它快一点，不影响效率。

```c
//先打个头文件
#include <assert.h>
assert(.....);//这里有分号，而且它加不了大括号。
.......

```

1533703751407

```无
编程验证哥德巴赫猜想：任意一个充分大的偶数，可以用两个素数之和表示。如：
4 = 2 + 2    6 = 3 + 3。
**输入格式要求："%d" 提示信息："Input a number:\n" 输入奇数时报错： "Input error!\n"
**输出格式要求：输入偶数时显示"%d=%d+%d\n"
程序的运行的输入输出样例1：
屏幕先显示提示信息：
Input a number:
然后用户键盘输入：
9
最后屏幕输出：
Input error!         
程序的运行的输入输出样例2：
屏幕先显示提示信息：
Input a number:
然后用户键盘输入：
100
最后屏幕输出：
100=3+97
```



日哦，for里面的自增变量打错了，搞起我循环没出来。。。。。

```c
#include <stdio.h>
#include <math.h>
#include <stdlib.h>
int isprime(int a){
    int isprime=1;
    int i=2;
    for(i=2;i<sqrt(a);i++){
        if(a%i==0)
        isprime=0;
    }

    return isprime;
}
int main(){
    int n;
    int i=1;
    int j=1;
    printf("Input a number:\n");
    scanf("%d",&n);
    if(n%2!=0){
        printf("Input error!");
        exit(0);
    }else{
        for(i=1;i<=n;i++){
            for(j=1;j<=n;j++){
                if(isprime(i)&&isprime(j)&&(i+j)==n){
                    printf("%d=%d+%d",n,i,j);
                    exit(0);
                }
            }
        }
    }

    
    return 0;
}
```



# 有意思的一题

**魔术师利用一副牌中的13张黑桃，预先将它们排好后迭在一起，牌面朝下。对观众说：我不看牌，只数数就可以猜到每张牌是什么，我大声数数，你们听，不信？你们就看。魔术师将最上面的那张牌数为1，把它翻过来正好是黑桃A，将黑桃A放在桌子上，然后按顺序从上到下数手上的余牌，第二次数1、2，将第一张牌放在这迭牌的下面，将第二张牌翻过来，正好是黑桃2，也将它放在桌子上，第三次数1、2、3，将前面两张依次放在这迭牌的下面，再翻第三张牌正好是黑桃3。这样依次进行将13张牌全翻出来，准确无误。问魔术师手中的牌原始顺序是怎样安排的？**（有点意思，不难但是没思路会很痛苦）



```c
//我的解法
#include<stdio.h> 
int number[13];
int main(){
  
    int i=0;
    int ret=0;
    int n;
    int count=0;
    for(n=1;n<=13;n++){
        for(i;i<13;i++){
            if(number[i]==0){
                count++;
                ret=0;
            }
            if(count==n){
                number[i]=n;
                ret=1;
                count=0;
                break;
            }
            
        }
        if(ret==0){
            n--;
            i=0;
            continue;
        }
    }
    for(int j=0;j<13;j++){
        printf("%3d",number[j]);
    }
    return 0;
}
```

一个大哥写的代码，我现在还看不明白。（代码武林里面的位运算，还不会，得学）

```c
 #include<stdio.h>
void printBinary(int num);
int main()
{
        int num;
        scanf("%d",&num);
        printBinary(num);
}
void printBinary(int num)
{    
    int cnt=(sizeof(num)<<3)-1;
    int i;
    for(i=cnt;i>=0;i--)
    {
        int temp=num>>i;
        int b=temp&1;
        printf("%d",b);
    }
}
```



# 数组如何定义？

**) 定义数组时给所有元素赋初值**，这叫“完全初始化”。例如：

```
int a[5] = {1, 2, 3, 4, 5};
```

**2) 可以只给一部分元素赋值**，这叫“不完全初始化”。例如：

```
int a[5] = {1, 2};
```

需要注意的是，“不完全初始化”和“完全不初始化”不一样。如果“完全不初始化”，即只定义“int a[5]；”而不初始化，那么各个元素的值就不是0了，所有元素都是垃圾值。（有些编译器会自动给你变成0）

你也不能写成“int a[5]={}；”。如果大括号中什么都不写，那就是极其严重的语法错误。大括号中最少要写一个数。比如“int  a[5]={0}；”，这时就是给数组“清零”（我的vs要放在主函数前面），此时数组中每个元素都是零。此外，如果定义的数组的长度比花括号中所提供的初值的个数少，也是语法错误，如“a[2]={1，2，3，4，5}；（会占据其他数据的位置）

**3) 如果定义数组时就给数组中所有元素赋初值，那么就可以不指定数组的长度，因为此时元素的个数已经确定了。**编程时我们经常都会使用这种写法，因为方便，既不会出问题，也不用自己计算有几个元素，系统会自动分配空间。例如：

（很多的时候你怎么办嘛）

```
int a[5] = {1, 2, 3, 4, 5};
```

可以写成：

```
int a[] = {1, 2, 3, 4, 5};
```

第二种写法的花括号中有 5 个数，所以系统会自动定义数组 a 的长度为 5。但是要注意，只有在定义数组时就初始化才可以这样写。如果定义数组时不初始化，那么省略数组长度就是语法错误。比如：

```
int a[];
```

那么编译时就会提示错误，编译器会提示你没有指定数组的长度。

**4.**输入数字时必须用 for 循环进行输入。而输入字符串时无须用循环，直接用 scanf 就可以了。(确实真的爽)



[](//jsut%20a%20sudden%20spark%20for%20fun.(for%20int%20number)%0A#include%20%3Cstdio.h%3E%0A#include%20%3Cmath.h%3E%0Aint%20%20i=10000;%0Aint%20main()%7B%0A%20%20%20%20char%20option;%0A%20%20%20%20printf(%22Please%20choose%20the%20option%20you%20want:%5Cn%27B%27for%20decimal%20to%20binary(10-%3E2)%5Cn%27D%27for%20binary%20to%20decimal(2-%3E10)%5Cn%22)

理解了一点字符数组和字符串数组再改进的二进制转换器





```c
//jsut a sudden spark for fun.(for int number)
#include <stdio.h>
#include <math.h>
int  i=10000;
int main(){
    char option;
    printf("Please choose the option you want:\n'B'for decimal to binary(10->2)\n'D'for binary to decimal(2->10)\n");
    scanf("%c",&option);
    if(option=='B'){
    long long int n;
    long int j=0;
    printf("Please input an integer\n");
    scanf("%lld",&n);
    int number[i];
    while(n!=0){
       
        number[j]=n%2;
        n/=2;
         j++;
        
    }
    long int x=j-1;
    for(x;x>=0;x--)
    printf("%d",number[x]);
 }//算输入了多少位二进制数（以后求位数有新选择了）
    char  number[32];
    int len(char number [])
    {
    int len = 0;
    while(number[len])
        len++;
    return len;    
    } 
    if(option=='D'){
    int i,j;
    int count=0;
    long sum;
     scanf("%s",&number);
     count=len(number);
     for(i=count-1,j=0;i>=0 ;i--,j++)
     {
     sum+=(number[i]-48)*pow(2,j);   
     }
     printf("%ld",sum);
    }
    return 0;
}

```

# **字符类数组的自我理解：**

**1.**      char[20]可以理解成char[20] [1]这个东西

2.   然后字符串可以看成char[a] [b]，一共有a个子块，每个子块的位数为b，例如

   ”广域网“，”经纬度“，”互换了“。。。。。

   3.如果a=1；那么我们可以写成char[20]这种的字符串数组（是不是和第一点很像？其实他们就差了个%c与%s

   4.这种数组好像可以做函数参数，感觉挺方便的wwww，有空学习一下





```题目
鲁智深吃馒头
据说，鲁智深一天中午匆匆来到开封府大相国寺，想蹭顿饭吃，当时大相国寺有99个和尚，只做了99个馒头，智清长老不愿得罪鲁智深，便把他安排在一个特定位置，之后对所有人说，从我开始报数（围成一圈），第5个人可以吃到馒头（并退下），按照这个公平的方法，所有和尚都吃到了馒头，唯独鲁智深没有吃上。请问他在哪个位置？
要求编程计算该位置并输出。
输入格式:无
输出格式：
```

```c
#include<stdio.h>
int main(){
    int i=0,j=0,k=0;
  int a[100]={};
  for(i,k;k<100;i++){
    if(a[i]==0)
        j++;
    if((j%5==0)&&a[i]==0){
       a[i]=1;
       k++;
    }
   if(i==100)  
    i=-1;
   if(k==99)
   break;
  }
  for(int m=0;m<100;m++){
    if(a[m]==0)
    printf("%d ",m+1);
  }
}
```

（感觉不是特别难，但我就是弄了很久）

# 指针困惑

![-bdcd8f8e098f9b1[10]](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/-bdcd8f8e098f9b1[10].png)

困惑一：(int (*)[3])a其实就是将a这个4×3的二维数组转成了3×4的，名字变成了b

困惑二：为什么只有三列却出现了[3]呢？其实a[1]+1表示a[1] [1],那么这个三是可以参与计算的，化简得(b[2]-2)[3]=b[2]-2+3=b[2] [1],最后再加加得到10
