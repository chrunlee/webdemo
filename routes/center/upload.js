/***
个人中心：过滤用户权限
***/

var express = require('express');

var router = express.Router();

var upload = require('../../util/upload');

var ImageUtil = require('../../util/ImageUtil');

var path = require('path');

var fs = require('fs');

//文件上传
router.post('/',upload('file','public/upload/tmp'),function(req,res,next){
	if(req.file && req.session.user){
		var user = req.session.user;
		ImageUtil(user.id,req.file).then(function(rs){
			req.file.filePath = rs;
			res.json({
				success : true,
				result : req.file
			});
		}).catch(function(msg){
			res.json({
				success : false,
				msg : msg
			});
		})
	}else{
		res.json({
			success : false,
			msg : '未上传文件'
		})
	}
})
//文件上传
router.post('/file',upload('file','public/upload/tmp'),function(req,res,next){
	if(req.file && req.session.user){
		var user = req.session.user;
		ImageUtil.FileUtil(user.id,req.file).then(function(rs){
			req.file.filePath = rs;
			res.json({
				success : true,
				result : req.file
			});
		}).catch(function(msg){
			res.json({
				success : false,
				msg : msg
			});
		})
	}else{
		res.json({
			success : false,
			msg : '未上传文件'
		})
	}
})


//文件删除
router.post('/delete',function(req,res,next){
	var filePath = req.body.filePath
	if(req.session.user){
		//判断必须为upload目录下的文件
		var realPath = path.join(__dirname,'../../public',filePath);
		if(fs.existsSync(realPath)){
			fs.unlinkSync(realPath);
			res.json({
				success : true
			})
		}else{
			res.json({success : false})
		}
	
	}else{
		res.json({success : false})
	}
})


module.exports = router;