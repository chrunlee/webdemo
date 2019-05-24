//心愿单管理

var express = require('express');
var router = express.Router();

var query = require('simple-mysql-query');


router.get('/view/:id',function(req,res,next){
    query([{
        sql : 'select * from wish_list_option where wishid=?',
        params : [req.params.id]
    },{
        sql : 'select * from wish_list where id=?',params : [req.params.id]
    }])
    .then(rs=>{
        if(rs[1].length == 0){
            res.redirect('/');
        }else{
            var list = rs[0],wish = rs[1][0];

            res.render('center/wish/view',{
                wish : wish,
                list : list
            })
        }

    })
});

module.exports = router;