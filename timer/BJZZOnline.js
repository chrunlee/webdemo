
var superagent = require('superagent');
var config = require('../json/config');
var async = require('async');
var array = [
{
	name : '数校项目',
	url : 'http://zhxy.bjzzschool.com/byycampus/resources/css/index/bjzz/css/zz-student.css'
},{
	name : '排课项目',
	url : 'http://zhxy.bjzzschool.com/paike/common/indexbjzz/js/index.js'
},{
	name : '综合素质评价项目',
	url : 'http://zhxy.bjzzschool.com/byymoral/resources/js/newindex.js'
},{
	name : '选课项目',
	url : 'http://zhxy.bjzzschool.com/byyxk/resources/js/campus/bjzz/index.js'
},{
	name : '教务项目',
	url : 'http://zhxy.bjzzschool.com/byycampusjw/resources/js/index.js'
},{
	name : '资源项目',
	url : 'http://zhxy.bjzzschool.com/byyresource/resources/js/myresource/index.js'
}
];

function work(){

	//对数组内的数据进行检查是否存活，如果没有存活，则邮件
	async.mapLimit(array,1,function(item,cb){
		check(item,cb);
	},function(err,values){
		//检查完毕，进行邮件发送
		var arr = values.filter(function(a){
			return !a.live;
		});
		if(arr.length > 0){//存在未启动或报错的项目进行邮件发送
			send(arr);
		}else{
			console.log('本次检查项目全部正常');
		}
		//下次查询
		setTimeout(function(){
			work();
		},10 * 60 * 1000);
	});

}
function check(item,cb){
	superagent.get(item.url)
	.set({
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
		'Accept-Encoding': 'gzip, deflate',
		'Accept-Language': 'en,zh-CN;q=0.9,zh;q=0.8',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive',
		'Cookie': 'SESSION=2a37080b-6dcd-4030-9827-c3110825f3c5; Hm_lvt_b0474253cc9d735d0a714670e344da53=1547722097,1547775014,1548311215,1548640957; SESSION=84c721b5-5a4c-4cd7-ace5-9d43cef3c676; Hm_lpvt_b0474253cc9d735d0a714670e344da53=1548641414',
		'Host': 'zhxy.bjzzschool.com',
		'Pragma': 'no-cache',
		'Upgrade-Insecure-Requests': '1',
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
	})
	.end(function(err,res){
		if(err){
			console.log(err);
			item.live = false;
			cb(null,item);
		}else{
			item.live = true;
			cb(null,item);
		}
	});
}
function send(arr){
	var title = arr.map(_=>_.name).join(',');
	superagent.post('localhost:2500/sms')
	.send({
		phone :config.phone.my,
		templateId : config.phone.tid,
		params : title
	})
	.end(function(err,res){
		if(err){
			console.log('短信请求失败')
		}else{
			console.log('短信发送结果:'+res.text);
		}
	})
}

module.exports = work;