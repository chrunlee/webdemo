//定时清理上传的无效附件，防止空间不足。

//1.主要清理无引用的图片或其他附件等

//检查upload/user 下的所有文件，对比表有：site/user_article/user_banner/user_record

//间隔：每周清理一次
var fs = require('fs');
var query = require('simple-mysql-query');
var async = require('async');

var ClearUpload = function(){

	this.folderPath = __dirname+'/../public/upload/user/';

	this.table = function(fileName){
		fileName = '%'+fileName+'%';
		return [
			{sql : 'select * from site where sitescan like ? or faviconhref like ? or avatar like ?' ,params : [fileName,fileName,fileName]},
			{sql : 'select * from user_article where content like ? or postpath like ? ',params : [fileName,fileName]},
			{sql : 'select * from user_banner where bannerpath like ? ',params : [fileName]},
			{sql : 'select * from user_record where imgpath like ? ' ,params : [fileName]},
			{sql : 'select * from user_pdf where postpath like ? or pdfpath like ? ',params : [fileName,fileName]}
		];
	};

	this.period = 7 * 24 * 60 * 60 * 1000;//一周
	return this;
}

ClearUpload.prototype.start = function(){
	console.log('开始清理无效附件................')
	var that = this;
	that.num = 0;//共计清理了多少文件

	fs.readdir(that.folderPath,function(err,files){
		if(err){
			console.log('本次清理附件发生错误，请检查...')
			setTimeout(function(){
				that.start();
			},that.period);
		}else{
			async.mapLimit(files,1,function(name,cb){
				that.check(name,cb);
			},function(){
				console.log('本次附件清理已完毕，共计清理无效附件:'+that.num+'个,所有文件'+files.length+'个,下次执行时间为一周后.');
				setTimeout(function(){
					that.start();
				},that.period);
			})
		}
	})

}
//检查是否存在，并处理
ClearUpload.prototype.check = function(fileName,cb){
	var that = this;
	query(that.table(fileName))
	.then(function(rs){
		//检查rs的条目
		var has = false;
		rs.forEach(function(item){
			if(item.length > 0){
				has = true;
			}
		});
		if(has){
			cb(null);
		}else{
			fs.unlinkSync(that.folderPath+fileName);
			that.num++;
			cb(null);
		}
	}).catch(function(){
		cb(null);
	})
}

module.exports = new ClearUpload();
