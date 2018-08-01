/**此处处理所有微信订阅号相关的内容***/

var express = require('express');

var router = express.Router();

var weixin = require('../lib/weixin');

var wx = new weixin();

var superagent = require('superagent');

var crypto = require('crypto');


router.get('/',function(req,res,next){
	var signature = req.body.signature || req.query.signature;
	var timestamp = req.body.timestamp || req.query.timestamp;
	var nonce = req.body.nonce || req.query.nonce;
	var echostr =req.body.echostr || req.query.echostr;

	res.end(echostr)
});
/****
 *
 * 微信接口，处理所有的消息
 *
 ***/
router.post('/',function(req,res,next){

	wx.getJsonFromReq(req).then( json => {
		var fromUser = json.xml.FromUserName[0];//获得发送人ID，后续使用
		var msgType = json.xml.MsgType[0];//消息类型，text:文本消息
		var content = json.xml.Content[0];//文本消息内容
		var msgId = json.xml.MsgId[0];

		//temp : 临时创建返回正在升级中
		var xml = wx.createTextXml(fromUser,'各位同学好，目前本服务号正在紧张升级中，后续会给大家带来关键词回复（包括菜谱和冷知识）\\n 多谢大家关注！\\n 我们争取做更好!');
		res.type('xml');
		res.end(xml);
	}).catch( err => {
		console.log(err);
		res.type('xml');
		res.end('');
	});
})

module.exports = router;
