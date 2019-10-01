/***
 * 邮件发送工具
 * @author lx
 * @since 2016年8月12日 21:26:42
 *
 ***/

var nodemailer = require('nodemailer');
var {email} = require('../json/config');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
    pool : true,
    host : 'smtp.qq.com',
    port : 465,
    secure : true,
    auth : {
        user : email.user,
        pass : email.pass
    }
});

// var transporter = nodemailer.createTransport('smtps://chrunlee@foxmail.com:jsqtbymzzyzhbdad@smtp.qq.com');

// setup e-mail data with unicode symbols
var mailOptions = {
    from: 'BUG集散地 <'+email.user+'>', // sender address
    to: '', // list of receivers
    subject: '', // Subject line
    html: '' // html body
};

// send mail with defined transport object

var sendMail = function(userList,title,content,fn){
    mailOptions.to = userList;
    mailOptions.subject = title;
    mailOptions.html = content;
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            throw error;
        }
        if(fn)fn(info);
    });
}
//promise version
var sendMailP = function(userList,title,content){
    return new Promise((resolve,reject)=>{
        mailOptions.to = userList;
        mailOptions.subject = title;
        mailOptions.html = content;
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                reject(error);
            }else{
                resolve();
            }
        });
    });
}

module.exports = {
    sendMail : sendMail,
    sendMailP: sendMailP
};