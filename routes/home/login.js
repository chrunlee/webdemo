/***
个人中心：过滤用户权限
***/
var crypto = require('crypto');


var express = require('express');
var query = require('simple-mysql-query');

var router = express.Router();

router.get('/',function(req,res,next){
	if(req.session.user){
		res.redirect('/center/home');
	}else{
		res.render('login');//跳转登录	
	}
})

router.post('/',function(req,res,next){
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
router.get('/logout',function(req,res,next){
	req.session.user = null;
	res.redirect('/');
})
module.exports = router;