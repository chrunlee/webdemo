var express = require('express');
var router = express.Router();
var fs = require('fs');

//读取到内存中
var data = require('../ym');

//循环做一个map
var map = {};
data.forEach(function(list){
	//list foreach
	list.forEach(function(item){
		var hao = item.pihao;
		hao = hao.replace('疫苗批号：','').trim();
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

module.exports = router;