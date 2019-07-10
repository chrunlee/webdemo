//这里放一些需要定时处理的任务

module.exports = function(){
	
	//每周定时清理附件
	var clear = require('./ClearUpload');//附件清理
	clear.start();

	//定时备份文章附件
	require('./FileBackUp')();

	//每10分钟检查正泽产品是否在线
	// require('./BJZZOnline')();

	//每天一次数据库备份
	require('./DBBack')();

	//每天早7点发送天气预报
	// require('./WeatherGold')();

	//每天10点或20点，生成sitemap
	require('./Sitemap')();
}