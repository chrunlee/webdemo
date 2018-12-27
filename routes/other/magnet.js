var express= require('express');

var router = express.Router();

var query = require('simple-mysql-query');

function format(  size, pointLength, units ){
	var unit;
    units = units || [ 'B', 'KB', 'M', 'G', 'TB' ];

    while ( (unit = units.shift()) && size > 1024 ) {
        size = size / 1024;
    }
    return (unit === 'B' ? size : size.toFixed( pointLength || 2 )) + unit;
}

router.get('/',(req,res,next)=>{
	if(req.session.github){
		res.render('other/magnet/list',{q : false});
	}else{
		res.redirect('/');
	}
})
router.get('/search',(req,res,next)=>{
	var name = req.query.name||'';
	name = name.trim();
	if(name.length ==0 ){
		res.render('other/magnet/list',{q : true,list : []});
	}else{
		query({
			sql : 'select name,infohash from demo_magnet where name like ? order by createTime desc',
			params : ['%'+name+'%']
		})
		.then(rs=>{
			var rst = rs[0];
			res.render('other/magnet/list',{
				q : true,
				list : rst,
				search : name
			});
		})
	};	
});
router.get('/:id',(req,res,next)=>{
	var id = req.params.id;
	query({
		sql : 'select json from demo_magnet where infohash=? ',
		params : [id]
	})
	.then(rs=> {
		var rst = rs[0];
		if(rst.length == 0){
			res.render('other/magnet/detail',{
				success : false
			});
		}else{
			var json = JSON.parse(rst[0].json);
			json.size = format(json.size);
			json.files.forEach( item=> {
				item.size = format(item.size);
			})
			res.render('other/magnet/detail',json);
		}
	}).catch(err=>{
		res.render('other/magnet/detail',{success : false});
	})
})

module.exports = router;