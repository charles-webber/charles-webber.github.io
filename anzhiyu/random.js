var posts=["2022/10/29/answer/","2022/10/29/hello-world/","2022/10/29/good/"];function toRandomPost(){pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);};