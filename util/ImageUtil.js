//对文件进行保存，压缩处理
var fs = require('fs');
var path = require('path');
var Jimp = require('jimp');

function getNewPath(userId,extname){
	return '/upload/'+userId+'/'+(+new Date())+'-'+(Math.floor(Math.random()*100))+extname;
}
var ImageUtil = function(userId,file){
	userId = userId || 'user';
	return new Promise(function(resolve,reject){
		if(file){
			var realPath = path.join(__dirname,'../',file.filePath);
			Jimp.read(realPath).then(function(image){
	      		if(image && image.bitmap){
	      			var rstPath=  getNewPath(userId,path.extname(file.name))
	      			var savePath = path.join(__dirname,'../public',rstPath);
	      			image.quality(60).write(savePath,function(err,value){
	      				fs.unlinkSync(realPath);
	      				resolve(rstPath);
	      			});
	      		}else{
		      		fs.unlinkSync(realPath);
		      		reject('文件不是图片');
	      		}
			}).catch(function(err){
				console.log(err);
				reject('文件有损坏');
			})
		}else{
			reject('no file');
		}
	});
}
module.exports = ImageUtil;