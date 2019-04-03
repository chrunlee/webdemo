//pdf 页面浏览新增
byy.require(['jquery','uploader','win','common'],function(){

	byy.bindEvents({
		preview : function(data){
			location.href = data.href;
		},
		openMenu : function( data ){
			let id = data.id;
			//进行重新获取
			location.href = '/pdf?c='+id;
		},
		delete : function(d){
			$.ajax({
				url : '/pdf/delete',
				type : 'POST',
				data : {id : d.id},
				success : function(){
					byy.win.msg('删除成功')
					location.reload();
				}
			});
		},
		addPdf : function(){
			if($('.addpdf-form').hasClass('hide')){
				$('.addpdf-form').removeClass('hide');
				$('.pdf-list').addClass('hide');
				//加载上传组件
				byy.uploader().simpleFile({
					selector : '#addPdfUploader',
					accept : {
						extensions : 'pdf',
						mimeTypes :  ['application/pdf']
					},
					server : '/center/upload/file',
					onSuccess : function(file,res){
						$('[name="pdfpath"]').val(res.result.filePath);
						$('[name="title"]').val(res.result.name);
						var filesize = byy.formatSize(file.size)
						$('[name="filesize"]').val(filesize);
						$('#pdfPathShow').html(res.result.filePath);
					}
				});
				//加载上传组件
				byy.uploader().simpleImage({
					selector : '#addPdfPost',
					server : '/center/upload/file',
					onSuccess : function(file,res){
						$('[name="postpath"]').val(res.result.filePath);
						$('#postPathShow').html(res.result.filePath);
					}
				});
			}
			
		},
		//添加目录分类
		addCategory : function(){
			byy.win.prompt('输入分类确定',function(value,index){
				$.ajax({
					url : '/pdf/category',
					type : 'POST',
					data : {name : value},
					success : function(res){
						if(res.success){
							byy.win.close(index);
							byy.win.msg('添加成功')
							//进行重新渲染
							var html = res.list.map(function(item){
								return '<option value="'+item.id+'">'+item.name+'</option>';
							}).join('');
							$('[name="categoryid"]').html(html);
							byy($('[name="categoryid"]').parent()).initUI();
						}
					}
				});
			},function(){
				console.log('abc');
			});
		},

		//保存表单
		savePdf : function(){
			var data = byy('form').getValues();
			console.log(data);
			//提交
			byy.win.load(1);
			$.ajax({
				url : '/pdf/save',
				type : 'POST',
				data : data,
				success : function(res){
					byy.win.closeAll();
					//保存后刷新
					if(res.success){
						location.reload();
					}else{
						byy.win.msg(res.msg);
					}
				}
			});
		}

	});

	

});