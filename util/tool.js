//后台常用的工具类
var fs = require('fs');
var mailer = require('../lib/mailer');
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
			mailer([email],'有人在BUG集散地中回复了您',content,function(err,info){
				resolve(info);	
			});
		});
	}
};

module.exports = tool;