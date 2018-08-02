/**此处处理所有微信订阅号相关的内容***/

var express = require('express');

var router = express.Router();

var weixin = require('../lib/weixin');

var domain = require('../wx').domain;

var wx = new weixin();

var query = require('simple-mysql-query');

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
 * 1.关注:感谢关注
 *
 ***/
router.post('/',function(req,res,next){
	res.type('xml');
	wx.getJsonFromReq(req).then( json => {
		var fromUser = json.xml.FromUserName[0];//获得发送人ID，后续使用
		var msgType = json.xml.MsgType[0];//消息类型，text:文本消息
		var defaultXml = wx.createTextXml(fromUser,'感谢同学的关注，您的建议我们已经收到！');
		if(msgType == 'text'){
			//文本消息
			var content = json.xml.Content[0];//文本消息内容
			var msgId = json.xml.MsgId[0];

			//此处处理文本
			var caipuReg = new RegExp('菜谱+([.]*)');
			if(/^菜谱[\+]?([\s\S]*)$/.test(content.trim())){
				var rst = /^菜谱\+([\s\S]*)$/.exec(content.trim());
				var keyword = rst[1];
				//根据关键词查询数据库，并将数据展示给用户。然后添加一个链接即可。
				query({
					sql : 'select * from caipu_item where title like ? or ingredients like ? order by rand() limit 0,1',
					params : ['%'+keyword+'%','%'+keyword+'%']
				}).then( rs => {
					var rst = rs[0];
					var xml = '';
					if(rst.length > 0){
						var resobj = rst[0];
						xml = wx.createPicTextXml(fromUser,resobj.title,'介绍:\n'+resobj.intro+'\n 材料:\n'+resobj.ingredients,domain+resobj.albums,domain+'/caipu/show/'+resobj.id);
					}else{
						xml = wx.createTextXml(fromUser,'对不起，您检索的菜谱信息我们没有查到!');
					}
					res.end(xml);
				}).catch(err=> {
					res.type('xml');
					res.end(defaultXml);
				})
			}else{
				//temp : 临时创建返回正在升级中
				res.end(defaultXml);
			}
		}else if(msgType == 'event' ){
			var eventType = json.xml.Event[0];//事件类型
			var eventKey = json.xml.EventKey[0];
			if(eventType == 'subscribe'){//关注，发送图文
				query({
					sql : 'select * from peitu order by rand() limit 0,1',
					params : []
				}).then(rs => {
					var rst = rs[0];
					var picurl = rst[0].picurl;
					var xml = wx.createPicTextXml(fromUser,'感谢关注','感谢您的关注，我们将竭尽全力为您服务...啦啦啦',domain + picurl,'');
					res.end(xml);
				}).catch( err=> {
					var xml = wx.createTextXml(fromUser,'感谢您的关注，我们将竭尽全力为您服务');
					res.end(xml);
				})
			}else if(eventType == 'unsubscribe'){
				var xml = wx.createTextXml(fromUser,'期待您的再次光临...');
				res.end(xml);
			}else if(eventType == 'click' && eventKey == 'caipu'){
				//从全库中去一个菜返回
				//根据关键词查询数据库，并将数据展示给用户。然后添加一个链接即可。
				query({
					sql : 'select * from caipu_item order by rand() limit 0,1',
					params : []
				}).then( rs => {
					var rst = rs[0];
					var xml = '';
					if(rst.length > 0){
						var resobj = rst[0];
						xml = wx.createPicTextXml(fromUser,resobj.title,'介绍:\n'+resobj.intro+'\n材料:\n'+resobj.ingredients,domain+resobj.albums,domain+'/caipu/show?id='+resobj.id);
					}else{
						xml = wx.createTextXml(fromUser,'sooooorry...没找到今天的菜，要不喝点水吧~');
					}
					res.end(xml);
				}).catch(err=> {
					res.type('xml');
					res.end(defaultXml);
				})
			}else{
				var xml = wx.createTextXml(fromUser,'迅哥正在加班研发中...敬请期待');
				res.end(xml);
			}
		}else{
			var xml = wx.createTextXml(fromUser,'迅哥正在加班研发中...敬请期待');
			res.end(xml)
		}
	}).catch( err => {
		res.end('');
	});
})

module.exports = router;
