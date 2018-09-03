//数据库备份
//每天凌晨备份一次数据库到七牛云存储
var data = require('../json/config').qiniu;
var qiniu = require('qiniu');
var path = require('path');
var fs = require('fs');

function saveFile(filePath){
	return new Promise(function(resolve,reject){
		var accessKey = data.ak;
		var secretKey = data.sk;
		var scope = data.scope;
		var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
		var options = {
		  scope: scope
		};
		var putPolicy = new qiniu.rs.PutPolicy(options);
		var uploadToken=putPolicy.uploadToken(mac);
		//上传
		var config = new qiniu.conf.Config();
		// 空间对应的机房
		config.zone = qiniu.zone.Zone_z0;
		var formUploader = new qiniu.form_up.FormUploader(config);
		var putExtra = new qiniu.form_up.PutExtra();
		// 文件上传
		formUploader.putFile(uploadToken, path.basename(filePath), filePath, putExtra, function(respErr,respBody, respInfo) {
			resolve(filePath);
		});
	});
}
function deleteFile(filePath){
	return new Promise(function(resolve,reject){
		fs.unlinkSync(filePath);
		resolve(true);
	})
}
//拉取数据库文件内容并保存到文件
function fetchSQL(){
	var exec = require('child_process').exec;
	var pwd = __dirname;
	var d = new Date();
	var str = d.getFullYear()+''+(d.getMonth()+1)+''+d.getDate()+'.sql';
	var filePath = path.join(__dirname,str);
	var cmd = 'mysqldump -h127.0.0.1 -P3306 -uroot -proot -d --all-databases>'+filePath;
	return new Promise(function(resolve,reject){
		exec(cmd,function(err,stdout,stdin){
			resolve(filePath);
		})
	});
	
}

module.exports = function DBBack(){
	//判断当前时间
	var d = new Date();
	var h = d.getHours();
	if(h == 0 || h == 24){
		//将数据库备份并存储
		fetchSQL().then(saveFile).then(deleteFile).then(function(){
			console.log('数据库备份完成----')
			setTimeout(function(){
				DBBack();
			},60 * 60 * 1000);
		}).catch(function(){
			setTimeout(function(){
				DBBack();
			},60 * 60 * 1000);
		})
	}else{
		setTimeout(function(){
			DBBack()
		},60 * 60 * 1000)
	}
}
