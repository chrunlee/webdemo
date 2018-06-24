var express = require('express');
var router = express.Router();
var fs = require('fs');
/* GET home page. */
router.get('/', function(req, res, next) {
	//查询
	res.render('exam/index', {});
});

module.exports = router;
