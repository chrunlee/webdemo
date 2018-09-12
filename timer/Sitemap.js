//每天晚上8点定时更新sitemap数据

//内容包括，固定的首页、博客、demo 三部分，以及其他的零散的页面

//1.
var fs = require('fs');
var path = require('path');
var query = require('simple-mysql-query');
var db = require('../lib/config').mysql;
var superagent = require('superagent');
var cheerio = require('cheerio');

query(db);

var sitemapPath = path.join(__dirname,'../public/sitemap.xml');
var domain = 'https://chrunlee.cn';
var links = [
	'/',
	'/article',
	'/demo',
	'/about',
	'/article/public.html',
	'/picture',
	'/caipu/home'
	//以上几个都是固定的，剩余的就是文章为主

];//链接

function start (){
	var d = new Date();
	var hour = d.getHours();
	if(hour == 20 || hour == 11){
		//更新
		fetch();
	}else{
		setTimeout(function(){
			start();
		},60 * 60 * 1000)
	}
	
}

function fetch(){
	query({
		sql : 'select link,ctime from user_article where ispublish=1 order by ctime desc',params : []
	}).then(function(rs){
		var article = rs[0];//文章链接
		var demoLink = [];
		//还有demo链接
		superagent.get(domain+'/demo')
		.end(function(err,res){
			if(!err){
				var $ = cheerio.load(res.text);
				$('.demo-link').each(function(index,item){
					demoLink.push(item.attribs.href);
				})
			}
			//构建并生成
			var xml = '<?xml version="1.0" encoding="utf-8"?><urlset>';
			links.forEach(function(href){
				xml+= getUrl(href);
			})
			article.forEach(function(item){
				xml+= getUrl(item.link,item.ctime);
			})
			demoLink.forEach(function(href){
				xml+=getUrl(href);
			})
			xml+='</urlset>'
			//生成
			createXml(xml);
			setTimeout(function(){
				start();
			},60 * 60 * 1000)
		});
	}).catch(function(){
		setTimeout(function(){
			start();
		},60 * 60 * 1000)
	})
}
function createXml (str){
	fs.writeFileSync(sitemapPath,str);
}
function getUrl(url,time){
	url = domain+url;
	time = time ? time.substring(0,10) : '';
	return '<url><loc>'+url+'</loc>'+(time ? '<lastmod>'+time+'</lastmod>' : '<changefreq>daily</changefreq>')+'</url>';
}

module.exports= start;