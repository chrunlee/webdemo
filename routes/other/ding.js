var express = require('express');

var router = express.Router();


function send (text){
    var api = require('../../json/config').dingding;
    var superagent = require('superagent');
    const data = {msgtype : 'text',text : {content : ''}};
    data.text.content = text;
    return new Promise((resolve,reject) => {
        superagent.post(api)
        .send(data)
        .end((err,res) => {
            if(err){reject(err);}
            else{
                resolve(res.text);
            }
        })
    });
    
}
router.get('/',(req,res,next)=>{
    var msg = req.query.msg;
    send(msg)
    .then(err=>{
        res.end('发送成功');    
    })
    .catch(er=>{
        res.end(er);
    })
})
module.exports = router;