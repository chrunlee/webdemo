var express = require('express');
var router = express.Router();

var query = require('simple-mysql-query');

/* GET home page. */
router.get('/', function(req, res, next) {
	
	//1.查询banner数据
	//2.查询博主推荐数据
	//3.查询DEMO数据
	query([
		{sql : 'select * from user_banner where type=1 and isenable=1 ',params : []},
		{sql : 'select * from user_article where ispublish=1 and type=0 order by readnum desc limit 0,8'},
		{sql : 'select * from user_article where ispublish=1 and type=1 order by likenum desc limit 0,8'}
	]).then(function(rs){
		var banners = rs[0],
			articles = rs[1],
			demos = rs[2];
		res.render('index', {
			banners : banners,
			articles : articles,
			demos : demos,
			site : this.mysite
		});
	}).catch(function(){
		res.redirect('error/500')
	})
});

module.exports = router;
