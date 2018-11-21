//每天记录当天的天气和昨天的黄金价格

//天气：和风；黄金：抓取

var data = require('../json/config');
var location = data.weather.location,
	key = data.weather.key,
	templateId = data.weather.templateId,
	gf = data.phone.gf,
	my = data.phone.my;
location = encodeURIComponent(location);
var weatherUrl = 'https://free-api.heweather.com/s6/weather?location='+location+'&key='+key;

var superagent = require('superagent');

function getWeather(){
	return new Promise(function(resolve,reject){
		superagent.get(weatherUrl).end(function(err,res){
			if(err){
				reject('');
			}else{
				var json = JSON.parse(res.text);
				var weatherData = json.HeWeather6[0];
				var a1 = weatherData.daily_forecast[0].cond_txt_d,
					a2 = weatherData.daily_forecast[0].wind_sc,
					a3 = weatherData.daily_forecast[0].wind_dir,
					a4 = weatherData.daily_forecast[0].tmp_max,
					a5 = weatherData.daily_forecast[0].tmp_min,
					a6 = weatherData.lifestyle[0].brf,
					a7 = weatherData.lifestyle[0].txt;
				var txt = '天气'+a1+','+a2+'级'+a3+',温度'+a5+'°-'+a4+'°,'+a7;
				resolve(txt);
			}
		})
	})
}

function sms(txt,phone){
	return new Promise(function(resolve,reject){
		superagent.post('localhost:2500/sms')
		.send({
			phone :phone,
			templateId : templateId,
			params : txt
		})
		.end(function(err,res){
			if(err){
				reject('');
			}else{
				resolve(txt)
			}
		})
	});
}

module.exports = function Weather(){
	var d = new Date();
	var hour = d.getHours();
	if(hour == 7){
		getWeather().then(function(txt){
			return sms(txt,gf);
		}).then(function(){
			setTimeout(function(){
				Weather();
			},60 * 60 * 1000)
		}).catch(function(){
			setTimeout(function(){
				Weather();
			},60 * 60 * 1000)
		})
	}else{
		setTimeout(function(){
			Weather();
		},60 * 60 * 1000)
	}
}