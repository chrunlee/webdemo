//后台常用的工具类
var fs = require('fs');
var {sendMail,sendMailP} = require('../lib/mailer');
var tool = {

	/*** 
	 * 发送邮件:文章回复
	 ***/
	sendCommentEmail : function(email,name,title,link){
		var emailPath = __dirname+'/../public/template/comment.html';
		var content = fs.readFileSync(emailPath,'utf-8');
		content = content.replace(/{{name}}/g,name);
		content = content.replace(/{{title}}/g,title);
		content = content.replace(/{{link}}/g,link);
		return new Promise((resolve,reject)=>{
			sendMail([email],'有人在BUG集散地中回复了您',content,function(err,info){
				resolve(info);	
			});
		});
	},
	/***
	 * 发送商品内容
	 **/
	sendOrderEmail : function(email,name,html){
		var emailPath = __dirname+'/../public/template/order.html';
		var content = fs.readFileSync(emailPath,'utf-8');
		content = content.replace(/{{name}}/g,name);
		content = content.replace(/{{content}}/g,html);
		return new Promise((resolve,reject)=>{
			sendMail([email],'采然小店已收到您的付款，以下为商品信息！',content,function(err,info){
				resolve(info);	
			});
		});
	}
};

module.exports = tool;