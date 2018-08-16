/***
个人中心：过滤用户权限
***/

var express = require('express');

var router = express.Router();

var query = require('simple-mysql-query');

//测试
router.use(function(req,res,next){
	// req.session.user = { 
	// 	id: 1,
	//      username: '迅哥哥',
	//      avatar: null,
	//      useraccount: 'chrunlee',
	//      userpwd: '0b8d3104f46ce1ce884d3c494fac1b64',
	//      mobile: '',
	//      email: null,
	//      intro: null,
	//      role: '1' 
 // 	};
 	console.log('in center')
	if(req.session.user){

		next();
	}else{
		res.redirect('/');
	}
})
router.get('/',function(req,res,next){
	console.log('next home');
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
		sql : 'update site set sitename=?,faviconhref=?,sitedes=?,sitescan=?,publichref=?,authorname=?,avatar=?,email=?',params : [newObj.sitename,newObj.faviconhref,newObj.sitedes,newObj.sitescan,newObj.publichref,newObj.authorname,newObj.avatar,newObj.email]
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
			console.log(obj);
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
	res.json({
		success : true,
		rows : []
	});
})
//跳转到文章发布页面
router.get('/article/add',function(req,res,next){
	res.render('center/article/add');
})
module.exports = router;