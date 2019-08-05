//这里放一些需要定时处理的任务

module.exports = function(){
	
	//每周定时清理附件
	var clear = require('./ClearUpload');//附件清理
	setTimeout(function(){
		clear.start();	
	},60 * 60 * 1000);//delay task

	//定时备份文章附件
	require('./FileBackUp')();

	//每天一次数据库备份
	require('./DBBack')();

}