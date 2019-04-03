var express = require('express');
var router = express.Router();

var query = require('simple-mysql-query');

router.get('/',async function(req,res,next){
	//查询pdf
	let cId = req.query.c;
	//根据第一个类别来处理
	let categoryList = await query({
		sql : 'select t1.categoryid as id,t2.name,count(1) as num from user_pdf_pdf_category t1 left join user_pdf_category t2 on t1.categoryid = t2.id group by t1.categoryid order by t1.categoryid',params : []
	});
	let optionList = await query({
		sql : 'select * from user_pdf_category ',params : []
	});
	let firstCateId = cId || ((categoryList[0][0] || {}).id || '');
	let list = await query({
		sql : 'select t2.* from user_pdf_pdf_category t1 left join user_pdf t2 on t1.pdfid= t2.id where t1.categoryid=? ',params : [firstCateId]
	})
	res.render('index/pdf',{
		pdf : list[0],
		categoryId : firstCateId,
		categoryList : categoryList[0],
		optionList : optionList[0],
		site : this.mysite,
		user : req.session.user,
		github : req.session.github,
		d : {
			header : 'pdf'
		}
	});
})
//删除文档
router.post('/delete',async function(req,res,next){
	var id = req.body.id;
	if(req.session.user){
		//同时删除对应的文件？不需要，有定时清理
		let rst = await query([{
			sql : 'delete from user_pdf where id=?',params : [id]
		},{
			sql : 'delete from user_pdf_pdf_category where pdfid=?',params :[id]
		}]);
		res.json({
			success : true
		});
	}else{
		res.json({
			success : true
		});
	}
})
//pdf 数据保存
router.post('/save',async function(req,res,next){
	let body = req.body;
	if(req.session.user){
		let paramsA = [body.title,body.author,body.postpath,body.pdfpath,body.filesize,body.description,new Date()];
		let insertA = await query({
			sql : 'insert into user_pdf (title,author,postpath,pdfpath,filesize,description,createtime) values (?,?,?,?,?,?,?)',params : paramsA
		});
		//插入关联表
		let sqlparams = '';
		let sqlparamsB = [];
		(body['categoryid'] ? [body['categoryid']] : body['categoryid[]']).forEach(str=>{
			sqlparams += '(?,?),';
			sqlparamsB.push(insertA[0].insertId);
			sqlparamsB.push(str);
		})
		sqlparams = sqlparams.substr(0,sqlparams.length-1);
		let insertB = await query({
			sql : 'insert into user_pdf_pdf_category (pdfid,categoryid) values '+sqlparams,params : sqlparamsB
		})
		res.json({
			success : true
		});
	}else{
		res.json({
			success : true
		});
	}
})
//保存pdf的分类目录
router.post('/category',async (req,res,next)=>{
	let name = req.body.name;
	//保存，并返回ID，进行重新刷新？
	let id = await query({
		sql : 'insert into user_pdf_category (name) values (?)',params : [name.trim()]
	});
	//查找列表返回
	let list = await query({
		sql : 'select * from user_pdf_category',params : []
	});
	res.json({
		success : true,
		list : list[0]
	});
})
module.exports = router;