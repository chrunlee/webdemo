let express = require('express');

let router = express.Router();
let query = require('sqlquery-tool');
let ding = require('../../lib/dingwo');
let tool = require('../../util/tool');


router.all('/',async (req,res,next)=>{
    console.log(req.body);
    let data = req.body;
    //根据deviceid 来进行校验设备
    let deviceList = await query.search('order_device').list();
    let currentId = data.deviceid;
    let hasCheck = false;
    deviceList.forEach(item=>{
        if(item.deviceid == currentId){
            hasCheck = true;
        }
    })
    if(hasCheck){//进行相关订单操作
        let insertData = {
            fromtype : data.type,
            orderno : data.orderno||'',
            orderprice : data.money || '',
            ordertime : data.time ||'',
            orderuser : data.user || '',
            orderstatus : 1,
            sendstatus : 0,
            title : data.title || '',
            deviceid : data.deviceid || '',
            content : data.content || ''
        }
        let rs = await query.search('order_list').insert(insertData);
        console.log(rs);
        //根据价格查找当前时间6分钟以内的该价格的订单
        let  undoList = await query.query({
            sql : 'select * from order_user where time_to_sec(now()) - time_to_sec(starttime) < 360 and price=? and status=?' ,params : [data.money,'0']
        }).then(rs=>rs[0]);
        if(undoList == null || undoList.length == 0){
            //说明有人付款，但是未查到是谁付款。这里请给我个钉钉
            await ding('商品售卖:有人付款，但是未查询到订单来源。('+data.content+')');
        }else{
            console.log(undoList);
            //找到订单人
            let order = undoList[0];
            //获得邮箱地址，发送内容
            let email = order.email,goodId = order.goodid;
            //更新状态
            await query.search('order_user').where({id : order.id}).update({status : '1'});
            //获得商品的发送内容
            let goodList = await query.search('order_goods').where({id : goodId}).list();
            if(null == goodList || goodList.length == 0){
                //商品不存在，请ding我
                await ding('商品售卖:商品不存在，请检查.('+goodId+')');
            }else{
                let goodItem = goodList[0];
                let sendContent = goodItem.content;
                let goodName = goodItem.name;
                let sucnum = goodItem.sucnum || 0;
                //发送邮件
                await tool.sendOrderEmail(email,goodName,sendContent);
                //更新订单状态和数量
                await query.search('order_list').where({id : rs.insertId}).update({sendstatus : '1'});
                await query.search('order_goods').where({id : goodId}).update({sucnum : sucnum+1});
                //顶我
                await ding('商品售卖:交易成功。('+data.content+')');
            }
        }
        res.json({success : true,msg :'接受成功'});
    }else{
        //当前数据无效
        res.json({success : false,msg : '无效数据'});
    }
})
module.exports = router;