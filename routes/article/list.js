/***
*
* 文章列表
*
****/

/***
个人中心：过滤用户权限
***/

var express = require('express');

var router = express.Router();

//文章列表
router.get('/',function(req,res,next){
	//最新文章信息，每页20条，后分页
	
	res.render('article/article',{
		site : this.mysite
	});
})

//文章详情页面
router.get('/:id.html',function(req,res,next){
	console.log(req.params.id);
	res.render('article/detail',{
		site : this.mysite
	});
})


module.exports = router;