//目前提供dat 转化数量获取接口

let express = require('express');

let router = express.Router();

let query = require('simple-mysql-query');

router.get('/count',(req,res,next)=>{
    query({sql : 'select intval from site_set where name=? ',params:['datcount']})
    .then(rs=>{
        let count = rs[0][0].intval;
        res.json({
            count : count,
            msg : '已为<span style="color:red;font-weigth:bold;">'+count+'</span>个dat文件提供转化服务'
        });
    })
})
module.exports = router;