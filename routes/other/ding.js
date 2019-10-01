var express = require('express');

var router = express.Router();
var send = require('../../lib/dingwo');

router.all('/',(req,res,next)=>{
    var msg = req.query.msg || req.body.msg;
    send(msg)
    .then(err=>{
        res.end('发送成功');    
    })
    .catch(er=>{
        res.end(er);
    })
})
module.exports = router;