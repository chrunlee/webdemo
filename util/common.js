var query = require('simple-mysql-query');
/**
 * 获得全局站点属性
 *
 ***/
module.exports = function(req,res,next){
	// req.session.user = {
	// 	name : 'chrunlee'
	// };
	if(this.mysite){
		next();
	}else{
		query([
			{sql : 'select * from site',params : []},
			{sql : 'select * from user_links order by id asc',params : []}
		]).then( function(rs){
			var siteobj = rs[0][0],
				links = rs[1];//友情链接
			this.mysite = siteobj;
			this.mysite.friendLink = links;
			next();
		}).catch(function(){
			//error
			next();
		})
	}
}