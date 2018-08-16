var hasLoad = false;
function Record () {
	this.page = 1;
	this.init();
}

byy.extend(Record.prototype,{
	events : {
		
		//保存数据
		save : function(){
			var data = byy('.byy-form').getValues();
			console.log(data);
			$.ajax({
				url : '/center/record/save',
				type : 'post',
				data : data,
				success : function(res){
					if(res.success){
						byy.win.msg('保存成功',function(){
							byy.win.closeAll();
							//刷新
							window.location.reload();
						});
					}else{
						byy.win.msg('保存失败')
					}
				}
			});
		},
		deleteFile : function(){
			var filePath = $('[name="filePath"]').val();
			console.log(filePath);
			$.ajax({
				url : '/center/upload/delete',
				type : 'post',
				data : {filePath : filePath},
				success : function(res){
					if(res.success){
						hasLoad = false;
						$('#showImage').attr('src','');
						$('[name="filePath"]').val('');
					}else{
						byy.win.msg('删除失败')
					}
				}
			});
		},
		showBig : function(){
			var path = $(this).attr('src');
			byy.win.photos({
				photos : {
					title : '',
					id : '',
					start : 0,
					data : [{
						src : path,
						thumb : path
					}]
				}
			});
		}
	},
	init : function(){
		var that = this;
		
		$('body').on('click','[filter]',function(ev){
			var $this = $(this);
			var data = $this.data();
			var type = $this.attr('filter');
			that.events[type].call($this,data);
		})	

		byy.uploader().simpleImage({
			server : '/center/upload',
			selector : '#upload',
			onBefore : function(){
				if(hasLoad){
					byy.win.msg('请删除后再上传，且只能上传一张图片')
				}else{
					byy.win.load(1);
				}
				return !hasLoad;
			},
			onSuccess : function(file,res){
				byy.win.closeAll('loading');
				if(res.success){
					var filePath = res.result.filePath;
					$('#showImage').attr('src',filePath);
					$('[name="filePath"]').val(filePath);
					//禁用上传..
					hasLoad = true;
				}else{
					byy.win.msg(res.msg);
				}
			}
		});
	}
})

byy.require(['uploader','slider','win','template'],function(){
	new Record();
})