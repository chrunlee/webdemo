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

var tool = require('../../util/tool');


//markdown 解析器
var renderer = new marked.Renderer();
//重写解析规则
renderer.link = function(href,title,text){
	return '<a href="'+href+'" title="'+text+'" target="_blank">'+text+'</a>';
}

var query = require('simple-mysql-query');

var moment = require('moment');

marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    silent : true,
    smartLists: true,
    smartypants: false

});

//文章列表
router.get('/',function(req,res,next){
	//最新文章信息，每页20条，后分页
	//获得文章分类
	var p = req.query.p || 1;
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
		res.render('index/article',{
			banner : banner,
			category : category,
			c :c,
			article : articles,
			total : all,
			page : p,
			site : this.mysite,
			github : req.session.github,
			d : {
				header : 'article'
			}
		});
	}).catch(function(err){
		res.redirect('/error/500');
	})
	
})

//文章详情页面
router.get('/:id.html',function(req,res,next){
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
			article.html = marked(content,{renderer : renderer});
			article.tags = article.tags ? article.tags.split(',') : [];
			res.render('index/detail',{
				article : article,
				site : this.mysite,
				github : req.session.github,
				links : rst2 || [],
				d : {
					header : 'article'
				}
			});
		}else{
			res.redirect('/error/404');
		}
	}).catch(function(){
		res.redirect('/error/404');
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
	var site = this.mysite,
		user = req.session.github;
	data.name = user.name;
	data.email = user.email||'';
	data.userid = user.id;
	data.toname = data.toname || '';
	if(data.articleId && data.content.length <= 1000 && data.name.length <= 20 && data.email.length <= 50 && data.toname.length <= 50){
		//评论后，立刻发邮件给我...
		//此处评论根据目标人来发送如果是评论的文章，直接发给我，如果是回复的某人，则发给某人（根据数据库的设置，是否发送。）
		var email = site.email;
		//还得查询文章的地址
		Promise.all([
			query({sql : 'select * from sys_user where id=(select userid from user_comment where id=?)',params : [data.toid]}),
			query({sql : 'select link,title from user_article where id=?',params : [data.articleId]})])
		.then(rs=>{
			var rs1 = rs[0],rs2 = rs[1];
			var email = site.email,link = site.domain,title = '某些文章';
			if(rs1[0].length > 0){
				email = rs1[0][0].email || site.email;
			}
			if(rs2[0].length > 0){
				var temp = rs2[0][0];
				link = site.domain + temp.link;
				title = temp.title;
			}
			return {
				email : email,
				title : title,
				link : link
			};
		})
		.then(obj=>{
			return tool.sendCommentEmail(obj.email,data.name,obj.title,obj.link);
		});
		query({
			sql : 'insert into user_comment (articleid,name,content,toid,ctime,email,toname,commentid,userid) values (?,?,?,?,?,?,?,?,?) ',
			params : [data.articleId,data.name,data.content,data.toid,moment(new Date()).format('YYYY-DD-MM HH:mm:ss'),data.email,data.toname,data.commentid,data.userid]
		})
		.then(function(rs){
			var rst = rs[0];
			var id = rst.insertId;
			res.json({success : true,id : id});
		}).catch(function(e){
			res.json({success:false,msg : '抱歉..服务器出了点问题'})
		})
	}else{
		res.json({success : false,msg : '数据不符合规范'})
	}
})
//获得所有评论，不分页
router.post('/getComment',function(req,res,next){
	var id = req.body.id;
	if(id){
		query({
			sql :'select t1.*,t2.avatar_url,(case when(t2.blog = '' or t2.blog is null) then t2.html_url else t2.blog end) as blog from user_comment t1 left join sys_user t2 on t1.userid=t2.id where t1.articleid=? order by ctime desc',
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
//关键字检索
router.get('/search',function(req,res,next){
	var referer = req.headers['referer'];
	var q = req.query.q;
	if(q.trim() == ''){
		//重新返回来源网页
		res.redirect(referer);
	}else{
		var strs = q.split(' ');
		var paramsSql = '',params = [];
		strs.forEach(a=>{
			a = a.trim();
			paramsSql += '  title like ? or content like ?  or ';
			params.push('%'+a+'%');
			params.push('%'+a+'%');
		});
		paramsSql = paramsSql.substr(0,paramsSql.length - 3);
		//对sql进行处理，空格分开的话重新处理
		query({
			sql : 'select * from user_article where ispublish=1 and type=0 and ('+paramsSql+')',
			params : params
		})
		.then(rs=>{
			var rst = rs[0];
			res.render('index/search',{
				site : this.mysite,
				github : req.session.github,
				d : {
					q : q,
					header : 'article',
					data : rst
				}
			});
		})
	}
});
module.exports = router;