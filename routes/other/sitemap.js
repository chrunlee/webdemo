var express = require('express');

var router = express.Router();

var sitemap = require('../../util/sitemap');
router.get('/',(req,res,next)=>{
    sitemap(function(err){
        if(err){
            res.end('sitemap 生成失败')
        }else{
            res.end('sitemap 更新完成')
        }
    });
})

module.exports = router;