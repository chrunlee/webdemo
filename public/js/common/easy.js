/*** 
 * 游戏/娱乐/放松
 * @author chrunlee
 * @description 音乐+物理弹球小游戏
 ***/
 byy.define(['jquery'],function(exports){

 	/***
 	 * 加载后，自动在页面右侧增加点点图标，然后以此进行
 	 *
 	 ***/
 	 //默认的配置选项
 	 var _defaults = {
 	 	//获取音乐列表
 	 	musicUrl : '/music/random',
 	 	//获取单首音乐
 	 	musicById : '/music/',

 	 	container : $('body'),


 	 };

 	 var events = {
 	 	showdot : function(){
 	 		$(this).parent().toggleClass('closed');
 	 	},
 	 	music : function(){
 	 		createMusic();
 	 		getNext();
 	 	},
 	 	hideMusic : function(){
 	 		_defaults.container.find('.easy-music').addClass('closed');
 	 	},
 	 	nextMusic : function(){
 	 		getNext();
 	 	},
 	 	pauseMusic : function(){
 	 		getPause();
 	 		$(this).text($(this).text() == '暂停' ? '播放' : '暂停');
 	 	},
 	 	game : function(){

 	 	}
 	 };
 	 //创建页面原点
 	 function createDot(){
 	 	var html = `
		<div class="easy-dot closed">
			<span class="easy-dot-1" easyfilter="music"><i class="byyicon icon-play" ></i></span>
			<span class="easy-dot-2" easyfilter="game"><i class="byyicon icon-table"></i></span>
			<span class="easy-dot-center" easyfilter="showdot"></span>
		</div>
 	 	`;
 	 	_defaults.container.append(html);
 	 }
 	 //创建音乐面板
 	 function createMusic(){
 	 	if(_defaults.container.find('.easy-music').length == 0){
 	 		//不存在，则创建，存在，则显示
 	 		var html = `
			<div class="easy-music">
				<span class="easy-music-close" easyfilter="hideMusic"><i class="byyicon icon-close"></i></span>
				<div class="easy-music-avatar">
					<img src="" alt="" />
				</div>
				<div class="easy-music-info">
					<p class="easy-music-title"></p>
					<div class="easy-music-opt">
						<span class="byy-btn mini" easyfilter="nextMusic">下一首</span>
						<span class="byy-btn mini" easyfilter="pauseMusic">暂停</span>
					</div>
				</div>
				<div class="hide easy-music-audio"></div>
			</div>
 	 		`;
 	 		_defaults.container.append(html);
 	 	}else{
 	 		_defaults.container.find('.easy-music').removeClass('closed');
 	 	}
 	 }
 	 function getNext(){
 	 	$.ajax({
 	 		url : _defaults.musicUrl,
 	 		data : {},
 	 		type : 'GET',
 	 		success : function(res){
 	 			var obj = JSON.parse(res);
 	 			_defaults.container.find('.easy-music img').attr('src','data:image/png;base64,'+obj.base64);
 	 			_defaults.container.find('.easy-music .easy-music-title').text(obj.title);
 	 			_defaults.container.find('.easy-music-audio').html('<audio autoplay="true" src="'+obj.url+'"></audio>');
 	 			//增加监听
 	 			var audio = _defaults.container.find('audio').get(0);
 	 			audio.onended = function(){
 	 				getNext();
 	 			}
 	 		}
 	 	});
 	 }
 	 function getPause(){
 	 	var audio = _defaults.container.find('audio').get(0);
 	 	if(audio.paused){
 	 		audio.play();
 	 	}else{
 	 		audio.pause();	
 	 	}
 	 }
 	 createDot();

 	 byy.bindEvents('easyfilter',events);

 	 exports('easy',{
 	 	msg : '娱乐游戏安装成功'
 	 });

 });