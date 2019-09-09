/***
 * 日志处理
 * 记录访问的路径以及IP等
 * @author chrunlee
 ****/
var superagent = require('superagent');
var uautil = require('../lib/UA');
var URL = require('url');
var query = require('simple-mysql-query');


module.exports = function(req,res,next){
  var url = req.url;
  if(url.length > 500 || url.indexOf('.php') > -1){
    res.json({success : false,msg : '麻烦您了哎，别盯着我这1M小水管瞎几把访问了好吧。'});
    return;
  }
  var urlobj = URL.parse(url);
  //获得时间
  var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
  var ua = req.headers['user-agent'];
  var usrs = uautil(ua);
  ip = ip.replace('::ffff:','');
  superagent.get('http://ip.taobao.com/service/getIpInfo.php?ip='+ip).end(function(err,res){
    if(res && res.text){
      try{
        var ooo = JSON.parse(res.text);
        var region = ooo.data.region;
        var rs = {
          url : urlobj.pathname,
          ctime : new Date(),
          ip : ip,
          region : region == 'XX' || region == '' ? '未知' : region,
          xitong : usrs.android ? 'android'  : (usrs.ios ? 'ios' : usrs.os),
          browser : usrs.chrome ? 'chrome' : (usrs.ff ?'firefox' : (usrs.safari ? 'safari' : (usrs.opera ? 'opera' : ''))),
          originurl : urlobj.href
        };
        //保存数据库
        query({
          sql : 'insert into demo_logs (url,ip,xitong,ctime,browser,originurl,region) values (?,?,?,?,?,?,?)',
          params : [rs.url,rs.ip,rs.xitong,rs.ctime,rs.browser,rs.originurl,rs.region]
        })
        .catch(e=>{})
      }catch(e){}
    }
  })
  next();
}