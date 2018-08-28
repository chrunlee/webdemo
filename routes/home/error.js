var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/404', function(req, res, next) {
	res.render('error/404',{
		site : this.mysite
	})
});
router.get('/500', function(req, res, next) {
	res.render('error/500',{
		site : this.mysite
	})
});

module.exports = router;
