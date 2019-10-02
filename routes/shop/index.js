/***
个人商店
***/
let express = require('express');
let router = express.Router();
let query = require('sqlquery-tool');
let qr_image = require('qr-image');
let marked = require('marked');
let ding = require('../../lib/dingwo');
let fs = require('fs');
//markdown 解析器
var renderer = new marked.Renderer();
//重写解析规则
renderer.link = function(href,title,text){
    return '<a href="'+href+'" title="'+text+'" target="_blank">'+text+'</a>';
}
marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,//消毒：意思是将html转义成&xxx等。
    silent : true,
    smartLists: true,
    smartypants: false

});

//首页
router.get('/',async function (req,res,next){
    let list = await query.search('order_goods').order({order : 'desc',column : 'updatetime'}).list();
    res.render('shop/index',{
        site : req.session.mysite,
        rows : list
    });
})

//good detail
router.get('/detail/:id.html',async (req,res,next)=>{
    if(req.params.id){
        let good = await query.search('order_goods').where({id : req.params.id}).list();
        if(null == good || good.length == 0){
            res.redirect('/shop');
        }else{
            let item = good[0];
            item.html = marked(item.description,{renderer : renderer});
            let ua = require('../../lib/UA')(req.headers['user-agent']);
            res.render('shop/detail',{
                item : item,
                ismobile : ua.os == 'android'||ua.os == 'ios' ? true : false,
                site : req.session.mysite
            })
        }
    }else{
        res.redirect('/shop');
    }
})
router.post('/care',async (req,res,next)=>{
    let id = req.body.id;
    if(id){
        let list = await query.query({
            sql : 'update order_goods set viewnum = viewnum+1 where id=?',params : [id]
        }).then(rs=>rs[0])
    }
    res.json({success : false });
})
//更新session的email
router.post('/email',async (req,res,next)=>{
    let email = req.body.email;
    let type = req.body.type;
    req.session.deal = req.session.deal || {};
    if(email){
        req.session.deal.email = email;
    }
    if(type){
        req.session.deal.type = type;//支付方式。
    }
    res.json({success : true,msg : 'success'});
})
//交易区
router.get('/deal/:id',async (req,res,next)=>{
    try{
    await ding('商品售卖:有人进入交易区，请保持打开支付助手并打开微信支付宝消息提醒推送消息！！！');
    let goodId = req.params.id;
    if(!goodId){
        res.redirect('/shop/');
        return;
    }
    let goodList = await query.search('order_goods').where({id : goodId}).list();
    if(null == goodList || goodList.length == 0){
        res.redirect('/shop');
        return;
    }
    let goodItem = goodList[0];
    let price = parseFloat(goodItem.price,10);
    //如果当前session中没有email,则重新调回详情页面
    if(!req.session.deal || !req.session.deal.email){
        res.redirect('/shop/detail/'+goodId+'.html');
        return;
    }
    //根据sessionId 与 时间，配对当前唯一ID
    let sessionId = req.session.id;
    let datestr = ((+new Date())+'').substr(0,6);
    let uniqueId = sessionId+'_'+datestr;
    //检查当前数据库中是否存在待支付的订单
    let dealPrice = price;
    //待支付，且时间不超过5分钟的。
    let list = await query.query({
        sql : 'select * from order_user where time_to_sec(now()) - time_to_sec(starttime) < 300 and status=? and sid=? and goodid=?',params : ['0',uniqueId,goodId]
    }).then(rs=>rs[0])
    
    // let list = await query.search('order_user').where({goodid : goodId,status : '0' ,sid : uniqueId}).list();
    let longtime = null;
    if(null == list || list.length == 0){
        //当前不存在，则插入
        //1.0 获得当前可用的价格
        let countTimes = 1,hasCheck =false;
        let finalPrice = price;
        while(!hasCheck && countTimes < 6){
            let tempPrice = price - (0.01*countTimes);
            let checkPrice = parseFloat(tempPrice.toFixed(2));
            //检查
            let existsList = await query.query({
                sql : 'select * from order_user where UNIX_TIMESTAMP(now()) - UNIX_TIMESTAMP(starttime) < 300 and price=? and status=?',params : [checkPrice,'0']
            }).then(rs=>rs[0]);
            if(null == existsList || existsList.length == 0){
                //不存在，可以插入
                hasCheck = true;
                finalPrice = checkPrice;
            }else{
                countTimes ++;
            }
        }
        if(!hasCheck){
            res.writeHead(200,{'Content-Type':'text/html'});    
            res.write('<head><meta charset="utf-8"/></head>');
            res.write('<script>alert("当前商品交易比较火爆，请稍后几分钟进行尝试")</script>');
            res.end();
            return;
        }
        //根据价格生成支付宝的二维码，检查有没有该二维码，没有则生成。
        let starttime = new Date();
        longtime = starttime.getTime()+'';
        let insertData = {goodid : goodId,email : req.session.deal.email,price : finalPrice,status : '0',sid : uniqueId,starttime : starttime,startlong : longtime};
        let rs = await query.search('order_user').insert(insertData);
        dealPrice = finalPrice;
        dealId = rs.insertedID;
    }else{
        let orderObj = list[0];
        dealPrice = orderObj.price;
        dealId = orderObj.id;
        longtime = orderObj.startlong;
    }
    let ua = require('../../lib/UA')(req.headers['user-agent']);
    res.render('shop/deal',{
        site : req.session.mysite,
        item : goodItem,
        ismobile : ua.os == 'android' || ua.os == 'ios' ? true : false,
        data : {
            type : req.session.deal.type,
            email : req.session.deal.email,
            starttime : longtime,
            goodId : goodId,
            dealId : dealId,
            dealPrice : dealPrice
        }
    });
    return;
    }catch(e){
        console.log(e);
        //有出错，直接返回列表页面并进行提示。
        res.redirect('/shop');   
    }
})
//支付宝二维码
router.get('/qr',async (req,res,next)=>{
    let dealPrice = req.query.dealPrice;
    let dealId = req.query.dealId;
    let type = req.query.type || 'weixin';
    let list = await query.search('order_qr').where({price : dealPrice}).list();
    if(null == list || list.length ==0){
        res.end('二维码获取失败')
    }else{
        let obj = list[0];
        //判断当前是否是移动端
        let ua = require('../../lib/UA')(req.headers['user-agent']);
        let baseUrl = '';
        // if(ua.os=='android' || ua.os == 'ios'){
        //     // baseUrl = 'https://ds.alipay.com/?from=mobilecodec&scheme=alipays://platformapi/startapp?saId=10000007&clientVersion=3.7.0.0718&qrcode=';
        //     baseUrl = 'alipays://platformapi/startapp?saId=10000007&qrcode=';
        // }
        let imageObj = qr_image.image(baseUrl+(type == 'weixin' ? obj.weixin : obj.result));
        imageObj.pipe(res);
    }
})

module.exports = router;
