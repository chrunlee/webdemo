
var superagent = require('superagent');
var query = require('simple-mysql-query');
var uautil = require('../lib/UA');
var URL = require('url');

module.exports = function( app ){

	//此处处理所有的路由控制
	//日志记录
	app.use(require('../util/logUtil'));

	app.use(require('../util/common'));


	//github 登录
	app.use('/github',require('../routes/login/login'));

	//小程序知识点
	app.use('/exam',require('../routes/other/exam'));


	//小游戏：练习速度
	app.use('/speed',require('../routes/other/speed'));


	//疫苗批号
	app.use('/ymcx',require('../routes/other/ymcx'));


	//菜谱
	app.use('/caipu',require('../routes/other/caipu'));


	//log 日志
	app.use('/log',require('../routes/other/logs'));


	//微信
	app.use('/wx',require('../routes/other/weixin'));


	//音乐
	app.use('/music',require('../routes/other/music'));


	//美图
	app.use('/picture',require('../routes/other/picture'));

	//dht magnet
	app.use('/magnet',require('../routes/other/magnet'));

	//体重信息
	app.use('/weight',require('../routes/other/weight'))

	//心愿单查看
	app.use('/wish',require('../routes/center/wish'));

	//个人中心
	app.use('/center/upload',require('../routes/center/upload'));
	app.use('/center',require('../routes/center/center'))
	app.use('/record',require('../routes/center/record'))
	

	//文章列表
	app.use('/article',require('../routes/home/article'));
	//pdf 处理
	app.use('/pdf',require('../routes/home/pdf'));
	//首页
	app.use('/',require('../routes/home/home'));

	//错误
	app.use('/error',require('../routes/home/error'));

}