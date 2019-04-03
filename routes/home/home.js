var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var query = require('simple-mysql-query');

/* GET home page. */
router.get('/', function(req, res, next) {
	
	//1.查询banner数据
	//2.查询博主推荐数据
	//3.查询DEMO数据
	query([
		{sql : 'select * from user_banner where type=1 and isenable=1 ',params : []},
		{sql : 'select * from user_article where ispublish=1 and type=0 and recommend=1 order by ctime desc limit 0,8'},
		{sql : 'select * from user_article where ispublish=1 and type=1 order by likenum desc limit 0,8'}
	]).then(function(rs){
		var banners = rs[0],
			articles = rs[1],
			demos = rs[2];
		res.render('index/index', {
			banners : banners,
			articles : articles,
			demos : demos,
			site : this.mysite,
			github : req.session.github,
			d : {
				header : 'home'
			}
		});
	}).catch(function(){
		res.redirect('error/500')
	})
});
//关于-我
router.get('/about',function(req,res,next){
	res.render('index/about',{
		site : this.mysite,
		github : req.session.github,
		d : {
			header : 'about'
		}
	});
});
//demo
router.get('/demo',function(req,res,next){
	res.render('demos/index',{
		site : this.mysite,
		github : req.session.github,
		d : {
			header : 'demo'
		}
	});
});

//登录管理中心
router.get('/login',function(req,res,next){
	if(req.session.user){
		res.redirect('/center/home');
	}else{
		res.render('index/login');//跳转登录	
	}
})
//登录管理中心
router.post('/login',function(req,res,next){
	var md5 = crypto.createHash('md5')
	var user = req.body.user,
		pwd = req.body.pwd || '';
	pwd = pwd.trim();
	//加密pwd,检索帐号信息
	md5.update(pwd);
	var pwd2 = md5.digest('hex');
	if(this.mysite.superaccount === user && this.mysite.superpwd === pwd2){
		//登录成功
		req.session.user = this.mysite;
		res.redirect('/center/home');
	}else{
		res.render('login',{
			msg : '登录失败，用户名或密码不正确',
			user : user,
			pwd : pwd
		})
	}
});

module.exports = router;
