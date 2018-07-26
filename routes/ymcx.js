var express = require('express');
var router = express.Router();
var fs = require('fs');

//读取到内存中
var data = require('../ym');
var pihaoArr = [];
//循环做一个map
var map = {};
data.forEach(function(list){
	//list foreach
	list.forEach(function(item){
		var hao = item.pihao;
		hao = hao.replace('疫苗批号：','').trim();
		pihaoArr.push(hao);
		var arr = map[hao] || [];
		arr.push(item);
		map[hao] = arr;
	});
});
//疫苗查询
router.post('/', function(req, res, next) {
	var pihao = req.body.pihao.trim();
	if(null != pihao && ""!= pihao){
		var rs = map[pihao] || [];
		res.end(JSON.stringify({
			success : true,
			msg : '查询成功',
			result : rs
		}))
	}else{
		res.end(JSON.stringify({
			success : false,
			msg : '请提交批号进行查询'
		}));
	}
});
router.get('/',function(req,res,next){
	var pihao = req.query.pihao.trim();
	if(null != pihao && ""!= pihao){
		var rs = map[pihao] || [];
		res.end(JSON.stringify({
			success : true,
			msg : '查询成功',
			result : rs
		}))
	}else{
		res.end(JSON.stringify({
			success : false,
			msg : '请提交批号进行查询'
		}));
	}
})
//查询关键字
router.get('/key',function(req,res,next){
	var key =  req.query.key|| '';
	//根据key返回list
	key = key.trim();
	if(key!= ''){
		var rs = [];
		var reg = new RegExp('^'+key);
		pihaoArr.forEach(function( item ){
			if(item.toLowerCase().match(reg)){
				rs.push(item);
			}
		});
		res.end(JSON.stringify(rs));
	}else{
		res.end('[]');
	}
})
module.exports = router;