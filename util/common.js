var query = require('simple-mysql-query');
/**
 * 获得全局站点属性
 *
 ***/
module.exports = function(req,res,next){
	if(this.mysite){
		next();
	}else{
		query({
			sql : 'select * from site',params : []
		}).then( function(rs){
			var siteobj = rs[0][0]
			this.mysite = siteobj;
			next();
		}).catch(function(){
			//error
			next();
		})
	}
}