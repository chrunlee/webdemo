/**此处处理所有微信订阅号相关的内容***/

var express = require('express');

var router = express.Router();

var weixin = require('../../lib/weixin');

var domain = require('../../json/wx').domain;

var wx = new weixin();

var query = require('sqlquery-tool');

var crypto = require('crypto');


router.get('/guoqi',async (req,res,next)=>{
	let id = req.query.id;
	console.log(id);
	res.end(id);
})

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
		console.log(json);
		var fromUser = json.xml.FromUserName[0];//获得发送人ID，后续使用
		var msgType = json.xml.MsgType[0];//消息类型，text:文本消息
		
		var defaultXml = wx.createTextXml(fromUser,'感谢同学的关注，您的建议我们已经收到！');
		console.log(msgType);
		if(msgType == 'text'){
			//文本消息
			var content = json.xml.Content[0];//文本消息内容
			var msgId = json.xml.MsgId[0];
			//存储下内容
			query.query({sql : 'insert into wx_msg (openid,content,ctime) values (?,?,?)' ,params : [fromUser,content,new Date()]})
			.then(rs=>{
				console.log(rs);
			}).catch(e=>{
				console.log(e);
			})
			//此处处理文本
			console.log(content+':...');
			console.log(fromUser);
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
					query.query({
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
				xml = wx.createTextXml(fromUser,'您要的图片我们图小二都有哦，点击<a href="https://chrunlee.cn/picture">这里</a>呢！');
				res.type('xml');
				res.end(xml);
			}else if(/[国旗|过期|国 旗]/.test(content.trim())){
				console.log('进入过期')
				xml = wx.createTextXml(fromUser,'您想要的国旗我都有，<a href="http://wx.byyui.com/wx/guoqi?id='+fromUser+'">点我哦</a>')
				//然后拿到用户的头像，对头像进行加工，然后返回头像地址。
				res.type('xml');
				res.end(xml);
			}else{
				console.log('机器人')
				xml = wx.createTextXml(fromUser,'我正在学习中，有啥需求请直接发我邮箱哦 email: chrunlee@foxmail.com !...')
				//进入机器人模式
				// wx.getContentFromRobot(content.trim(),'xungege')
				// .then(function(rs){
				// 	//获得内容
				// 	xml = wx.createTextXml(fromUser,rs);
				// 	res.end(xml);
				// }).catch(function(){
				// 	res.end(defaultXml);	
				// })
				res.type('xml');
				res.end(xml);
			}
		}else if(msgType == 'event'){
			var eventType = json.xml.Event[0];//事件类型
			if(eventType =='subscribe'){
				console.log('关注')
				//此时直接调用接口，拿到头像/
				wx.getUserInfo(fromUser)
				.then(rs=>{
					console.log(rs);
					xml = wx.createTextXml(fromUser,'谢谢关注，我们正在积极努力的学习成长..')
					res.type('xml');
					res.end(xml);
				}).catch(e=>{
					console.log(e);
					xml = wx.createTextXml(fromUser,'谢谢关注，我们正在积极努力的学习成长..')
					res.type('xml');
					res.end(xml);
				})
			}else{
				xml = wx.createTextXml(fromUser,'谢谢关注，我们正在积极努力的学习成长..')
				res.type('xml');
				res.end(xml);
			}
		}else{
			console.log(msgType)
			res.end('')
		}
	}).catch( err => {
		console.log(err);
		res.end('');
	});
})

module.exports = router;
