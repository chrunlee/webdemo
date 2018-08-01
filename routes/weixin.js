/**此处处理所有微信订阅号相关的内容***/

var express = require('express');

var router = express.Router();

var wx = require('../wx');

router.get('/',function(req,res,next){
	res.end(wx.token)
})

module.exports = router;