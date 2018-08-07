var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var URL = require('url');

var uautil = require('./lib/UA');
var sqlquery = require('simple-mysql-query');
sqlquery(require('./lib/config').mysql);

var superagent = require('superagent');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html',require('express-art-template'));
app.set('view options',{
	debug : process.env.NODE_ENV !== 'production'
});
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next){
  var url = req.url;
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
      sqlquery({
        sql : 'insert into logs (url,ip,xitong,ctime,browser,originurl,region) values (?,?,?,?,?,?,?)',
        params : [rs.url,rs.ip,rs.xitong,rs.ctime,rs.browser,rs.originurl,rs.region]
      });
    }
  })
  next();
});

//小程序知识点
app.use('/exam',require('./routes/exam'));
//小游戏：练习速度
app.use('/speed',require('./routes/speed'));
//疫苗批号
app.use('/ymcx',require('./routes/ymcx'));
//菜谱
app.use('/caipu',require('./routes/caipu'));
//log 日志
app.use('/log',require('./routes/logs'));

//微信
app.use('/wx',require('./routes/weixin'));

//音乐
app.use('/music',require('./routes/music'));
//首页
var index = require('./routes/index');

app.use('', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err);
  // render the error page
  res.status(err.status || 500);
  res.render('error',{msg : res.locals.message});
});

module.exports = app;
