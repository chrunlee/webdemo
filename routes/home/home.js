var express = require('express');
var router = express.Router();
var fs = require('fs');
/* GET home page. */
router.get('/', function(req, res, next) {
	
	res.render('index', {
		site : this.mysite
	});
});

module.exports = router;
