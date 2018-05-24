byy.require(['jquery','typper','win'],function(){
	byy('.des').typper(50);
	if(val('name')){
		window.location.href = '/demos/speed/speed.html';//gogo 
	}
	function saveName (){
		var name = $('#name').val();
		name = $.trim(name);
		if(name.length === 0){
			byy.win.msg('只有响亮的名字，才能活跃在排行榜上..随便写一个也行')
			return;
		}
		$.ajax({
			url : '/speed/name',
			type : 'POST',
			data : {name : name},
			success : function(res){
				var resObj = byy.json(res);
				if(!resObj.success){
					byy.win.msg(resObj.msg);
					return;
				}
				val('name',name);
				jump();
			}
		});
	}
	//监听回车、向右，点击时间
	function jump(){
		window.location.href = '/demos/speed/speed.html';
	}
	$('.gogo').on('click',saveName);
	$(window.document).on('keydown',function(ev){
		var code = ev.keyCode;
		console.log(code);
		if(code === 13 ){
			saveName();
		}
	})
})