//记录个人体重数据，并将数据保存到本地

var express = require('express');

var router = express.Router();

var path = require('path');
var fs = require('fs');

var filePath = path.join(__dirname,'../../public/demos/daily-weight/index.js');
var arr = require('../../public/demos/daily-weight/index.js').weight;

router.get('/',(req,res,next)=>{
	var weight = req.query.weight;
	if(req.session.user){
		var time = new Date();
		var y = time.getFullYear(),
		m = time.getMonth()+1,
		d = time.getDate();
		var str = y+'-'+m+'-'+d;
		var map = {};
		arr.forEach(item=>{
			map[itme.name] = item;
		});
		//对数据校验
		if(!map[str]){
			try{
				var num = parseFloat(weight);
				if(num < 80 || num > 95 ){
					//恶意数据,如果有一天我真的到了的话，我会改代码的。
				}else{
					arr.push({
						name : str,
						value : weight
					});
					var weightStr = JSON.stringify(arr);
					var fileContent = 
					`(function (global, factory) {typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :(typeof define === 'function' && define.amd ? define(['exports'], factory) : (factory(window)));}(this, (function (exports) {
					exports.weight = ${weightStr};
					})));`;
					fs.writeFileSync(filePath,fileContent);
				}
			}catch(){}
		}
		res.end('suc');
	}else{
		res.end('suc');
	}
})
module.exports = router;