/*微信处理的工具类*/
const wx = require('../wx');//配置信息
const moment = require('moment')
const superagent =require('superagent');
const xml2js = require('xml2js');

class weixin {

	constructor(){
		this.last = null;//上一次请求
		this.accessToken = null;
		this.refreshTime = 90 * 60 * 1000;//1个半小时刷新一次
		this.expireTime = 7200;

		//启动刷新
		this.refreshToken();
	}
	/**
	 * 刷新token,一个半小时一次
	 **/
	refreshToken (){
		const that = this;
		//自动刷新token
		that.last = null;
		that.getToken().then( token =>{
			setTimeout(()=>{
				that.refreshToken();
			},that.refreshTime)
		})
	}
	//promise 获取token
	getToken (){
		const that = this;
		return new Promise((resolve,reject) => {
			const hasExpire = moment(new Date()).subtract(that.expireTime,'seconds').isBefore(moment(that.last));
			if(!that.last || !hasExpire){
				//重新获取
				superagent.get(wx.tokenUrl).end((err,res) => {
					if(err){
						reject('获取微信token失败');
					}else{
						const resobj = JSON.parse(res.text);
						that.accessToken = resobj.access_token;
						that.last = new Date();
						resolve(accessToken);
					}
				})
			}else{
				resolve(that.accessToken);
			}
		});
	}

	/***
	 * 从request 中获取数据，然后返回json数据
	 * 
	 ***/
	getJsonFromReq (req) {
		req.setEncoding('utf-8');
		var buf;
		return new Promise( (resolve,reject) => {
			req.on('data',chunk => {
				buf += chunk;
			});
			req.on('end',() => {
				xml2js.parseString(buf,(err,result) => {
					if(err){
						reject(err);
					}else{
						resolve(result);
					}
				})
			})
		})
	}
	/*创建文本消息*/
	createTextXml (toUser,msg) {
		var time=Math.floor(new Date().getTime() / 1000);
		var xml = 
		'<xml>'+
		'<ToUserName><![CDATA['+toUser+']]></ToUserName>'+
		'<FromUserName><![CDATA['+wx.account+']]></FromUserName>'+
		'<CreateTime>'+time+'</CreateTime>'+
		'<MsgType><![CDATA[text]]></MsgType>'+
		'<Content><![CDATA['+msg+']]></Content>'+
		'</xml>';
		return xml;
	}
}

module.exports = weixin;
// var buf = '<xml><ToUserName><![CDATA[toUser]]></ToUserName><FromUserName><![CDATA[fromUser]]></FromUserName><CreateTime>1348831860</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[this is a test]]></Content><MsgId>1234567890123456</MsgId></xml>';
// xml2js.parseString(buf,(err,result) => {
// 	if(err){
// 		console.log(err);
// 	}else{
// 		console.log(result);
// 	}
// })