/**音乐点播**/
var express = require('express');

var router = express.Router();

var query = require('simple-mysql-query');

var https = require('https');

router.get('/random',function(req,res,next){
	query({
		sql : 'select * from music_music order by rand() limit 0,1',params : []
	}).then(function(rs){
		var music = rs[0][0];
		//base 64下载
		 var picture = music.picture;
		 //下载
		 // var buffer = new Buffer();
		console.log(picture);
		https.get(picture,function(res2){
		　　var chunks = []; //用于保存网络请求不断加载传输的缓冲数据
		　　var size = 0;　　 //保存缓冲数据的总长度

		　　res2.on('data',function(chunk){
		　　　　chunks.push(chunk);
		　　　　size += chunk.length;　　//累加缓冲数据的长度
		　　});

		　　res2.on('end',function(err){
		　　　　var data = Buffer.concat(chunks, size);　　//Buffer.concat将chunks数组中的缓冲数据拼接起来，返回一个新的Buffer对象赋值给data
		　　　　console.log(Buffer.isBuffer(data));　　　　//可通过Buffer.isBuffer()方法判断变量是否为一个Buffer对象
		　　　　var base64Img = data.toString('base64');　　//将Buffer对象转换为字符串并以base64编码格式显示
		　　　　music.base64 = base64Img;
				res.end(JSON.stringify(music));
		　　});
		});
	}).catch(function(err){
		console.log(err);
		res.end('');
	})
})

module.exports = router;