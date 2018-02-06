/**
 * 实现下HTML5 中 audio的实现，主要支持MP3
 * 依赖jquery进行DOM操作，以及一些字体图标等
 **/

byy.define('jquery',function( exports ){

	/**
	配置的属性有：
	skin : 皮肤，支持长条、圆形、小点
	selector : 容器，用来渲染DOM
	music : { string array
		author : 作者
		title : 名字
		url : 链接
		lrc : 歌词
		post : 封面图片，如果不提供，则有默认的
	}
	autoplay : 自动播放
	showlrc : 是否显示歌词
	mode : 随机、顺序、单曲循环，如果只有一首音乐，则该设置不起作用，会一直重复播放
	setMusic : 设置音乐
	destroy : 销毁实例
	setSkin : 变更皮肤，销毁重置
	play : 播放
	pause : 暂停
	volume : 音量
	setNext : 下一首
	setPrev : 上一首
	setRandom : 随机播放
	
	onPlay : 播放事件
	onPause : 暂停事件
	onNext : 下一首
	onPrev : 上一首
	onDestroy : 销毁事件

------------
	


	**/
	//默认属性
	var defaults = {
		skin : 0,//0 长条，1 长条但是只有封面，2圆形，3小点
		music : [],//音乐列表
		autoplay : true,//是否默认播放，默认自动播放
		showlrc : false,//显示歌词，默认不显示
		debug : true,//开启debug
		mode : 0,//0 顺序播放，1 单曲循环，2列表循环播放，3随机播放
		onPlay : $.noop,//播放事件
		onPause : $.noop,//暂停事件
		onChange : $.noop,//歌曲切换
		onDestroy : $.noop//实例销毁事件

	};
	var templates = {
		play : '<i class="byyicon icon-play" audio-filter="play"></i>',
		pause : '<i class="byyicon icon-pause" audio-filter="pause"></i>'
	};
	if(byy.isMobile()){
		defaults.autoplay = false;//移动端取消默认播放，但是如果设置中设置，则会自动播放
	}
	//相关函数和属性设置
	var methods = {

		msg : function(method , title ){
			if(this.audio('getSettings','debug')){
				console.log('%c['+method+']:%c'+title,'color:green;','color:red');
			}
			return this;
		},
		//初始化
		init : function( settings ){
			this.audio('setSettings',defaults);
			this.audio('msg','init','初始化容器');
			var opts = defaults;
			if(typeof settings == 'string'){//如果是string,默认是一个mp3 url
				this.audio('msg','init','settings 为 url');
				opts.music = [this.audio('getMusicByUrl',settings)];
			}else{
				this.audio('msg','init','覆盖默认设置');
				opts = byy.extend(defaults,settings);
			}
			this.audio('setSettings',opts);
			this.audio('msg','init','输出当前的配置：'+ byy.stringfy(this.opts));

			this.audio('render').audio('initEvents');
			return this;
		},
		//根据当前的设置渲染内容
		render : function( index ){
			this.audio('msg','render','渲染DOM');
			var opts = this.audio('getSettings');
			
			var music = opts.music[index || 0],
				url = music.url;

			this.audio('setAudioByMusic',music).$ele.html(this.audio('getTemplate',music));
			
			if(opts.autoplay){
				this.audio('play');
			}

			return this;
		},
		//向列表中添加音乐
		addMusic : function( music ){
			var music = typeof music == 'stirng' ? this.audio('getMusicByUrl',music) : music;
			if(typeof music !== 'object'){
				var musics = this.audio('getSettings','music');
				musics.push(music);
				this.audio('setSettings','music',musics);
			}else{
				this.audio('msg','addMusic','添加的music参数不是对象或者url');
			}
			return this;
		},
		//播放歌曲
		play : function(){
			var audio = this.audio('getSettings','audio');
			if(audio.paused){
				audio.play();
				this.$ele.find('.byy-player-post').html(templates['pause']);
				this.audio('getSettings','onPlay').apply(this);
				//暂停其他实例的播放动作
			}
		},
		//设置某个时间点进行播放
		time : function( time , play ){
			var audio = this.audio('getSettings','audio');
			audio.currentTime =time;
			return this;
		},
		//切换
		toggle : function( flag ){
			var audio = this.audio('getSettings','audio');
			var isNowPaused = audio.paused;
			flag = flag == undefined || flag == null ? isNowPaused : flag;
			if( flag ){
				this.audio('play');
			}else{
				this.audio('pause');
			}
		},
		//暂停歌曲
		pause : function(){
			var audio = this.audio('getSettings','audio');
			if(!audio.paused){
				audio.pause();
				this.$ele.find('.byy-player-post').html(templates['play']);
				this.audio('getSettings','onPause').apply(this);
			}
		},
		//下一首
		next : function(){
			var musics = this.audio('getSettings','music');
			if(musics.length == 1){//只有一首歌曲，则重新播放
				this.audio('render');
			}else{
				//判断当前的模式：随机、顺序、循环等
			}
		},
		//上一首
		prev : function(){
			var musics = this.audio('getSettings','music');
			if(musics.length == 1){//只有一首歌曲，则重新播放
				this.audio('render');
			}else{
				//判断当前的模式：随机、顺序、循环等
			}
		},
		//
		//根据music信息获得audio对象
		setAudioByMusic : function( music ){
			this.audio('msg','setAudioByMusic','根据music设置audio信息');
			var audio = this.audio('getSettings','audio');
			var autoplay = this.audio('getSettings','autoplay');
			var preload = this.audio('getSettings','preload');
			audio = audio || document.createElement('audio');
			audio.src = music.url;
			audio.controls = false;
			audio.autoplay = false;
			audio.preload = preload || 'auto';
			this.audio('setSettings','audio',audio);

			return this;
		},
		//更新时间
		updateTime : function( currentTime ){
			if(currentTime){
				//由于在移动的时候太频繁，导致音频声音有点乱,暂定如此
				this.audio('time',currentTime);
			}
			var audio = this.audio('getSettings','audio');
			currentTime = currentTime || audio.currentTime;
			var duration = audio.duration;
			//计算时间
			var getTimeStr = function( second ){
				 if (isNaN(second)) {
	                return '00:00';
	            }
	            var add0 = function(num){
	            	return num < 10 ? '0' + num : ''+num;
	            }
	            var min = parseInt(second / 60);
	            var sec = parseInt(second - min * 60);
	            var hours = parseInt(min / 60);
	            var minAdjust = parseInt(second / 60 - 60 * parseInt(second / 60 / 60));
	            return second >= 3600 ? add0(hours) + ':' + add0(minAdjust) + ':' + add0(sec) : add0(min) + ':' + add0(sec);
			}
			var leftStr = getTimeStr(currentTime);
			var rightStr = getTimeStr(duration);
			this.$ele.find('.left-time').html(leftStr);
			this.$ele.find('.right-time').html(rightStr);
		},
		//更新进度条
		updatePercent : function( type , percent){
			var percent = percent || 0;
			percent = percent > 1 ? 1 : (percent < 0 ? 0 : percent);
			percent = (percent * 100).toFixed(2);
			console.log(percent);
			this.$ele.find('.byy-player-progress-left').css('width',percent+'%');
		},
		//加载事件渲染
		initEvents : function(){
			var thiz = this;
			thiz.$ele.on('click','[audio-filter]',function(ev){
				var type = $(this).attr('audio-filter');
				thiz.audio(type,ev);
			});
			//进度条
			var startInter = function(){
				thiz.playtime = setInterval(function(){
					var audio = thiz.audio('getSettings','audio');
					var percent = audio.currentTime / audio.duration;
					thiz.audio('updatePercent','progress',percent);
					thiz.audio('updateTime')
				},100);
			};
			startInter();
			

			//bar move event
			var dotMove = function( event ){
				console.log('mousemove');
				event = event || window.event;
	            var percentage = (event.clientX - $('.byy-player-progress').offset().left) / $('.byy-player-progress').width();
	            percentage = percentage > 0 ? percentage : 0;
	            percentage = percentage < 1 ? percentage : 1;
	            thiz.audio('updatePercent','progress',percentage);//updateBar('played', percentage, 'width');
	            if (thiz.audio('getSettings','showlrc')) {
	                // this.updateLrc(parseFloat(bar.playedBar.style.width) / 100 * this.audio.duration);
	            }
	            //更新时间
	            thiz.audio('updateTime',percentage * thiz.audio('getSettings','audio').duration);
			};
			//bar mouse up event
			var dotUp = function(){
				console.log('mouseup');
				$(document).off('mousemove',dotMove);
				$(document).off('mouseup',dotUp);
				//重新启用循环
				startInter();
			};
			//进度条拖动
			thiz.$ele.on('mousedown','.byy-player-progress-dot',function(ev){
				clearInterval(thiz.playtime);
				$(document).off('mousemove',dotMove).on('mousemove',dotMove);
				$(document).off('mouseup',dotUp).on('mouseup',dotUp);
				// thiz.$ele.off('mousemove','.byy-player-progress-dot').on('mousemove','.byy-player-progress-dot',dotMove);
				// thiz.$ele.off('mouseup','.byy-player-progress-dot').on('mouseup','.byy-player-progress-dot',dotUp);
			});
		},
		//根据music 获得对应的template 模版。
		getTemplate : function( music ){
			console.log(music);
			var template = `
			<div class="byy-player">
				<div class="byy-player-post">
					<i class="byyicon icon-play" audio-filter="play"></i>
				</div>
				<div class="byy-player-info">
					<div class="byy-player-title">
						<span class="title">${music.title}</span>
						<span class="author">${music.author}</span>
					</div>
					<div class="byy-player-lrc">

					</div>
					<div class="byy-player-control">
						<div class="byy-player-progress">
							<div class="byy-player-progress-bar"></div>
							<div class="byy-player-progress-left">
								<span class="byy-player-progress-dot"></span>
							</div>
						</div>
						<div class="byy-player-right">
							<div class="byy-player-time">
								<span class="left-time"></span>
								/
								<span class="right-time"></span>
							</div>

						</div>
					</div>
				</div>
				<div class="byy-player-list">
					
				</div>
			</div>
			`;
			return template;
		},
		//设置参数
		setSettings : function( settings ){
			if(typeof settings === 'string'){//设置某个参数，直接覆盖
				var opts = this.audio('getSettings');
				var param = Array.prototype.slice.call(arguments,1);
				opts[settings] = param[0];
				this.audio('msg','setSettings','设置参数'+settings+'成功');
				this.$ele.data('settings',opts);
			}else{
				this.$ele.data('settings',settings);
				this.audio('msg','setSettings','设置参数到DOM')
			}
			return this;
		},
		//获得参数信息
		getSettings : function( name ){
			var opts = this.$ele.data('settings');
			if(opts){
				return name ? opts[name] : opts;
			}
			return defaults;
		},
		//根据url获得歌曲相关的信息（仅限只有url）
		getMusicByUrl : function( url ){
			var name = url.substring(url.lastIndexOf('/')+1);
			this.audio('msg','getMusicByUrl','获得名称'+name);
			return {
				author : '',
				title : name,
				url : url,
				lrc : '',
				post : ''
			};
		}
	};
	byy.fn.extend(byy.fn,{
		audio : function( method ){
			if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || method) {
                return methods.init.apply(this, arguments);
            } else {
            	byy.error('Method with name ' + method + ' does not exists for audio');
            }
		}
	});

	exports('audio',{
		version : '1.0',
		tip : '仅支持HTML5浏览器'
	});

});