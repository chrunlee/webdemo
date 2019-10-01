/***
照片墙
***/

var express = require('express');

var router = express.Router();
var moment = require('moment');

var query = require('sqlquery-tool');

router.get('/',function(req,res,next){
	//随机获得9找照片
	query.query({
		sql : 'select * from user_record order by utime asc',params : []
	}).then(rs => {
		var rst = rs[0];
		//获得记录
		rst.map(function(item){
			var ctime = item.ctime;
			var fir = ctime.split(' ')[0];
			var year = fir.split('-')[0];
			var date = fir.split('-')[1]+'月'+fir.split('-')[2]+'号';
			item.year = year;
			item.day = date;
		});
		res.render('center/recorder/index',{
			user : req.session.user,
			albums : rst
		});
	}).catch(err=>{
		//获得记录
		res.render('center/recorder/index',{
			user : req.session.user,
			albums : []
		});
	})
})
//暂时关闭
// router.post('/save',function(req,res,next){
// 	var filePath = req.body.filePath,
// 		title = req.body.title,
// 		des = req.body.des;
// 	var userId = req.session.user.id;
// 	var year = req.body.year,month = req.body.month,day = req.body.day;
// 	var timestr = year+'-'+month+'-'+day;
// 	query({
// 		sql : 'insert into user_record (ctime,imgpath,title,des,utime) values (?,?,?,?,?) ',params : [timestr,filePath,title,des,new Date()]
// 	}).then(function(rs){
// 		res.json({
// 			success : true
// 		})
// 	}).catch(function(){
// 		res.json({success : false});
// 	})
// })

// //异步获取数据
// router.post('/get',(req,res,next) => {
// 	var userId = req.session.user.id;
// 	var page = req.body.page || 1;
// 	var start = (parseInt(page,10) -1) * 10 ;
// 	query({
// 		sql : 'select * from user_record where userid=? order by ctime desc limit ?,10',params : [userId,start]
// 	}).then( rs => {
// 		var rst = rs[0];
// 		res.json({
// 			success : true,
// 			rows : rst
// 		});
// 	}).catch( err => {
// 		res.json({
// 			success : false,
// 			rows : []
// 		});
// 	})
// })

// router.get('/add',function(req,res,next){
// 	res.render('center/recorder/add');
// })

module.exports = router;