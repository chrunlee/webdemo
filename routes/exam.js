var express = require('express');
var router = express.Router();
var fs = require('fs');
var query = require('../lib/sql');
/* GET home page. */
var ItemMap = {};
router.get('/get', function(req, res, next) {
	//查询出来保存到服务器，提交后清空
	var sql = [
	{
		sql : 'select * from tigan where ttype=0 order by rand() limit 40',
		params : []
	},{
		sql : 'select * from tigan where ttype=1 order by rand() limit 40',
		params : []
	},{
		sql : 'select * from tigan where ttype=2 order by rand() limit 10',
		params : []
	},{
		sql : 'select * from tigan where ttype=3 order by rand() limit 10'
	}
	];
	query(sql).then(function(list){
		var danxuan = list[0],
			duoxuan = list[1],
			panduan = list[2],
			jiexi = list[3];
		//然后将这些题目依次保存题号
		var ids = [];
		var rrr = {
			danxuan : danxuan,
			duoxuan : duoxuan,
			panduan : panduan,
			jiexi : jiexi,
			success : true
		};
		res.end(JSON.stringify(rrr));
	}).catch(function(err){
		//查询失败，给前台一个错误提示
		res.end(JSON.stringify({success : false,msg : '服务器错误'}));
	})
});

module.exports = router;
