var posts=["2023/01/05/SRE/","2022/10/29/answer/","2023/01/05/python学习/","2022/11/15/从0开始学习c语言/","2022/12/10/栈的定义/","2023/09/26/计算机网络笔记/","2022/11/27/预习作业：/"];function toRandomPost(){pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);};