var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var compression = require('compression');

var sqlquery = require('simple-mysql-query');
sqlquery(require('./lib/config').mysql);

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
var template = require('express-art-template')
app.engine('html',template);
app.set('view options',{
	debug : process.env.NODE_ENV !== 'production'
});
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret : 'xunge'
}));

app.use(compression());//gzip压缩
require('./timer/main')();//定时任务

//全局路由控制
var routes = require('./routes/route');
routes(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log(req.path);
  var err = new Error('Not Found');
  err.status = 404;
  res.redirect('/error/404');
});

module.exports = app;
