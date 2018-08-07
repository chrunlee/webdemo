/**音乐点播**/
var express = require('express');

var router = express.Router();

var query = require('simple-mysql-query');

router.get('/',function(req,res,next){

	res.render('music/index')

});

router.get('/random',function(req,res,next){
	query({
		sql : 'select * from music_music order by rand() limit 0,1',params : []
	}).then(function(rs){
		var music = rs[0][0];
		res.end(JSON.stringify(music));
	}).catch(function(err){
		console.log(err);
		res.end('');
	})
})

module.exports = router;