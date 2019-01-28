
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