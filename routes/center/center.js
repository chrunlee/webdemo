/***
个人中心：过滤用户权限
***/

var express = require('express');

var router = express.Router();

var query = require('simple-mysql-query');

var ImageUtil = require('../../util/ImageUtil');

var moment = require('moment');

var fs = require('fs');
//测试
router.use(function(req,res,next){
	if(req.session.user){
		next();
	}else{
		res.redirect('/');
	}
})
router.get('/',function(req,res,next){
	res.redirect('home');
})

//后台管理-首页
router.get('/home',function(req,res,next){
	res.render('center/home',{
		user : req.session.user
	})
});

//后台管理-站点属性
router.get('/site',function(req,res,next){
	res.render('center/site/list',{
		site : this.mysite
	})
});
//更新后台站点属性
router.post('/site/update',function(req,res,next){
	var body = req.body;
	var nowObj = this.mysite;
	var newObj = Object.assign(nowObj,body);
	//更新数据库
	query({
		sql : 'update site set sitename=?,faviconhref=?,sitedes=?,sitescan=?,publichref=?,authorname=?,avatar=?,email=?,zan=?,domain=?',params : [newObj.sitename,newObj.faviconhref,newObj.sitedes,newObj.sitescan,newObj.publichref,newObj.authorname,newObj.avatar,newObj.email,newObj.zan,newObj.domain]
	}).then(function(rs){
		this.mysite = newObj;
		//更新session user
		req.session.user = newObj;
		res.json({success : true});	
	}).catch(function(){
		res.json({success : true});
	})
})

//banner 设置
router.get('/banner',function(req,res,next){
	res.render('center/banner/list',{

	});
})
//跳转到新增页面
router.get('/banner/add',function(req,res,next){
	var id = req.query.id;
	var obj = {};
	if(id){
		query({
			sql : 'select * from user_banner where id=?',params : [id]
		}).then(function(rs){
			obj = rs[0][0] || {};
			res.render('center/banner/add',obj);
		}).catch(function(){
			res.render('center/banner/add',obj);
		})
	}else{
		res.render('center/banner/add',obj);
	}
	
})
//banner 获得列表信息
router.post('/banner/list',function(req,res,next){
	query({sql : 'select * from user_banner',params : []})
	.then(function(rs){
		var list = rs[0];
		res.json({
			success : true,
			rows : list
		})
	}).catch(function(){
		res.json({
			success : false,
			rows : []
		})
	});
})
//banner 保存
router.post('/banner/save',function(req,res,next){
	var data = req.body;
	var id = data.id;
	var queryobj = id ? {
		sql : 'update user_banner set title=?,bannerdes=?,bannerpath=?,bannerstyle=?,bannerheight=?,type=?,isenable=? where id=?',
		params : [data.title,data.bannerdes,data.bannerpath,data.bannerstyle,data.bannerheight,data.type,data.isenable,data.id]
	} : {
		sql : 'insert into user_banner (title,bannerdes,bannerpath,bannerstyle,bannerheight,type,isenable) values (?,?,?,?,?,?,?)',
		params : [data.title,data.bannerdes,data.bannerpath,data.bannerstyle,data.bannerheight,data.type,data.isenable]
	};
	query(queryobj)
	.then(function(rs){
		res.json({success : true});
	}).catch(function(){
		res.json({success : false});
	})
})
//banner 删除
router.post('/banner/delete',function(req,res,next){
	var id = req.body.id;
	if(id){
		query({
			sql : 'delete from user_banner where id=?',params : [id]
		}).then(function(rs){
			res.json({success : true})
		}).catch(function(){
			res.json({success : false})
		})
	}else{
		res.json({success : false})
	}
})

//友情链接
router.get('/links',function(req,res,next){
	res.render('center/links/list',{});
})

//获得所有的友情链接信息
router.post('/links/list',function(req,res,next){
	query({
		sql : 'select * from user_links order by id asc',params : []
	}).then(function(rs){
		var rst = rs[0];
		res.json({
			rows : rst,
			total : rst.length
		});
	})
})

//保存友情链接
router.post('/links/save',function(req,res,next){
	var data = req.body;
	if(data.id){
		query({
			sql : 'update user_links set name=?,href=? where id=? ',params : [data.name,data.href,data.id]
		}).then(function(rs){
			res.json({
				success : true,msg : '更新成功'
			})
		}).catch(function(){
			res.json({
				success : false,msg : '更新失败'
			})
		})
	}else{
		query({
			sql : 'insert into user_links (name,href) values (?,?) ',params : [data.name,data.href]
		}).then(function(){
			res.json({
				success : true,msg : '保存成功'
			})
		}).catch(function(){
			res.json({
				success : false,msg : '保存失败'
			})
		})
	}
})
//删除友情链接
router.post('/links/delete',function(req,res,next){
	var id = req.body.id;
	if(id){
		query({
			sql : 'delete from user_links where id=? ',params : [id]
		}).then(function(rs){
			res.json({
				success : true,msg : '删除成功'
			})
		}).catch(function(){
			res.json({
				success : false,msg : '失败'
			})
		})
	}else{
		res.json({
			success : false,msg : '失败'
		})
	}
})


//category 保存
router.get('/category',function(req,res,next){
	query({
		sql : 'select * from user_category',params : []
	}).then(function(rs){
		var rows = rs[0];
		res.render('center/category/list',{
			rows : rows
		});	
	}).catch(function(){
		res.render('center/category/list',{
			rows : []
		});	
	})
})
//类别信息保存
router.post('/category/save',function(req,res,next){
	var name = req.body.name;
	if(name){
		query({
			sql : 'insert into user_category (name) values (?)',params : [name]
		}).then(function(rs){
			res.json({success : true})
		}).catch(function(){
			res.json({success : false})
		})
	}else{
		res.json({success : false})
	}
})

//post 获得目录信息
router.post('/category/list',function(req,res,next){
	query({
		sql : 'select * from user_category',params : []
	}).then(function(rs){
		var category = rs[0];
		res.json(category);
	}).catch(function(){
		res.json([])
	});
})


/***

文章信息相关接口
--------------------------------------------------------------------------


***/
//列表页面
router.get('/article',function(req,res,next){

	res.render('center/article/list',{})
})
//文章列表post数据
router.post('/article/list',function(req,res,next){
	var data = req.body;
	var page = parseInt(data.page,10);
	var rows = parseInt(data.rows,10);
	query([
		{sql : 'select * from user_article order by id desc limit ?,?',params : [rows * (page-1),rows]},
		{sql : 'select count(1) as total from user_article',params : []}
	]).then(function(rs){
		var rst1 = rs[0],rst2 = rs[1];
		res.json({
			success : true,
			rows : rst1,
			total : rst2[0].total
		});
	}).catch(function(){
		res.json({
		success : true,
		rows : []
	});
	})

	
})
//跳转到文章发布页面
router.get('/article/add',function(req,res,next){
	//获得category
	var id = req.query.id;
	if(id){
		query([
			{sql : 'select * from user_article where id=?',params : [id]},
			{sql : 'select * from user_category',params : []}
		]).then(function(rs){
			var article = rs[0][0],
				category = rs[1];
			article.tags = (article.tags || '').split(',');
			article.tags = article.tags.filter(function(v){
				return v != '';
			});
			res.render('center/article/add',{
				article : article,
				category : category
			});	
		}).catch(function(){
			res.render('center/article/add',{
				category : [],article : {}
			});
		})
	}else{
		query({
			sql : 'select * from user_category',params : []
		}).then(function(rs){
			var rst = rs[0];
			res.render('center/article/add',{
				category : rst,
				article : {}
			});	
		}).catch(function(){
			res.render('center/article/add');
		})
	}
	
})
//保存文章基本信息
router.post('/article/save',function(req,res,next){
	var data = req.body;
	var sql = data.id ? {
		sql : 'update user_article set title=?,ismy=?,enname=?,postpath=?,zhaiyao=?,cancomment=?,type=?,category=?,ispublish=?,tags=?,link=? where id=?',
		params : [data.title,data.ismy,data.enname,data.postpath,data.zhaiyao,data.cancomment,data.type,data.category,data.ispublish,data.tags,data.link,data.id]
	} : {
		sql : 'insert into user_article (title,ismy,enname,postpath,zhaiyao,cancomment,type,category,ispublish,tags,link) values (?,?,?,?,?,?,?,?,?,?,?)',
		params : [data.title,data.ismy,data.enname,data.postpath,data.zhaiyao,data.cancomment,data.type,data.category,data.ispublish,data.tags,data.link]
	};
	query(sql)
	.then(function(rs){
		var rst = rs[0];
		res.json({
			id : data.id || rst.insertId,
			success : true
		});
	}).catch(function(){
		res.json({success : false});
	})
})
//保存更新文章的主体信息
router.post('/article/update',function(req,res,next){
	var data = req.body;
	if(data.id){
		query({
			sql : 'update user_article set content=? where id=? ',params : [data.content,data.id]
		}).then(function(rs){
			var rst = rs[0];
			res.json({success : true})
		})
	}else{
		res.json({success : false})
	}
})
//粘贴图片上传
router.post('/article/paste',function(req,res,next){
	var imgData = req.body.imgData;
	var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer(base64Data, 'base64');
    fs.writeFile(__dirname+'/../../public/upload/tmp/temp.png',dataBuffer,function(ee){
    	ImageUtil(req.session.user.id,{
	    	filePath : '/public/upload/tmp/temp.png',
	    	name : 'temp.png'
	    }).then(function(rs){
	    	res.end(rs);
	    }).catch(function(err){
	    	res.end('');
	    })
    })
})

//发布文章
router.post('/article/publish',function(req,res,next){
	var id = req.body.id;
	if(id){
		query({
			sql : 'update user_article set ispublish=1,ctime=? where id=?',params : [moment(new Date()).format('YYYY-MM-DD HH:mm'),id]
		}).then(function(rs){
			res.json({success : true})
		}).catch(function(){
			res.json({success : false})
		})
	}else{
		res.json({success : false})
	}
})

//取消发布文章
router.post('/article/cancel',function(req,res,next){
	var id = req.body.id;
	if(id){
		query({
			sql : 'update user_article set ispublish=0 where id=?',params : [id]
		}).then(function(rs){
			res.json({success : true})
		}).catch(function(){
			res.json({success : false})
		})
	}else{
		res.json({success : false})
	}
})

//删除文章
router.post('/article/delete',function(req,res,next){
	var id = req.body.id;
	if(id){
		query({
			sql : 'delete from user_article where id=?',params : [id]
		}).then(function(rs){
			res.json({success : true})
		}).catch(function(){
			res.json({success : false})
		})
	}else{
		res.json({success : false})
	}
})
//置顶文章
router.post('/article/recommend',function(req,res,next){
	var id = req.body.id;
	if(id){
		query({
			sql : 'update user_article set recommend=? where id=?',params : ['1',id]
		}).then(function(rs){
			res.json({success : true})
		}).catch(function(){
			res.json({success : false})
		})
	}else{
		res.json({success : false})
	}
})




//评论信息
router.get('/comment',function(req,res,next){
	res.render('center/comment/list',{});
})
//获得最新评论
router.post('/comment/list',function(req,res,next){
	var data = req.body;
	var page = parseInt(data.page,10);
	var rows = parseInt(data.rows,10);
	query([
		{sql : 'select t.id,c.link,t.name,t.content,t.ctime,t.email,t.toname,c.title from user_comment t left join user_article c on t.articleid=c.id order by ctime desc limit ?,?',params : [(page -1) * rows,rows]},
		{sql : 'select count(1) as total from user_comment ',params : []}
	]).then(function(rs){
		var rst = rs[0],
			total = rs[1][0].total;
		res.json({
			success : true,
			total : total,
			rows : rst
		});
	}).catch(function(err){
		res.json({success : false,rows : [],total : 0})
	})
})
//删除评论
router.post('/comment/delete',function(req,res,next){
	var id= req.body.id;
	if(id){
		query({
			sql : 'delete from user_comment where id=? ',params : [id]
		}).then(function(){
			res.json({success : true})
		}).catch(function(){
			res.json({success : false})
		})
	}else{
		res.json({success : false})
	}
})

router.get('*',function(req,res,next){
	res.redirect('/error/404');
})
module.exports = router;