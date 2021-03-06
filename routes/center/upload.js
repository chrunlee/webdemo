/***
个人中心：过滤用户权限
***/

var express = require('express');

var router = express.Router();

var upload = require('../../util/upload');

var ImageUtil = require('../../util/ImageUtil');

var path = require('path');

var query = require('sqlquery-tool');

var fs = require('fs');

//文件上传
router.post('/',upload('file','public/upload/tmp'),function(req,res,next){
    if(req.file && req.session.user){
        var user = req.session.user;
        ImageUtil(user.id,req.file).then(function(rs){
            req.file.filePath = rs;
            res.json({
                success : true,
                result : req.file
            });
        }).catch(function(msg){
            res.json({
                success : false,
                msg : msg
            });
        })
    }else{
        res.json({
            success : false,
            msg : '未上传文件'
        })
    }
})
//文件上传
router.post('/file',upload('file','public/upload/tmp'),function(req,res,next){
    if(req.file && req.session.user){
        var user = req.session.user;
        ImageUtil.FileUtil(user.id,req.file).then(function(rs){
            req.file.filePath = rs;
            res.json({
                success : true,
                result : req.file
            });
        }).catch(function(msg){
            res.json({
                success : false,
                msg : msg
            });
        })
    }else{
        res.json({
            success : false,
            msg : '未上传文件'
        })
    }
})


//文件删除
router.post('/delete',function(req,res,next){
    var filePath = req.body.filePath
    if(req.session.user){
        //判断必须为upload目录下的文件
        var realPath = path.join(__dirname,'../../public',filePath);
        if(fs.existsSync(realPath)){
            fs.unlinkSync(realPath);
            res.json({
                success : true
            })
        }else{
            res.json({success : false})
        }
    
    }else{
        res.json({success : false})
    }
})

//微信dat文件解码
router.post('/dat',upload('file','public/upload/tmp'),(req,res,next)=>{
    //1.文件大小超过20M 且不是dat的即刻删除;
    //2.转码完成后删除;
    //3.解码完成后生成base64,删除；
    let base = 0xFF;
    let jn = 0xD8;
    let gifA = 0x47;
    let gifB = 0x49;
    let pngA = 0x89;
    let pngB = 0x50;

    var file = req.file||{name : 'errorfile',size :0};
    
    var maxSize = 1 * 1024 * 1024;
    var extName = '.dat';
    try{
        if(file.size == 0 || file.size > maxSize || path.extname(file.name).toLowerCase() != extName){
            fs.unlinkSync(file.filePath);
            res.json({success : false,msg : '文件不符合规范，已经删除'});
        }else{
            query.query({sql : 'update site_set set intval=intval+1 where name=?',params : ['datcount']})
            .catch(ea=>{console.log(ea)})
            //转成图片，然后转base64
            fs.readFile(path.join(__dirname,'../../',file.filePath),(err,content)=>{
                if(err){
                    res.json({success : false,msg : err.toString()})
                }else{
                    let firstV = content[0],
                        nextV = content[1],
                        jT = firstV ^ base,
                        jB = nextV ^ jn,
                        gT = firstV ^ gifA,
                        gB = nextV ^ gifB,
                        pT = firstV ^ pngA,
                        pB = nextV ^ pngB;
                    var coder = firstV ^ base;
                    if(jT == jB){
                        coder = jT;
                    }else if(gT == gB){
                        coder = gT;
                    }else if(pT == pB){
                        coder = pT;
                    }
                    let bb = content.map(br=>{
                        return br ^ coder
                    })
                    let b64 = bb.toString('base64');
                    fs.unlinkSync(file.filePath);
                    res.json({success : true,base64 : b64});
                }
            })
        }
    }catch(e){
        res.json({success : false,msg : '数据不规范'});   
    }
})


module.exports = router;