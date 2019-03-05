//记录个人体重数据，并将数据保存到本地

var express = require('express');

var router = express.Router();

var path = require('path');
var fs = require('fs');

var query = require('sqlquery-tool');

router.get('/',async (req,res,next)=>{
	var weight = req.query.weight;
	var arr = await query.search('other_weight').order({column : 'id',order : 'asc'}).list();
	console.log(arr);
	res.json({
		data : arr
	});
})
router.get('/save',async (req,res,next)=>{
	var weight = req.query.weight;
	if(req.session.user){
		try{
			var d = new Date();
			var str = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
			var weightNum = parseFloat(weight);
			var current =await query.search('other_weight').where({str : str}).list();
			if(current.length  == 0){
				await query.search('other_weight').insert({str : str,weight : weightNum});
			}
		}catch(e){}
	}
	res.end('suc');
})
module.exports = router;