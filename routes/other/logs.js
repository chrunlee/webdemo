/*绘图-日志信息，比例等*/
/***
1.最近24小时的每分钟的请求数量记录，曲线图--动态的

2.分析不同操作系统，做天，7天内，1月内

3.分析不同的浏览器，做天，7天内，1月内

4.分析IP地址，根据IP获得地理位置，然后做一个地图，7天，1月内

***/
var express = require('express');

var router = express.Router();

var query = require('simple-mysql-query');

router.get('/',function(req,res,next){
	if(req.session.user){
		res.render('other/logs/index');
	}else{
		res.redirect('/');
	}
})

/**截止到目前为止24小时内数据--折线图**/
router.post('/day',function(req,res,next){
	query({
		sql : "SELECT DATE_FORMAT(ctime,'%Y-%m-%d %H:%i') as ctime,count(1) as num FROM demo_logs t WHERE  t.ctime>DATE_ADD(NOW(), INTERVAL -1440 MINUTE) group by ctime order by ctime asc ",
		params : []
	}).then(function(rs){
		var rst = rs[0];
		res.end(JSON.stringify(rst));
	}).catch(function(){
		res.end('[]');
	});
});
//分析不同操作系统
router.post('/os',function(req,res,next){
	var type = req.body.type || 'day';
	var min = 1440;
	if(type == 'week'){
		min = 1440 * 7;
	}else if(type == 'month'){
		min = 1440 * 30;
	}
	query({
		sql : 'select xitong,count(1) as num from demo_logs t where t.ctime>DATE_ADD(NOW(), INTERVAL -'+min+' MINUTE) group by xitong',
		params : []
	}).then(function(rs){
		var rst = rs[0];
		res.end(JSON.stringify(rst));
	}).catch(function(){
		res.end(JSON.stringify('[]'));
	})
});
//分析不同浏览器
router.post('/browser',function(req,res,next){
	var type = req.body.type || 'day';
	var min = 1440;
	if(type == 'week'){
		min = 1440 * 7;
	}else if(type == 'month'){
		min = 1440 * 30;
	}
	query({
		sql : 'select browser,count(1) as num from demo_logs t where t.ctime>DATE_ADD(NOW(), INTERVAL -'+min+' MINUTE) group by browser',
		params : []
	}).then(function(rs){
		var rst = rs[0];
		res.end(JSON.stringify(rst));
	}).catch(function(){
		res.end(JSON.stringify('[]'));
	})
});
//分析不同地理位置
router.post('/location',function(req,res,next){
	var type = req.body.type || 'day';
	var min = 1440;
	if(type == 'week'){
		min = 1440 * 7;
	}else if(type == 'month'){
		min = 1440 * 30;
	}
	query({
		sql : 'select region,count(1) as num from demo_logs t where t.ctime>DATE_ADD(NOW(), INTERVAL -'+min+' MINUTE) group by region',
		params : []
	}).then(function(rs){
		var rst = rs[0];
		res.end(JSON.stringify(rst));
	}).catch(function(){
		res.end(JSON.stringify('[]'));
	})
})
//分析不同地理位置
router.post('/path',function(req,res,next){
	var type = req.body.type || 'day';
	var min = 1440;
	if(type == 'week'){
		min = 1440 * 7;
	}else if(type == 'month'){
		min = 1440 * 30;
	}
	query({
		sql : 'select url,count(1) as num from demo_logs t where t.ctime>DATE_ADD(NOW(), INTERVAL -'+min+' MINUTE) group by url order by num desc limit 0,10',
		params : []
	}).then(function(rs){
		var rst = rs[0];
		res.end(JSON.stringify(rst));
	}).catch(function(){
		res.end(JSON.stringify('[]'));
	})
})

module.exports = router;