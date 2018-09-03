//这里放一些需要定时处理的任务

module.exports = function(){
	
	//每周定时清理附件
	var clear = require('./ClearUpload');//附件清理
	clear.start();


	//每10分钟检查正泽产品是否在线
	// require('./BJZZOnline')();

	//每天一次数据库备份
	require('./DBBack')();
}