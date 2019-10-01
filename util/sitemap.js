//提供进行更新sitemap 函数

var fs = require('fs');
var path = require('path');
var query = require('sqlquery-tool');
var db = require('../lib/config').mysql;
var superagent = require('superagent');
var cheerio = require('cheerio');

var sitemapPath = path.join(__dirname,'../public/sitemap.xml');
var domain = 'https://chrunlee.cn';


function fetch(cb){
    var urls = [
        {url : '/',                 changefreq : 'daily' ,      priority : 0.3 },
        {url : '/article',          changefreq : 'daily' ,      priority : 0.3 },
        {url : '/demo',             changefreq : 'weekly' ,     priority : 0.5 },
        {url : '/about',            changefreq : 'monthly',     priority : 0.7 },
        {url : '/pdf',              changefreq : 'monthly',     priority : 0.7 },
        {url : '/picture',          changefreq : 'daily',       priority : 0.3 },
        {url : '/caipu/home',       changefreq : 'yearly',      priority : 0.8 },
        {url : '/caipu/search',     changefreq : 'monthly',     priority : 0.8 }

    ];
    query.query([{
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
            createXml(urls,cb);
        });
    }).catch(function(e){
        console.log(e);
        if(cb){
            cb(e);
        }

    })
}
function createXml (urls,cb){
    var sm = require('sitemap');
    var sitemap = sm.createSitemap({
        hostname : domain,
        cacheTime : 600000,
        urls : urls
    });
    fs.writeFileSync(sitemapPath,sitemap.toString());
    if(cb)cb();
}

module.exports= fetch;