/*图片相关处理*/
var express = require('express');
var router = express.Router();
var key = require('../../json/wx').pickey;
var api = 'https://pixabay.com/api/?key='+key+'&lang=zh&image_type=photo&pretty=true';
var superagent = require('superagent');
router.get('/',(req,res,next)=>{
	//1.检索比较流行的几张图片
	superagent.get(api+'&q=')
	.end(function(err,res2){
		if(err){
			res.render('picture/index',{
				images : [],
				searchValue : ''
			})
		}else{
			var resobj = JSON.parse(res2.text);
			res.render('picture/index',{
				images : resobj.hits,
				searchValue : ''
			});
		}
	})
})
router.post('/search',(req,res,next) => {

	var q = req.body.q;
	q = encodeURIComponent(q);
	var page = req.body.page;
	superagent.get(api+'&q='+q+'&page='+page)
	.end(function(err,res2){
		if(err){
			res.end(JSON.stringify([]))
		}else{
			var text = res2.text;
			res.end(text);
		}
	})
})
router.get('/search',(req,res,next) => {
	var q = req.query.search;
	var dq = encodeURIComponent(q);
	var page = 1;
	superagent.get(api+'&q='+dq+'&page='+page)
	.end(function(err,res2){
		if(err){
			res.render('other/picture/index',{
				images : [],
				search : true,
				searchValue : q
			})
		}else{
			var resobj = JSON.parse(res2.text);
			res.render('other/picture/index',{
				images : resobj.hits,
				search : true,
				searchValue : q
			});
		}
	})
})
module.exports = router;