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
	var urls = [
		{url : '/', 				changefreq : 'daily' , 		priority : 0.3 },
		{url : '/article', 			changefreq : 'daily' , 		priority : 0.3 },
		{url : '/demo',				changefreq : 'weekly' , 	priority : 0.5 },
		{url : '/about',			changefreq : 'monthly',		priority : 0.7 },
		{url : '/pdf',				changefreq : 'monthly',		priority : 0.7 },
		{url : '/picture',			changefreq : 'daily',		priority : 0.3 },
		{url : '/caipu/home',		changefreq : 'yearly',		priority : 0.8 },
		{url : '/caipu/search',		changefreq : 'monthly',		priority : 0.8 }

	];
	query([{
		sql : 'select link,ctime from user_article where ispublish=1 order by ctime desc',params : []
	},{
		sql : 'select id,title from caipu_item',params : []
	},{
		sql : 'select id,name from caipu_fenlei',params : []
	}]).then(function(rs){
		var article = rs[0];//文章链接
		var caipus = rs[1];//菜谱地址
		var fenleis = rs[2];//菜谱分类

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
			
			article.forEach(function(item){
				urls.push({url : item.link , changefreq : 'yearly', priority : 1.0 , lastmod : item.ctime,lastmodrealtime : true});
			})

			demoLink.forEach(function(href){
				urls.push({url : href, changefreq : 'monthly', priority : 1.0 ,lastmodrealtime : true,lastmodfile : path.join(__dirname,'../public/',href)});
			})
			caipus.forEach(function(item){
				urls.push({url : '/caipu/show/'+item.id,changefreq : 'yearly', priority : 0.8 });
			})
			fenleis.forEach(function(item){
				urls.push({url : '/caipu/fenlei?id='+item.id,changefreq : 'yearly',priority : 0.8})
			})
			
			//生成
			createXml(urls);
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
function createXml (urls){
	var sm = require('sitemap');
	var sitemap = sm.createSitemap({
		hostname : domain,
		cacheTime : 600000,
		urls : urls
	});
	fs.writeFileSync(sitemapPath,sitemap.toString());
}

module.exports= start;