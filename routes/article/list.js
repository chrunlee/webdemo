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

var marked = require('marked');

var query = require('simple-mysql-query');

var moment = require('moment');

marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: false,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false

});

//文章列表
router.get('/',function(req,res,next){
	//最新文章信息，每页20条，后分页
	//获得文章分类
	var p = req.query.q || 1;
	var c = req.query.c||'';//分类
	try{
		p = parseInt(p,10);	
		p = Math.max(p,1);
	}catch(e){
		p = 1;
	}
	var start = (p-1)*20;
	query([
		//轮播
		{sql : 'select * from user_banner where type=2 and isenable=1',params : []},
		//分类
		{sql :'select * from user_category ',params : []},
		//文章
		{sql : 'select * from user_article where ispublish=1 and type=0 '+(c ? ' and category=? ' : '')+' order by ctime desc limit ?,20',params : c ? [c,start] : [start]},
		//总数
		{sql : 'select count(*) as total from user_article where ispublish=1 and type=0 '+(c ? ' and category=? ' : '') + ' order by ctime desc',params : c ? [c] : []}
	]).then(function(rs){
		var banner = rs[0],
			category = rs[1],
			articles = rs[2],
			counts = rs[3];
		var all = counts[0].total;
		res.render('article/article',{
			banner : banner,
			category : category,
			c :c,
			article : articles,
			total : all,
			page : p,
			site : this.mysite
		});
	}).catch(function(err){
		res.render('500');
	})
	
})

//文章详情页面
router.get('/:id.html',function(req,res,next){
	console.log(req.params.id);
	var enname = req.params.id;
	//查询文章本身的信息，作者的信息，关联的文章，评论
	query([{
		sql : 'select * from user_article where enname=?',params : [enname]
	},{
		sql : 'select * from user_article where ispublish=1 and type =0 and enname!=? and category=(select category from user_article where enname=?) order by rand() limit 0,8',
		params : [enname,enname]
	}]).then(function(rs){
		var rst = rs[0];
		var rst2 = rs[1];
		if(rst.length > 0){
			var article = rst[0];
			//后台渲染markdown内容
			var content = article.content;
			article.html = marked(content);
			res.render('article/detail',{
				article : article,
				site : this.mysite,
				links : rst2 || []
			});
		}else{
			res.render('404');
		}
	}).catch(function(){
		res.render('404',{
			site : this.mysite
		});
	})
})

//点赞
router.post('/zan',function(req,res,next){
	var id = req.body.id;
	if(id){
		query({
			sql : 'update user_article set likenum=(likenum+1) where id=?',params : [id]
		}).then(function(){
			res.json({success : true})
		}).catch(function(){
			res.json({success : false})
		})
	}else{
		res.json({success : false})
	}
})

//保存评论
router.post('/saveComment',function(req,res,next){
	var data = req.body;
	console.log(data);
	data.email = data.email || '';
	data.toname = data.toname || '';
	if(data.articleId && data.content.length <= 1000 && data.name.length <= 20 && data.email.length <= 50 && data.toname.length <= 50){
		//继续保存
		query({
			sql : 'insert into user_comment (articleid,name,content,toid,ctime,email,toname,commentid) values (?,?,?,?,?,?,?,?) ',
			params : [data.articleId,data.name,data.content,data.toid,moment(new Date()).format('YYYY-DD-MM HH:mm:ss'),data.email,data.toname,data.commentid]
		}).then(function(rs){
			var rst = rs[0];
			var id = rst.insertId;
			res.json({success : true,id : id});
		}).catch(function(){res.json({success:false,msg : '抱歉..服务器出了点问题'})})
	}else{
		res.json({success : false,msg : '数据不符合规范'})
	}
})
//获得所有评论，不分页
router.post('/getComment',function(req,res,next){
	var id = req.body.id;
	if(id){
		query({
			sql :'select * from user_comment where articleid=? order by ctime desc',
			params : [id]
		}).then(function(rs){
			var rst = rs[0];
			res.json(rst);
		}).catch(function(){
			res.json([]);
		})
	}else{
		res.json([]);
	}
})

//增加阅读次数
router.post('/read',function(req,res,next){
	if(req.body.id){
		query({
			sql : 'update user_article set readnum=(readnum+1) where id=?',params : [req.body.id]
		}).then(function(){
			res.json({success:true});
		}).catch(function(){
			res.json({success:true});
		})
	}else{
		res.json({success:true});
	}
})

module.exports = router;