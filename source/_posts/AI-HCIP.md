---
title: AI-HCIP
date: 2024-09-02 09:09:19
tags: []
categories:
cover: https://w.wallhaven.cc/full/47/wallhaven-47k65o.jpg
---
# 大三培训

## 第一天

没有车票没回来

## 第二天

做实验-玩弄虚拟机

### 虚拟机安装和使用

1.先要有VMWareNet16

2.资源下载

3.解压

4.打开方式用vMware打开22biqdata01.vmx等三台机器
5.开启虚拟机并点击“已移动此虚拟机“
6.登录 root 123456
7.在开启的桌面点击右键打开console
8.修改对应ip 编辑->虚拟网络编辑器->NAT设置->修改成对应网段即可
9.cd /etc/sysconfig/network-scripts
vi ifcfg-ens33

IPADDR= 192. 168. 198.112

GATEWAY=192.168.198.2

10.重启网卡service network restart 

11.改主机的映射

vi etc/hosts 

192.168.198.111 bigdata01

12.启动yarn前置（data111启动）：start-dfs.sh 启动hdfs start-yarn.sh启动yarn

13.mysql在112机器上systemtcl start mysqld

14.启动hive在113 hive --service metastore & hive --service hiveserver2 & beeline ---> 等待20秒 !connect jdbc:hive2://bigdata03:10000

15.zkServer.sh start 启动    zkServer.sh status状态  

16. 启动kafka(信息垃圾站，还能互相沟通)

     cd /usr/software/kafka/kafka_bin/config

17. 执行kafka-server-start.sh -daemon ./server.properties

18. 执行producer和consumer之间的通信验证

		 kafka-console-producer.sh --broker-list bigdata01:9092 --topic test01

```
 kafka-console-consumer.sh --bootstrap-server bigdata01:9092 --topic test01
```



19. 停止kafka通信：kafka-server-stop.sh

![image-20240831092506370](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240831092506370.png)

## 一些行话

### 机器学习

- 有监督学习：有一些初始的历史数据用于拟合模型
- 无监督学习：对要处理的数据进行一个大致的分类
- 半监督学习=有监督加无监督
- 强化学习：为了未来，付出现在（画饼流）



### 分类算法

构造分类函数和分类器的方法把数据项映射到大致类别中



### 回归

等价于函数拟合：使用一条函数曲线，使其很好的拟合已知函数

### 偏差（数据训练）/方差（数据测试）

值越小拟合的越好

### 过拟合/欠拟合

过拟合：吸收了噪声（高方低偏）

欠拟合：没有突出到特征（高偏低方）



### logistic分布



### sigmoid函数

![image-20240831145555487](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240831145555487.png)

### 损失函数

优化方法-极大似然法

### 逻辑回归的优缺点

- 优点：实现简单，广泛的应用于工业上，用l2正则化解决多重共线性
- 缺点：拟合不是很好

## 一些算法

### 分类算法-knn最近邻

k个最近的邻居的意思，即每个样本都可以用它最接近的k个邻居来代表

![image-20240831151818583](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240831151818583.png)

距离度量和分类规则

![image-20240831151935672](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240831151935672.png)



### 朴素贝叶斯分类算法

认为数据之间独立并且同分布

### 决策树

![image-20240831152639222](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240831152639222.png)

- 特征选择：从数据中选择一个特征作为分类的标准
- 决策树生成
- 剪枝：防止过拟合，缩小树的结构和规模



### 信息熵

概率越平均熵越大，信息越少，反之熵小信息量大



### ID3

![image-20240831153900556](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240831153900556.png)

大多数情况下不会提供多少有价值的信息



### C4.5

改进了id3的依靠信息增益来选择属性，改用信息增益率



### 集成学习

多个弱学习器合成为强学习器

- bagging：并行---**随机森林**（很多决策树）

- boosting：串行---每一个决策树都会对上一个决策树进行修正
- stacking：栈算法
- voting：投票算法





## 关联算法

### apriori算法（找出现次数大的，删次数小的）

“A时间发生，B也有可能发生”

![image-20240831163442409](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240831163442409.png)![image-20240831164102981](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240831164102981.png)

### FP-growth算法（链表）

是apriori的升级版，采用了更加先进的数据结构，减少了i/o次数，减少扫描次数

- 比apriori快一点
- 实现困难
- 只适用于离散型数据

### prefixSpan算法（递归）

![image-20240831170220192](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240831170220192.png)



## 推荐算法

### 协同过滤

![image-20240831172612816](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240831172612816.png)



#### 基于用户推荐

![image-20240831172838013](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240831172838013.png)



已知A推荐物品D，看他们之前购物重合度大不大，如果相同则推荐



#### 基于项目推荐

![image-20240831173033453](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240831173033453.png)





### 基于内容推荐





### 基于知识推荐



### 混合推荐







## 第三天（大数据）

### 数据治理

- 数据元
- 元数据
- 主题数据
- 数据仓库（hive）
- 数据湖：存储结构化的数据



**价值**

- 改善数据质量
- 控制数据风险
- 增强数据安全
- 赋能管理决策



**挑战**

- 对数据治理的业务价值认识不足
- 领导不重视
- 数据标准不统一，数据整合困难
- 业务人员认为这是it部门的事情
- 缺乏数据治理组织和专业人才



**框架**

- DAMA-DMBOK
- DCMM
- DGI

​	**管理面、业务面、样本面、存储面**



大数据模型L0-L2

数据治理统一的数据语言L1-l5

人工智能汽车L0-L5



### DataArts



#### DataArts LakeFormation+**DataArts Studio**

![image-20240901100515876](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240901100515876.png)



**功能：数据集成、架构、开发、质量、资产管理、数据服务、数据安全**



### 计算机视觉-图像识别

1. 图像数字化：包含两个过程：采样和量化（将连续色调的图片转换为计算机可以识别的图像）

​	采样：将连续的图像变化为离散的点

​	量化：一副8位的图像表示每个采样点有2^8^ =256级

2. 灰度图表示

   ![image-20240901105336504](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240901105336504.png)

​	在数学上用一个矩阵进行图像存储，坐标在左上角



3. RGB三色图
4. HSV比RGB色彩更加丰富 

​	![image-20240901105605021](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240901105605021.png)

5. 其他颜色空间

![image-20240901105836424](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240901105836424.png)	6. 灰度化计算

​	![image-20240901110210774](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240901110210774.png)

呼叫强大的python库

7. 像素关系：每个像素上下左右叫4-邻域，对角线上的4个点为D-邻域，加一起叫8邻域

8. 灰度计算：**反转：黑变白，白变黑**    **对比度增强**：把数值放大  **对比度压缩**：把数值减小  **伽马矫正：背公式，指数变化**



### CNN卷积神经网络

输入层--卷积层--池化层--全连接层--输出层

### DNN深度神经网络

### RNN循环神经网络





### 语音处理

约定大于规范，规范大于编程

![image-20240901145301847](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240901145301847.png)

**在语音识别中最常见的语音特征是MFCC**

![image-20240901145609715](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240901145609715.png)



### 语音识别

最伟大的发明

![image-20240901150246235](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240901150246235.png)





### EM算法

![image-20240901151425040](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240901151425040.png)

![image-20240901151621993](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240901151621993.png)

boosting（自助算法-穿靴子要自己穿）



### 长短期记忆网络

![image-20240901153333185](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20240901153333185.png)

### GRU

将lstm的遗忘门和输入门合成为一个更新门，属于简化





## 第四天（好像已经学过了）

### 云计算优势

1. 按需自助
2. 广泛的网络接入
3. 资源池化，屏蔽底层硬件的差异性
4. 快速弹性伸缩，按需增加或者减少服务器的数量
5. 可计量服务，计量不等于收费



