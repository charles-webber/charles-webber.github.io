# openwrt-第一周

芯片

## web界面

nx30 pro已经刷入了immortalWrt的系统，我们将路由器的wan口用双绞线和电脑相连，进入浏览器输入192.168.6.1即可打开web界面

进入之后发现有系统概况、防火墙、路由表、负载均衡等功能，非常直观就能配置而省去了输入命令的麻烦

![IMG20240516221533](C:/Users/alex/Documents/Tencent%20Files/1484145749/FileRecv/MobileFile/IMG20240516221533.jpg)



除此之外openwrt还能支持多种插件服务，比如说clash来对流量进行代理

![IMG20240516223237](C:/Users/alex/Documents/Tencent%20Files/1484145749/FileRecv/MobileFile/IMG20240516223237.jpg)



## 系统安装

### 有usb口

1. 利用写盘工具将固件烧录到我们的u盘中变成启动盘
2. 将u盘插入路由器并且连接显示器、鼠标键盘后开机
3. 进行系统安装

### 无usb口

1. 利用putty工具登录到路由器
2. 开启ssh
3. 刷写uboot（系统引导加载程序）
4. 路由器插电脑上，电脑更改静态ip为192.168.1.2 网关设置为192.168.1.1，浏览器输入192.168.1.1进入uboot的web界面，再选择并且刷入固件
5. 等待路由器重启，将路由器的wan口用双绞线和电脑相连，进入浏览器输入192.168.6.1即可打开web界面

## 入门课

### 路由器硬件构成

![image-20240520150340298](C:/Users/alex/AppData/Roaming/Typora/typora-user-images/image-20240520150340298.png)

usb总线速度有点慢，跑802.ac不够



**板子**

![image-20240520150917301](C:/Users/alex/AppData/Roaming/Typora/typora-user-images/image-20240520150917301.png)

- wifi芯片2.4g，5g一般是外挂的（7621，2.4g，5g）


- 电平：ttl和cmos


- ram：DD2/DDR3


- rom：常见8-32M，一般是spi和nand（nor不用了），spi（串型）是工业用总线，容量不能太大；nand比spi好使，家用型





# openwrt-第二周







# openwrt暑假期

![image-20240710194723121](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240710194723121.png)

我们的问题就是第三点，因为我们的芯片崭新出厂



方案：使用官方的或者主线kernel，把openwrt当rootfs使用，需要适配kernel、u-boot、configs、脚本、patch、makefile等



大致过程？

![image-20240710201038400](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240710201038400.png)
