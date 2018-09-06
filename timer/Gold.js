//黄金处于赔本中，到了270 再告诉我...不然再也不看了

//1.获得当时的美元汇率

var huilv = 'http://web.juhe.cn:8080/finance/exchange/rmbquot';
var config = require('../json/config').juhe;

var superagent = require('superagent');

var cheerio = require('cheerio');

var defaultHuilv = '6.82';

function getHuilv (){
	return new Promise(function(resolve,reject){
		huilv = huilv+'?key='+config['huilv-key'];
		console.log(huilv);
		superagent.get(huilv)
		.end(function(err,res){
			if(err){
				resolve(defaultHuilv);
			}else{
				var d = JSON.parse(res.text);
				defaultHuilv = parseInt(d.result[0].data1.bankConversionPri,10) / 100;
				resolve(defaultHuilv);
			}
		})
	})
}

var huangjin = 'https://hq.sinajs.cn/rn=1536217017248&list=hf_AUTD,hf_AGTD,hf_XPT';
function getHuangjin(){
	return new Promise(function(resolve,reject){
		superagent.get(huangjin).end(function(err,res){
			if(err){
				reject(false);
			}else{
				console.log(res.text);
				var $ = cheerio.load(res.text);
				var $price = $('.r_g_price_now');
				console.log($price);
				resolve(11);
			}
		})
	})
	
}

getHuangjin().then(function(v){
	console.log(v);
})