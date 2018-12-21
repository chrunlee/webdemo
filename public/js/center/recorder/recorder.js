var hasLoad = false;
function Record () {
	this.page = 1;
	this.init();
}

byy.extend(Record.prototype,{
	events : {
		addMoment : function(){
			console.log('moment');
			byy.win.open({
				type : '1',
				title : '添加美好瞬间',
				content : $('.add-moment'),
				area : ['50%','60%'],
				success : function(){
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
								$('.byy-byywin .byy-form #showImage').attr('src',filePath);
								$('.byy-byywin .byy-form [name="filePath"]').val(filePath);
								//禁用上传..
								hasLoad = true;
							}else{
								byy.win.msg(res.msg);
							}
						}
					});
				}
			});
		},
		//保存数据
		save : function(){
			var data = byy('.byy-byywin .byy-form').getValues();
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
			var filePath = $('.byy-byywin .byy-form [name="filePath"]').val();
			console.log(filePath);
			$.ajax({
				url : '/center/upload/delete',
				type : 'post',
				data : {filePath : filePath},
				success : function(res){
					if(res.success){
						hasLoad = false;
						$('.byy-byywin .byy-form #showImage').attr('src','');
						$('.byy-byywin .byy-form [name="filePath"]').val('');
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
		//start 
		//slier
		var that = this;
		byy.slider.render({
			arrow : 'none',
			indicator : 'none',
			width : '100%',
			height:'300px',
			ainm : 'fade',
			elem : '#slider',
			interval : '5000'
		});

		$('body').on('click','[filter]',function(ev){
			var $this = $(this);
			var data = $this.data();
			var type = $this.attr('filter');
			that.events[type].call($this,data);
		})
		
		//加载数据
		that.loadData();

	},
	loadData : function(){
		//远程获取
		var that = this;
		$.ajax({
			url : '/center/record/get',
			type : 'post',
			data : {page : that.page},
			success : function(res){
				if(res.success){
					var values = res.rows;
					console.log(values);
					var htmls = values.map(function(item){
						var time = item.ctime;
						item.year = time.split(' ')[0].split('-')[0]
						item.month = time.split(' ')[0].split('-')[1];
						item.day = time.split(' ')[0].split('-')[2];
						item.date = item.month+'月'+item.day;

						var html = `<div class="byy-timeline-block">
									<!--图标 -->
									<div class="byy-timeline-icon blue-bg">
										<img src="${item.imgpath}" alt="">
									</div>
									<!-- 主体内容 -->
									<div class="byy-timeline-content">
										<img src="${item.imgpath}" alt="" filter="showBig">
										<h2>${item.title}</h2>
										<p>${item.des}</p>
										<span class="byy-timeline-date">
											${item.year}<br><small>${item.date}</small>
										</span>
									</div>
								</div>`;
						return html;
					}).join('');
					$('#photoAlbum').append(htmls);
				}else{
					byy.win.msg('没有数据');
				}
			}
		});
	}
})

byy.require(['uploader','slider','win','template'],function(){
	new Record();
})