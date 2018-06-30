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
		sql : 'select * from jiexi order by rand() limit 10'
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
//获取详细信息，如果是解析题目，则获取具体的小项目和选项
router.post('/get',function(req,res,next){
	var id = req.body.id,
		ttype = parseInt(req.body.ttype,10);
	//根据不同的题目类型查找数据，主要是选项
	var sql = {
		sql : 'select * from tiganitem where tiganid=? order by seq',
		params : [id]
	};
	if(ttype < 3){//0 1 2(判断题目)
		query(sql).then(function(list){
			var rs = list[0];
			res.end(JSON.stringify(rs));
		});
	}else if(ttype == 3){
		//解析题目
		var sql = [{
			sql : 'select * from tigan where jiexiid=? order by id asc',
			params : [id]
		},{
			sql : 'select * from tiganitem where tiganid in (select id from tigan where jiexiid=? ) order by seq asc',
			params : [id]
		}];
		query(sql).then(function(list){
			var tigan = list[0],item = list[1];
			//重新进行组装
			var arr = [];
			tigan.forEach(function(temp,index){
				//根据item查找选项
				var tiganId =temp.id;
				var tempList = [];
				item.forEach(function(temp2){
					if(temp2.tiganid == tiganId){
						tempList.push(temp2);
					}
				});
				temp.itemList = tempList;
				arr.push(temp);
			});
			res.end(JSON.stringify(arr));
		});
	}else{
		res.end(JSON.stringify([]));
	}
});

module.exports = router;
