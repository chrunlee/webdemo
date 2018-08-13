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
			//存储下内容
			query({sql : 'insert into wx_msg (openid,content,ctime) values (?,?,?)' ,params : [fromUser,content,new Date()]})
			//此处处理文本
			var caipuReg = new RegExp('菜谱+([.]*)');
			if(/^菜谱?[\+\＋]{1}([\s\S]*)$/.test(content.trim())){
				var rst = /^菜谱?[\+\＋]{1}([\s\S]*)$/.exec(content.trim());
				var keyword = rst[1];
				if(keyword == ''){
					//回复消息
					xml = wx.createTextXml(fromUser,'您要的所有菜谱都在<a href="https://gstyle.byyui.com/caipu/home">这里</a>哦');
					res.type('xml');
					res.end(xml);
				}else{
					//根据关键词查询数据库，并将数据展示给用户。然后添加一个链接即可。
					query({
						sql : 'select * from caipu_item where title like ? or ingredients like ? order by rand() limit 0,1',
						params : ['%'+keyword+'%','%'+keyword+'%']
					}).then( rs => {
						console.log(rs);
						var rst = rs[0];
						var xml = '';
						if(rst.length > 0){
							var resobj = rst[0];
							xml = wx.createPicTextXml(fromUser,resobj.title,'介绍:\n'+resobj.intro+'\n 材料:\n'+resobj.ingredients,resobj.albums,domain+'/caipu/show/'+resobj.id);
						}else{
							xml = wx.createTextXml(fromUser,'对不起，您检索的菜谱信息我们没有查到!');
						}
						res.end(xml);
					}).catch(err=> {
						res.type('xml');
						res.end(defaultXml);
					})
				}
			}else if(/^[图片|图|美女]$/.test(content.trim())){
				xml = wx.createTextXml(fromUser,'您要的图片我们图小二都有哦，点击<a href="https://gstyle.byyui.com/picture">这里</a>呢！');
				res.type('xml');
				res.end(xml);
			}else{
				//进入机器人模式
				wx.getContentFromRobot(content.trim(),'xungege')
				.then(function(rs){
					//获得内容
					xml = wx.createTextXml(fromUser,rs);
					res.end(xml);
				}).catch(function(){
					res.end(defaultXml);	
				})
			}
		}else{
			console.log(msgType)
			res.end('')
		}
	}).catch( err => {
		res.end('');
	});
})

module.exports = router;
