/**此处处理所有微信订阅号相关的内容***/

var express = require('express');

var router = express.Router();

var wx = require('../wx');

router.get('/',function(req,res,next){
	var signature = req.body.signature || req.query.signature;
	var timestamp = req.body.timestamp || req.query.timestamp;
	var nonce = req.body.nonce || req.query.nonce;
	var echostr =req.body.echostr || req.query.echostr;
	
	res.end(echostr)
})

module.exports = router;