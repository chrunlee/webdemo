//用于过滤上传文件进行处理

var formidable = require('formidable');
var path = require('path');
var mkdirsp = require('mkdirsp');

var isFormdata = function(req){
  var type = req.headers['content-type'] || '';
  return -1 < type.indexOf('multipart/form-data');
};


var upload = function(fileName,folderPath){
	//创建目录
	var newfolderpath = path.join(__dirname,'../'+folderPath);
	mkdirsp(newfolderpath);
	return function(req,res,next){
		if(isFormdata(req)){
	      var form = formidable.IncomingForm();
	      form.uploadDir = folderPath || 'public/upload/';
	      form.parse(req,function(err,fileds,files){
	      	var file = files[fileName];//上传的文件
	      	if(file){
	      		req.file = {
	      			name : file.name,
	      			filePath : file.path,
	      			size : file.size,
	      			type : file.type,
	      		};
	      		next();
	      	}else{
	      		next();
	      	}
	      });
	    }else{
	        next();
	    }
		
	}
}

module.exports = upload;