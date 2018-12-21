byy.require(['jquery','slider','win','store','common'],function(){
	byy.slider.render({
		elem : '#banner',
		height : '200px',
		width : '100%',
		indicator : 'none',
		interval : 5000
	});

	byy.bindEvents({
		login:function(){
			byy.common.login();
		},
		addZan : function(data){
			var id = data.id;
			var $zan = $(this);
			if($zan.hasClass('has')){
				return;
			}
			$.ajax({
				url : '/article/zan',
				type : 'post',
				data : {id : id},
				success : function(res){
					if(res.success){
						byy.win.msg('您的点赞是我最大的动力.感谢~~');
						$zan.addClass('has');
						//更新数据
						var arr = byy.store.local('zan') || {};
						arr[id] = true;
						byy.store.local('zan',arr);
					}else{
						$zan.addClass('has');//假赞
					}
				}
			});
		}
	});
	//检查是否已经点赞
	function checkZan (){
		var arr = byy.store.local('zan')||{};
		$('.zan').each(function(){
			var id = $(this).data('id');
			var has = false;
			for(var item in arr){
				if(item == id){
					has = true;
				}
			}
			if(has){
				$(this).addClass('has');
			}
		})
	}

	checkZan();//初始化检查
})