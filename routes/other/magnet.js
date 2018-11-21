var express= require('express');

var router = express.Router();

var query = require('simple-mysql-query');

router.get('/search',(req,res,next)=>{
	var name = req.query.name||'';
	name = name.trim();
	if(name.length ==0 ){
		res.end('参数不能为空;');
	}else{
		query({
			sql : 'select name,magnet from demo_magnet where json like ? ',
			params : ['%'+name+'%']
		})
		.then(rs=>{
			console.log(rs);
			var rst = rs[0];
			//生成一个table
			var html = '<style>div{width:100%;background-color:black;}a{display:inline-block;width:100%;padding:5px 20px;margin:10px 0px;background-color:#5dd9ed;;color:white;}</style><div>';
			if(rst.length == 0){
				html += '没有检索到有效数据';
			}
			rst.forEach( item=> {
				html += '<a href="'+item.magnet+'">'+item.name+'</a>';
			});
			html += '</div>';
			res.end(html);
		})
	};	
});

module.exports = router;