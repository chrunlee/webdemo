//github 登录
var express = require('express');
var router = express.Router();

var query = require('simple-mysql-query');

var {github} = require('../../json/config');
var superagent = require('superagent');


router.get('/',function(req,res,next){
	console.log('login');
	var code = req.query.code;
	var state = req.query.state;
	var redirectURL = req.session.loginRefer||'/';
	superagent.post('https://github.com/login/oauth/access_token')
	.set('Accept', 'application/json')
	.send({
		"client_id":github.clientId,
		"client_secret":github.secret,
		"code":code,
		"state":state
	})
	.then(function(res2){
		return JSON.parse(res2.text);
	})
	.then(function(obj){
		return superagent.get('https://api.github.com/user?access_token='+obj.access_token);
	})
	.then(function(res2){
		return JSON.parse(res2.text);
	})
	.then(function(user){
		//授权成功，检查用户是否存在，然后更新数据，更新session，跳转首页
		query({sql : 'select count(1) as num from sys_user where id=?',params : [user.id]})
		.then(rs=>{
			var rst = rs[0],obj = rst[0];
			if(obj.num > 0){//已经存在更新
				return query({
					sql : 'update sys_user set avatar_url=?,login=?,name=?,company=?,blog=?,location=?,email=?,bio=?,public_repos=?,public_gists=?,followers=?,following=?,html_url=? where id=?',
					params : [user.avatar_url,user.login,user.name,user.company,user.blog,user.location,user.email,user.bio,user.public_repos,user.public_gists,user.followers,user.following,user.html_url,user.id]
				});
			}else{//插入数据
				return query({
					sql : 'insert into sys_user (id,avatar_url,login,name,company,blog,location,email,bio,public_repos,public_gists,followers,following,html_url) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
					params : [user.id,user.avatar_url,user.login,user.name,user.company,user.blog,user.location,user.email,user.bio,user.public_repos,user.public_gists,user.followers,user.following,user.html_url]
				});
			}
		})
		.then(rs=>{
			//检查用户是否存在，不存在，则保存，然后将session保存
			req.session.github = user;
			if(user && user.name == 'chrunlee'){//我是管理员
				console.log('super admin logined');
				// req.session.user = user;
			}
			//重新跳转回原来的地址
			res.redirect(redirectURL);
		})
	}).catch(err=>{
		console.log('github 登录报错'+err.msg||'');
		//跳转到授权失败的页面
		res.redirect('/');
	})
})
/* GET home page. */
router.get('/login', function(req, res, next) {
	//获取clientId进行重定向

	var redirectURL = req.headers.referer;
	console.log(redirectURL)
	var state = (new Date()).valueOf();
	req.session.loginRefer = redirectURL;
	var url = `https://github.com/login/oauth/authorize?client_id=${github.clientId}&scope=${github.scope}&state=${state}`;
	res.redirect(url);
});
//自动登录
router.post('/auto',function(req,res,next){
	var id = req.body.id;
	console.log(id);
	if(id){
		query({
			sql : 'select * from sys_user where id=?',params : [id]
		})
		.then(rs=>{
			var user = rs[0][0];
			req.session.github = user;
			console.log(user);
			// if(user && user.name == 'chrunlee'){//我是管理员
			// 	req.session.user = user;
			// }
			res.json({success : true})
		}).catch(err=>{
			res.json({success : false})
		})
	}else{
		res.json({success : false})
	}
});
module.exports = router;
