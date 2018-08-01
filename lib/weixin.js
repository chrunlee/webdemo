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

		//url请求
		this.menuAddUrl = wx.api + '/cgi-bin/menu/create?access_token=';
		this.menuDeleteUrl = wx.api +'/cgi-bin/menu/delete?access_token=';

		//启动刷新
		this.refreshToken();
		//创建menu
		// this.deleteMenu();
		// this.createMenu();
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
		}).catch( err => {
			console.log(err);
			setTimeout(()=>{
				that.refreshToken();
			},2000);
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
						resolve(that.accessToken);
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
		var buf='';
		return new Promise( (resolve,reject) => {
			req.on('data',chunk => {
				buf += chunk;
			});
			req.on('end',() => {
				xml2js.parseString(buf.trim(),(err,result) => {
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
	/*创建单条图文消息*/
	createPicTextXml (toUser,title,des,picUrl,toUrl){
		var time=Math.floor(new Date().getTime() / 1000);
		var xml = 
		'<xml>'+
			'<ToUserName><![CDATA['+toUser+']]></ToUserName>'+
			'<FromUserName><![CDATA['+wx.account+']]></FromUserName>'+
			'<CreateTime>'+time+'</CreateTime>'+
			'<MsgType><![CDATA[news]]></MsgType>'+
			'<ArticleCount>1</ArticleCount>'+
			'<Articles>'+
				'<item>'+
					'<Title><![CDATA['+title+']]></Title>'+
					'<Description><![CDATA['+des+']]></Description>'+
					'<PicUrl><![CDATA['+picUrl+']]></PicUrl>'+
					'<Url><![CDATA['+toUrl+']]></Url>'+
				'</item>'+
			'</Articles>'+
		'</xml>';
		return xml;
	}

	//创建菜单,每次系统启动，重置一次菜单信息
	createMenu () {
		var that= this;
		var menu = {
			"button":[
		    // {    
		    // 	"name":"小程序",
		    //     "sub_button":[{
		    //     	"name":"知识点练习",
		    //       	"type":"miniprogram",
		    //       	"url":"https://weixin.byyui.com",
		    //       	"appid":"wx23bdab53a3beed96",
		    //       	"pagepath":"pages/index/index"
		    //     }]
		    // },
		    {
		    	"name":"生活",
		        "sub_button":[
		        {    
					"type":"click",
		            "name":"菜谱",
		            "key":"caipu"
				},
		        {
		        	"type":"click",
		            "name":"冷知识",
		            "key":"lengzhishi"
		        }]
		    }]
		};
		return new Promise( (resolve,reject) => {
			that.getToken().then(token => {
				console.log(token);
				superagent.post(that.menuAddUrl+token)
				.send(menu)
				.end((err,res)=>{
					if(err){
						console.log('菜单创建失败')
						resolve()
					}else{
						console.log(res.text);
						console.log('微信菜单创建成功');
						resolve()
					}
				})
			})
		})
	}
	//删除菜单
	deleteMenu () {
		return new Promise( (resolve,reject) => {
			var that = this;
			that.getToken().then( token =>{
				console.log(token);
				superagent.get(that.menuDeleteUrl+token).end( (err,res) => {
					if(err){
						resolve();
					}else{
						console.log(res.text);
						console.log('菜单删除成功')
						resolve();
					}
				})
			})
		});
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