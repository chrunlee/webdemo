/*菜谱信息*/
var query = require('simple-mysql-query');

var express = require('express');
var router = express.Router();
var fs = require('fs');
query({
	port : '3306',
	host : '127.0.0.1',
	user : 'root',
	password : 'root',
	database : 'items'
});
router.all('/category',function(req,res,next){
	//返回所有的菜谱分类并归纳
	query({
		sql : 'select * from caipu_fenlei',
		params : []
	}).then(function(rs){
		var rst = rs[0];
		//循环处理
		var map = {};
		rst.forEach(function( item ){
			var category = item.category;
			var data = map[category] || [];
			data.push(item);
			map[category] = data;
		});
		var list = [];
		for(var c in map){
			list.push({
				name : c,
				data : map[c]
			});
		}
		res.end(JSON.stringify({
			success : true,
			msg : '请求成功',
			result : list
		}));

	}).catch(function(){
		res.end(JSON.stringify({
			success : false,
			msg : '对不起，服务器宕机了。'
		}));
	})
});
//根据分类获得简易信息
router.all('/item',function(req,res,next){
	var cid = req.body.cid || req.query.cid;
	if(cid){
		query({
			sql : 'select * from caipu_item where cid=? ',
			params : [cid]
		}).then(function(rs){
			var itemList = rs[0] || [];
			res.end(JSON.stringify({
				success : true,
				msg : '请求成功',
				result : itemList
			}));
		}).catch(function(err){
			res.end(JSON.stringify({
				success : false,
				msg : '对不起，服务器宕机了。'
			}));
		})
	}else{
		res.end(JSON.stringify({
			success : false,
			msg : '未传递类目参数'
		}));
	}
})
//根据分类获得菜系列表
router.get('/list',function(req,res,next){
	var cid = req.body.cid || req.query.cid;
	if(cid){
		query([{
			sql : 'select * from caipu_item where cid=? ',
			params : [cid]
		},{
			sql : 'select * from caipu_step where itemid in (select id from caipu_item where cid=?)',
			params : [cid]
		}]).then(function(rs){
			var itemList = rs[0] || [],
				stepList = rs[1] || [];
			//整合数据
			var map = {};
			stepList.forEach(function(item){
				var itemId = item.itemid;
				var arr = map[itemId] || [];
				arr.push(item);
				map[itemId] = arr;
			});
			itemList.forEach(function(item){
				var itemId = item.id;
				var arr = map[itemId] || [];
				arr.sort(function(a,b){
					return a.step - b.step;
				})
				item.steps = arr;
			});
			res.end(JSON.stringify({
				success : true,
				msg : '请求成功',
				result : itemList
			}));
		}).catch(function(err){
			res.end(JSON.stringify({
				success : false,
				msg : '对不起，服务器宕机了。'
			}));
		})
	}else{
		res.end(JSON.stringify({
			success : false,
			msg : '未传递类目参数'
		}));
	}
	
});
/*根据菜谱ID获得数据*/
router.all('/get',function(req,res,next){
	var id = req.body.id || req.query.id;
	if(id){
		query([{
			sql : 'select * from caipu_item where id=? ',
			params : [id]
		},{
			sql : 'select * from caipu_step where itemid=?',
			params : [id]
		}]).then(function(rs){
			var itemList = rs[0] || [],
				stepList = rs[1] || [];
			//整合数据
			var map = {};
			stepList.forEach(function(item){
				var itemId = item.itemid;
				var arr = map[itemId] || [];
				arr.push(item);
				map[itemId] = arr;
			});
			itemList.forEach(function(item){
				var itemId = item.id;
				var arr = map[itemId] || [];
				arr.sort(function(a,b){
					return a.step - b.step;
				})
				item.steps = arr;
			});
			res.end(JSON.stringify({
				success : true,
				msg : '请求成功',
				result : itemList
			}));
		}).catch(function(err){
			res.end(JSON.stringify({
				success : false,
				msg : '对不起，服务器宕机了。'
			}));
		})
	}else{
		res.end(JSON.stringify({
			success : false,
			msg : '未传递类目参数'
		}));
	}
})

module.exports = router;