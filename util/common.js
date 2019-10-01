var query = require('sqlquery-tool');
/**
 * 获得全局站点属性
 *
 ***/
module.exports = function(req,res,next){
	if(req.session.mysite){
		next();
	}else{
		query.query([
			{sql : 'select * from site',params : []},
			{sql : 'select * from user_links order by id asc',params : []}
		]).then( function(rs){
			var siteobj = rs[0][0],
				links = rs[1];//友情链接
			siteobj.friendLink = links;
			req.session.mysite = siteobj;
			next();
		}).catch(function(e){
			next();
		})
	}
}