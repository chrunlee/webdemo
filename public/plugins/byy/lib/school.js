/****
针对数校做出个性化处理
@author lixun
@created on 2017年4月28日 11:52:39
@description 对列表的表头进行滚动处理
****/

byy.define('jquery',function( exports){

	//滚动监听，隐藏顶部
	var exeHide = function(ev){
		var now = $(window).scrollTop();
		var $title = $('body').find('.list-panel .byy-panel-title');
		if($title.length > 0){
			$title = $($title.get(0));
			var width = $title.parent().width();
			var top = parseInt( $title.attr('top') ? $title.attr('top') : $title.attr('top',$title.offset().top) && $title.offset().top  , 10);
			var height = $title.height();
			//获得父页面frame的，此处特殊处理，只适合数校
			var $pbody = $(parent.window.document.body);
			var $nav = $pbody.find('.index-nav');
			var appcode = $nav.find('.index-nav-item.selected').attr('appcode');
			//获得frame
			var $frame = $pbody.find('.index-frame-item[appcode="'+appcode+'"]');
			//获得menu
			var $nav2 = $frame.find('.byy-nav');
			$title.css('width',width);
			if(now > top){
				$title.addClass('fixed');
				$nav2.hide();
				$('body').css('padding-top',height);
			}else{
				$title.removeClass('fixed');
				$('body').css('padding-top','0px').css('width','auto');
				$nav2.show();
			}
		}
	};
	var school = {
		version : '1.0',
		name : '博育云智慧教育服务平台',
		hide : exeHide
	};
	$(window).on('scroll',exeHide);
	//窗口变更
	var initList = function(){
		byy('.list-panel').list();
		exeHide();
	};
	$(window).resize(initList);
	exports('school',school);
});
