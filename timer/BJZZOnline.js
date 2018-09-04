//检查正泽产品是否在线
var superagent = require('superagent');
var cheerio = require('cheerio');
var host = 'http://zhxy.bjzzschool.com/login',
	smshost = 'localhost:2500/sms';
var count = 0;
var pne = ['1','5','6','1','0','3','1','1','1','6','0'],
	tid = ['1','8','5','4','3','2'],
	params = '产品:北京正泽学校官网';

function retry (flag){
	setTimeout(function(){
		checkOnline();
	},flag ? 10 * 60 * 1000 : 5 * 1000);
}
function sms(){
	console.log('短信发送');
	return ;
	superagent.post('localhost:2500/sms')
	.send({
		phone :pne.join(''),
		templateId : tid.join(''),
		params : params
	})
	.end(function(err,res){
		if(err){
			console.log('短信请求失败')
		}else{
			console.log('短信发送结果:'+res.text);
		}
	})
}
function checkOnline(){
	console.log('开始检查是否在线')
	count++;//累积次数
	if(count >= 4){
		//短信发送
		sms();
		count = 0;
		retry(true);
	}
	superagent.get(host).end(function(err,res){
		if(err){
			console.log(err);
			retry(false);
		}else{
			if(res.text){
				var $ = cheerio.load(res.text);
				var title = $('title').text();
				if(title == '北京市正泽学校'){
					console.log('正常在线')
					count = 0;//清空
					retry(true)
				}else{
					console.log(title);
					retry(false);
				}
			}else{
				console.log('没有内容')
				retry(false);
			}
		}
	})
}
module.exports = checkOnline;