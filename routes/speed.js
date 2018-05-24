var express = require('express');
var router = express.Router();
var sql = require('../lib/sql');
var moment = require('moment');
/* GET home page. */
router.post('/name', function(req, res, next) {
	
	//检查是否有重名，如果没有则保存
	var name = req.body.name;
	var list = {
		sql : 'select * from speed where name=?',
		params : [name]
	};
	var rs = {success : false,msg : 'sorry ，服务器抽风了..请谅解'};
	sql(list).then(function( rst ){
		rst = rst[0];
		if(rst.length > 0){//存在
			rs = {
				success : false,
				msg : 'sorry,这个名字热度太高.已被占用,换个吧亲！'
			};
			res.end(JSON.stringify(rs));
		}else{
			//保存
			var list2 = {
				sql : 'insert into speed (name,usetime,createtime) values (?,-1,?)',
				params : [name,new Date()]
			};

			sql(list2).then(function(rst){
				rs = {
					success : true
				};
				res.end(JSON.stringify(rs));
			}).catch(function(){
				res.end(JSON.stringify(rs))
			})
		}
	}).catch(function(e){
		res.end(JSON.stringify(rs))
	});
});


router.post('/score',function(req,res,next){
	var name = req.body.user;
	var diff = req.body.time;//保存
	var list = {
		sql : 'insert into speed (name,usetime,createtime) values (?,?,?)',
		params : [name,diff,new Date()]
	};
	var rs = {
		success : false,
		msg : 'sorry,服务器出错了..本次排名看不到了'
	};
	sql(list).then(function(rst){
		//获得ID
		console.log(rst);
		var id = rst[0].insertId;
		var list2 = [{
			sql : 'select rank from (select id,name,usetime,(@ranknum:=@ranknum+1) as rank from speed,(select (@ranknum :=0) ) b  order by usetime asc) z where z.id = ?',
			params :[id]
		},{
			sql : 'select count(1) as total from speed '
			,params : []
		}
		];
		sql(list2).then(function(rst2 ){
			console.log(rst2);
			var rank= rst2[0],total = rst2[1];
			rank = rank[0].rank;
			total = total[0].total;
			//calc
			var per = Math.floor(((total - rank ) / total )* 100);
			per = Math.max(per,0);
			per = Math.min(per,100);
			rs.success = true;
			rs.msg = '您的手速蹂躏了<span class="num">'+per+'%</span>的人，当前排名<span class="num">'+rank+'</span>.<br />';
			res.end(JSON.stringify(rs));
		}).catch(function(e){
			res.end(JSON.stringify(rs));
		})	
	}).catch(function(e){
		res.end(JSON.stringify(rs));
	})
})

router.get('/rank',function(req,res,next){
	var list = {
		sql : 'select id,name,usetime,(@ranknum:=@ranknum+1) as rank,createtime from speed,(select (@ranknum :=0) ) b where usetime > 0 order by usetime asc',
		params : []
	};
	sql(list).then(function(rs){
		console.log(rs);
		var rst = rs[0];
		//循环处理
		var ranklist = rst.map(function(item){
			var usetime = item.usetime;
			//str
			var allms = parseInt(usetime);
			var ms = allms % 1000;
			var sec = Math.floor( allms / 1000);
			var min = '';
			if(sec > 59){
				min = Math.floor(sec / 60)+':';
				sec = sec % 60;
			}
			var usetimestr = min+sec+'.'+ms;
			item.usetime = usetimestr;
			item.createtime = moment(item.createtime).format('YYYY-MM-DD HH:mm:ss');
			return item;
		})
		res.render('demos/rank',{ranklist : ranklist})
	}).catch(function(e){
		next(e);
	})
})

module.exports = router;
