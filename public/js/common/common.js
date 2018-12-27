//通用函数或工具
byy.define(['jquery','win','store'],function(exports){
	var autoLogin = function(){
		if(!LoginUser){
			var id = byy.store.local('id');
			$.ajax({
				url : '/github/auto',
				type : 'post',
				data : {id : id},
				success : function(res){
					if(res.success){
						window.location.reload();
					}else{
						byy.store.clearLocal('id');
					}
				}
			});
		}else{
			byy.store.local('id',LoginUser.id);
		}
	};
	//获取后自动登录
	autoLogin();
	var common = {
		//弹窗登录
		login : function(){	
			var html = '<div class="login-div"><p>登录</p><p><img onclick="window.location.href=\'/github/login\'" src="/images/login-logo.png" /></p><span>github 登录</span></div>';
			if(!LoginUser){
				byy.win.open({
					type : '1',
					title : false,
					shadeClose : true,
					content : html,
					area : [400,500]
				});
			}
		}
	};
	exports('common',common);
})