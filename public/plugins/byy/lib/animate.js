/***
 * 通过require 引入 animate的样式文件
 * 引入animate.css
 * @since 2017年12月8日 14:41:20
***/
byy.define(function(exports ){
	var animate = {
		hasLoad : false,
		href : 'modules/animate/animate.css',
		id : 'byyanimatecss',
		load : function(){
			byy.addcss(animate.href,function(){
				animate.hasLoad = true;
			},animate.id);
		},
		/*重新加载*/
		reload : function(){
			if(document.getElementById('byycss-'+animate.id)){
				var a = document.getElementById('byycss-'+animate.id);
				a.parentNode.removeChild(a);
			}
			animate.load();
		}
	};
	animate.load();
	exports('animate',animate);
});