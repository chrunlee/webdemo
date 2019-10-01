/***
个人中心：过滤用户权限
***/

var express = require('express');

var router = express.Router();

var query = require('sqlquery-tool');

var ImageUtil = require('../../util/ImageUtil');

var moment = require('moment');

var uuid = require('node-uuid');

var axios = require('axios');

var fs = require('fs');
var path = require('path');
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
		site : req.session.mysite
	})
});
//更新后台站点属性
router.post('/site/update',function(req,res,next){
	var body = req.body;
	var nowObj = req.session.mysite;
	var newObj = Object.assign(nowObj,body);
	//更新数据库
	query.query({
		sql : 'update site set sitename=?,faviconhref=?,sitedes=?,sitescan=?,publichref=?,authorname=?,avatar=?,email=?,zan=?,domain=?',params : [newObj.sitename,newObj.faviconhref,newObj.sitedes,newObj.sitescan,newObj.publichref,newObj.authorname,newObj.avatar,newObj.email,newObj.zan,newObj.domain]
	}).then(function(rs){
		req.session.mysite = newObj;
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
		query.query({
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
	query.query({sql : 'select * from user_banner',params : []})
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
	query.query(queryobj)
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
		query.query({
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
	query.query({
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
		query.query({
			sql : 'update user_links set name=?,href=?,iconpath=? where id=? ',params : [data.name,data.href,data.iconpath,data.id]
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
		query.query({
			sql : 'insert into user_links (name,href,iconpath) values (?,?,?) ',params : [data.name,data.href,data.iconpath]
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
		query.query({
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
	query.query({
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
		query.query({
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
	query.query({
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
	query.query([
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
		query.query([
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
		query.query({
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
	query.query(sql)
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
		query.query({
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
		query.query({
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

//推送到熊掌号
router.post('/article/baidu',function(req,res,next){
	var id = req.body.id;
	if(id){
		query.query({
			sql : 'select * from user_article where id=?',params : [id]
		}).then(function(rs){
			var obj = rs[0][0];
			var url = 'https://chrunlee.cn'+ obj.link;
			axios.post('http://data.zz.baidu.com/urls?appid=1611479274533915&token=qjNaEG5dUPtn1nJG&type=realtime',url)
			.then(rs=>{
				res.json({success : true,msg:'推送成功<'+JSON.stringify(rs.data)+'>'})	
			}).catch(e=>{
				res.json({success : false,msg : '推送失败'})	
			})
		}).catch(function(e){
			res.json({success : false,msg : '推送失败'})
		})
	}else{
		res.json({success : false,msg : '没有文章记录'})
	}
})

//取消发布文章
router.post('/article/cancel',function(req,res,next){
	var id = req.body.id;
	if(id){
		query.query({
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
		query.query({
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
		query.query({
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
	query.query([
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
		query.query({
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


//------------ 心愿单管理--------------//
//跳转一系列的页面
router.get('/wish/list',(req,res,next)=>{
	res.render('center/wish/list',{});
})
router.get('/wish/option/:id',(req,res,next)=>{
	res.render('center/wish/option',{id : req.params.id})
})
router.get('/wish/option/add/:id',(req,res,next)=>{
	res.render('center/wish/add',{wishid : req.params.id});
})
//获得系列单
router.post('/wish/list',(req,res,next)=>{
	query.query({
		sql : 'select * from wish_list',params : []
	})
	.then(rs=>{
		res.json({
			code : 200,
			rows : rs[0]
		});
	})
})
//获取心愿单
router.post('/wish/option',(req,res,next)=>{
	var id = req.body.id;
	query.query({
		sql : 'select * from wish_list_option where wishid=?',params : [id]
	})
	.then(rs=>{
		res.json({
			code : 200,
			rows : rs[0]
		});
	})
})
//心愿系列保存
router.post('/wish/save',(req,res,next)=>{
	var data = req.body;
	query.query({
		sql : 'insert into wish_list (name,bgfilepath) values (?,?)',
		params : [data.name,data.path]
	})
	.then(rs=>{
		res.json({
			code : 0,
			msg : '保存成功'
		});
	})
	.catch(err=>{
		res.json({code : 500,msg : '保存失败'});
	})
})
//心愿系列删除
router.post('/wish/delete',(req,res,next)=>{
	var id = req.body.id;
	query.query({
		sql : 'delete from wish_list where id=?',
		params : [id]
	})
	.then(rs=>{
		res.json({
			code : 0,
			msg : '删除成功'
		});
	})
	.catch(err=>{
		res.json({code : 500,msg : '删除失败'});
	})
})
//心愿删除
router.post('/wish/option/delete',(req,res,next)=>{
	var id = req.body.id;
	query.query({
		sql : 'delete from wish_list_option where id=?',params : [id]
	})
	.then(rs=>{
		res.json({success : true});
	})
})
//心愿保存
router.post('/wish/option/save',(req,res,next)=>{
	var data = req.body;
	//分为更新或新增
	if(data.id == '' || data.id == null || data.id == undefined){
		query.query({
			sql : 'insert into wish_list_option (title,filepath,createtime,wishid,status) values (?,?,?,?,?)',
			params : [data.title,data.filepath,new Date(),data.wishid,'0']
		})
		.then(rs=>{
			res.json({
				code : 0,
				success : true,
				msg : '保存成功'
			});
		})
	}else{
		query.query({
			sql : 'update wish_list_option set title=?,filepath=?,createtime=?,wishid=? where id=?',
			params : [data.title,data.filepath,new Date(),data.wishid,data.id]
		})
		.then(rs=>{
			res.json({
				code : 0,
				success : true,
				msg : '更新成功'
			});
		})
	}
})
//心愿达成
router.post('/wish/option/answer',(req,res,next)=>{
	var id = req.body.id,answer = req.body.answer;
	query.query({
		sql : 'update wish_list_option set answer=?,answertime=?,status=? where id=?',
		params : [answer,new Date(),1,id]
	})
	.then(rs=>{
		res.json({success : true});
	})
});




//-----我的相册系列------//
router.get('/album/list',(req,res,next)=>{
	var rows = 100;
	try{
		var start = parseInt(req.query.p || 1);
		var config = require('../../json/config');
		var album = config.album;
		//获得列表信息，然后展示图片数据和名称
		var fileList = fs.readdirSync(album.path);
		var newList = fileList.map(function(item){
			var absPath = album.prefix+item;
			var realPath = path.join(album.path,item);
			var stats = fs.statSync(realPath);
			var times = stats.atimeMs;
			return {
				path : absPath,
				time : times
			}
		})
		//newList sort
		newList.sort(function(a,b){
			return b.time - a.time;
		})
		var count = newList.length;
		//分页。
		var nextList = newList.splice( (start-1)*rows ,rows );
		res.render('center/album/list',{
			data : nextList,
			next : start*rows > count ? 1 : start+1
		});
	}catch(e){
		res.end(e.toString())
	}	
})
router.get('/album/list/clear/chrunlee',(req,res,next)=>{
	//clear
	var config = require('../../json/config');
	var album = config.album;
	//获得列表信息，然后展示图片数据和名称
	var fileList = fs.readdirSync(album.path);
	fileList.forEach(function(item){
		fs.unlinkSync(path.join(album.path,item));
	})
	var newList = fileList.map(function(item){
		return album.prefix+item;
	})
	res.end('clear');
})
router.get('/album/delete',(req,res,next)=>{
	var id = req.query.p;
	var filePath = path.join(__dirname,'../../public',id);
	fs.unlinkSync(filePath);
	res.end('suc');
})

//商品相关---------------start
router.get('/shop/list', (req,res,next)=>{
	res.render('center/shop/list');
});
router.post('/shop/list',(req,res,next)=>{
	query.query({
		sql : 'select * from order_goods',params : []
	})
	.then(rs=>{
		res.json({
			rows : rs[0],
			total : rs[0].length,
			success : true
		})
	})
})

//添加商品
router.get('/shop/list/add',(req,res,next)=>{
	if(req.query.id){
		query.query([
			{sql : 'select * from order_goods where id=?',params : [req.query.id]}
		]).then(function(rs){
			var article = rs[0][0];
			article.types = (article.type || '').split(',');
			article.types = article.types.filter(function(v){
				return v != '';
			});
			res.render('center/shop/add',{
				article : article
			});	
		}).catch(function(e){
			console.log(e);
			res.render('center/shop/add',{article : {}});
		})
	}else{
		res.render('center/shop/add',{article : {}});
	}
	
})
//商品内容更新
router.post('/shop/list/update',(req,res,next)=>{
	var data = req.body;
	if(data.id){
		query.query({
			sql : 'update order_goods set description=? where id=? ',params : [data.content,data.id]
		}).then(function(rs){
			var rst = rs[0];
			res.json({success : true})
		})
	}else{
		res.json({success : false})
	}
})
//保存商品基本信息
router.post('/shop/list/save',function(req,res,next){
	var data = req.body;
	console.log(data);
	var isnew = false;
	if(!data.id){
		data.id = uuid.v4().toString();
		isnew = true;
	}
	console.log(isnew);
	var sql = !isnew ? {
		sql : 'update order_goods set name=?,description=?,price=?,content=?,status=?,picpath=?,type=?,updatetime=? where id=?',
		params : [data.name,data.description,data.price,data.content,data.status,data.picpath,data.type,new Date(),data.id]
	} : {
		sql : 'insert into order_goods (id,name,description,price,content,status,picpath,type,updatetime) values (?,?,?,?,?,?,?,?,?)',
		params : [data.id,data.name,data.description,data.price,data.content,data.status,data.picpath,data.type,new Date()]
	};
	query.query(sql)
	.then(function(rs){
		var rst = rs[0];
		res.json({
			id : data.id,
			success : true
		});
	}).catch(function(e){
		console.log(e);
		res.json({success : false});
	})
})
//删除商品
router.post('/shop/list/delete',function(req,res,next){
	var id = req.body.id;
	if(id){
		query.query({
			sql : 'delete from order_goods where id=?',params : [id]
		}).then(function(rs){
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