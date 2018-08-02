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
	var start = req.body.start || req.query.start || 0;
	var pagesize = req.body.pagesize || req.query.pagesize || 10;
	try{
		start = parseInt(start,10)
	}catch(e){start = 0;}
	try{
		pagesize = parseInt(pagesize,10);
	}catch(e){pagesize=10;}
	if(cid){
		query({
			sql : 'select * from caipu_item where cid=? limit ?,?',
			params : [cid,start,pagesize]
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

/*根据菜名模糊查询*/
router.all('/find',function(req,res,next){
	var name = req.body.name || req.query.name;
	var start = req.body.start || req.query.start || 0;
	var pagesize = req.body.pagesize || req.query.pagesize || 10;
	try{
		start = parseInt(start,10)
	}catch(e){start = 0;}
	try{
		pagesize = parseInt(pagesize,10);
	}catch(e){pagesize=10;}
	if(name){
		query({
			sql : 'select * from caipu_item where title like ? or ingredients like ? limit ?,?',
			params : ['%'+name+'%','%'+name+'%',start,pagesize]
		})
		.then(function(rs){
			var rst = rs[0];
			res.end(JSON.stringify({
				success : true,
				msg : '请求成功',
				result : rst
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
			msg : '未传递关键词参数'
		}));
	}
})
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


/**菜谱相关的页面处理**/
router.get('/home',function(req,res,next){
	res.render('caipu/home');
})

//三级详情页面
router.get('/show/:id',function(req,res,next){
	var id = req.params.id || '';
	//根据ID，查询，如果没有，从数据库随机3个菜谱
	if(id){
		var sqlopt = [{
			sql : 'select * from caipu_item where id=? ',
			params : [id.trim()]
		},{
			sql : 'select * from caipu_step where itemid=? order by seq',
			params : [id.trim()]
		},{
			sql : 'select * from caipu_item where category=(select category from caipu_item where id=?) order by rand() limit 0,3',
			params : [id.trim()]
		}];
		query(sqlopt).then(function(rs){
			var caipuObj = rs[0][0];
			var steps = rs[1];
			var links = rs[2];
			//对caipuObj进行处理
			caipuObj.tags = caipuObj.tags.split(';');
			caipuObj.ingredients = caipuObj.ingredients.split(';').map(function(item){
				var arr = item.split(',');
				return {
					name :arr[0] || '',
					num : arr[1] || ''
				}
			});
			caipuObj.burden = caipuObj.burden.split(';').map(function(item){
				var arr = item.split(',');
				return {
					name :arr[0] || '',
					num : arr[1] || ''
				}
			});
			res.render('caipu/detail',{
				caipu : caipuObj,
				steps : steps,
				links : links
			});
		}).catch(function(err){
			res.redirect('caipu/error');
		})
	}else{
		res.redirect('caipu/error');
	}
})
module.exports = router;