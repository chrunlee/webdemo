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

//微信dat文件解码
router.post('/dat',upload('file','public/upload/tmp'),(req,res,next)=>{
	//1.文件大小超过20M 且不是dat的即刻删除;
	//2.转码完成后删除;
	//3.解码完成后生成base64,删除；
	var file = req.file;
	console.log(file);
	var maxSize = 20 * 1024 * 1024;
	var extName = '.dat';
	if(file.size > maxSize || path.extname(file.name).toLowerCase() != extName){
		fs.unlinkSync(file.filePath);
		res.json({success : false,msg : '文件不符合规范，已经删除'});
	}else{
		//转成图片，然后转base64
		var first = null,coder = null,base = 0xFF;
		fs.readFile(path.join(__dirname,'../../',file.filePath),(err,content)=>{
	        if(err){
	            res.json({success : false,msg : err.toString()})
	        }else{
	        	if(!first){
	        		first = content[0];
	        	}
		        if(!coder){
		            coder = first ^ base;
		        }
		        let bb = content.map(br=>{
		            return br ^ coder
		        })
		        let b64 = bb.toString('base64');
		        fs.unlinkSync(file.filePath);
		        res.json({success : true,base64 : b64});
	        }
	    })
	}
})


module.exports = router;