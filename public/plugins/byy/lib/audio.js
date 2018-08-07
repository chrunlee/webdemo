/**
 *
 * @author chrunlee
 * @license MIT
 * @github https://github.com/chrunlee/byy/blob/master/public/byy/src/lib/audio.js
 * @description MP3 AUDIO PLAYER under html5 
 * 
 **/

byy.define('jquery',function( exports ){

	/*****
	 * byy(selector).audio({
	 *     skin : '',						//类型:长条、原型、笑点
	 *     music : [
	 *          {
	 *				author : '作者信息',	// 作者信息,可选
	 *				title : '标题',			// 标题信息，可选(不填写，则根据url最后的名字来确定)
	 * 				url : 'http://xxx',		// mp3的url地址，必填
	 *				post : 'http://xxx',	// mp3的专辑封面，不填写，则默认图片
	 *				lrc : ''				// 歌词:可以是链接，可以是选择器，可以是字符串；歌词格式:[mm:ss.xx]lyric
	 * 			}
	 *     ],
	 *	   autoplay : true,					// 自动播放，默认true
	 *     showlrc : false,					// 是否显示歌词，默认false
	 *     debug : false,					// 开启debug模式，输出debug信息
	 *	   mode : 0,						// 音乐切换模式:0/1/2/3,分别为 顺序、单曲循环、列表循环、随机播放；
	 *     volume : 1,						// 默认音量，默认1，从[0-1]中取值
	 *     theme : '#ccc',					// 风格颜色，默认为空，增加后显示对应的颜色样式
	 *     onPlay : function(){}			// 播放事件
	 *     onCanplay : function(){}			// MP3能够播放的事件，触发后，开始播放
	 *     onPause : function(){}			// 暂停事件
	 *     onChange : function(){}			// 音乐切换事件
	 *     onDestroy : function(){}    		// 销毁实例事件
	 *     
	 * });
	 * // support the following functions
	 * byy(selector).audio( method ); // called like this
	 * 
	 *
	 ****/
	//store instance in page
	var AudioCache = {
		audios : [],//audio selector
		playtime : {}//timer
	};

	//default properties 
	var _defaults = {
		skin : 0,//0 长条，1 长条但是只有封面，2圆形，3小点
		music : [],//音乐列表
		autoplay : true,//是否默认播放，默认自动播放
		showlrc : false,//显示歌词，默认不显示
		volume : 1,//默认全部音量
		debug : false,//开启debug
		mode : 0,//0 顺序播放，1 单曲循环，2列表循环播放，3随机播放
		onPlay : $.noop,//播放事件
		onPause : $.noop,//暂停事件
		onChange : $.noop,//歌曲切换
		onDestroy : $.noop//实例销毁事件
	};

	//dom templates
	var templates = {
		play : '<i class="byyicon icon-play start-icon" audio-filter="play" {0}></i>',
		pause : '<i class="byyicon icon-pause start-icon" audio-filter="pause" {0}></i>',
		volume : '<i class="byyicon icon-volume" audio-filter="clickMuted"></i>',
		muted : '<i class="byyicon icon-volume-off" audio-filter="clickMuted"></i>',
		type : [
			'<i class="byyicon icon-play-keep" title="顺序播放"></i>',				//顺序播放
			'<i class="byyicon icon-play-single" title="单曲循环"></i>',			//单曲循环
			'<i class="byyicon icon-play-loop" title="列表循环"></i>',				//列表循环
			'<i class="byyicon icon-play-random" title="随机播放"></i>'				//随机播放
		]
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
			this.audio('setSettings',_defaults);
			this.audio('msg','init','初始化容器');
			var opts = byy.extend({},_defaults);
			if(typeof settings == 'string'){//如果是string,默认是一个mp3 url
				this.audio('msg','init','settings 为 url');
				opts.music = [this.audio('getMusicByUrl',settings)];
			}else{
				this.audio('msg','init','覆盖默认设置');
				opts = byy.extend(opts,settings);
			}
			//设置一个ID
			opts.id = byy.guid('audio');
			this.audio('setSettings',opts);
			this.audio('msg','init','输出当前的配置：'+ byy.stringfy(opts));
			AudioCache.audios.push(this.$ele);
			this.audio('render').audio('initEvents');
			return this;
		},
		//根据当前的设置渲染内容
		render : function( index ){
			this.audio('msg','render','渲染DOM');
			var opts = this.audio('getSettings');
			index = index || 0;
			var music = opts.music[index],
				url = music.url;
			//set played index
			if(typeof opts['onBefore'] === 'function'){
				opts['onBefore'].call(this);
			}
			this.audio('setSettings','playindex',index||0);
			this.$ele.html(this.audio('getTemplate',music,opts));

			this.audio('setAudioByMusic',music);
			
			if(opts.autoplay){
				this.audio('play');
			}else{
				this.audio('pause');
			}

			return this;
		},
		//向列表中添加音乐
		addMusic : function( music ){
			var music = typeof music == 'stirng' ? this.audio('getMusicByUrl',music) : music;
			if(typeof music == 'object'){
				var musics = this.audio('getSettings','music');
				musics.push(music);
				this.audio('setSettings','music',musics);
				this.audio('msg','addMusic','添加音乐成功');
			}else{
				this.audio('msg','addMusic','添加的music参数不是对象或者url');
			}
			return this;
		},

		 /**
         * Parse lrc, suppose multiple time tag
         * copyed from aplayer
         * @param {String} lrc_s - Format:
         * [mm:ss.xx]lyric
         * [mm:ss.xxx]lyric
         * [mm:ss.xx][mm:ss.xx][mm:ss.xx]lyric
         *
         * @return {String} [[time, text], [time, text], [time, text], ...]
         */
        parseLrc : function(lrc_s){
        	var lyric = lrc_s.split('\n');
            var lrc = [];
            var lyricLen = lyric.length;
            for (var i = 0; i < lyricLen; i++) {
                // match lrc time
                var lrcTimes = lyric[i].match(/\[(\d{2}):(\d{2})\.(\d{2,3})]/g);
                // match lrc text
                var lrcText = lyric[i].replace(/\[(\d{2}):(\d{2})\.(\d{2,3})]/g, '').replace(/^\s+|\s+$/g, '');

                if (lrcTimes) {
                    // handle multiple time tag
                    var timeLen = lrcTimes.length;
                    for (var j = 0; j < timeLen; j++) {
                        var oneTime = /\[(\d{2}):(\d{2})\.(\d{2,3})]/.exec(lrcTimes[j]);
                        var lrcTime = oneTime[1] * 60 + parseInt(oneTime[2]) + parseInt(oneTime[3]) / ((oneTime[3] + '').length === 2 ? 100 : 1000);
                        lrc.push([lrcTime, lrcText]);
                    }
                }
            }
            // sort by time
            lrc.sort(function(a,b){
            	return a[0] - b[0];
            });
            return lrc;
        },
        //加载歌词
        getLrc : function( str ){
        	var thiz = this,lrc = [],html = '';
        	if(str.startWith('http')){
        		var lrcs = '';
        		$.ajax({
        			url : str,
        			type : 'GET',
        			// async : false,
        			success : function( res ){
        				lrcs = res;
        				lrc = thiz.audio('parseLrc',lrcs);
        				if(lrc.length > 0){
			        		thiz.audio('setSettings','lrc',lrc);
			        		thiz.audio('setSettings','lrcindex',0);
			        		lrc.forEach(function( item,i ){
			        			html += '<p time="'+item[0]+'" index="'+i+'">'+item[1]+'</p>';
			        		});
			        		//设置html
			        		thiz.$ele.find('.byy-player-lrc').html(html);
			        	}
        			},
        			error : function(req,err){}
        		});
        		lrc = thiz.audio('parseLrc',lrcs);
        	}else{
        		var lrcstr = str;
        		try{
        			if($(str).length > 0){
        				lrcstr = $(str).html();
        			}
        		}catch(e){}
        		lrc = thiz.audio('parseLrc',lrcstr);
        	}
        	//对lrc进行处理生成html
        	if(lrc.length > 0){
        		thiz.audio('setSettings','lrc',lrc);
        		thiz.audio('setSettings','lrcindex',0);
        		lrc.forEach(function( item,i ){
        			html += '<p time="'+item[0]+'" index="'+i+'">'+item[1]+'</p>';
        		});
        	}
        	return html;
        },
        updateLrc : function( currentTime ){
        	var thiz = this;
        	var audio = thiz.audio('getSettings','audio');
        	var lrc = thiz.audio('getSettings','lrc'),
        		lrcindex = thiz.audio('getSettings','lrcindex');
        	currentTime = currentTime || audio.currentTime;
        	if(!lrc || lrc.length ==0 || (!lrcindex && lrcindex != 0) ){
				return;
        	}
        	if (lrcindex > lrc.length - 1 || currentTime < lrc[lrcindex][0] || (!lrc[lrcindex + 1] || currentTime >= lrc[lrcindex + 1][0])) {
                for (var i = 0; i < lrc.length; i++) {
                    if (currentTime >= lrc[i][0] && (!lrc[i + 1] || currentTime < lrc[i + 1][0])) {
                    	thiz.audio('setSettings','lrcindex',i);
                    	//移除其他showlrc
                    	thiz.$ele.find('p.showlrc').removeClass('showlrc');
                    	thiz.$ele.find('.byy-player-lrc p').eq(i).addClass('showlrc');
                    	if(thiz.$ele.find('.byy-player-lrc p').eq(i+1).length > 0){
                    		thiz.$ele.find('.byy-player-lrc p').eq(i+1).addClass('showlrc');
                    	}
                    }
                }
            }
        },
		//播放歌曲
		play : function(){
			var audio = this.audio('getSettings','audio');
			if(audio.paused){
				audio.play();
				this.audio('msg','play','开始播放');
				var backStyle = '';
				if(this.audio('getSettings','theme')){
					backStyle = ' style="background-color:'+this.audio('getSettings','theme')+'"';
				}
				this.$ele.find('.byy-player-post').html(byy.formatStr(templates['pause'],backStyle));
				//暂停其他实例的播放动作
				//并启动进度条更新
				this.audio('startInterval');
			}
		},
		//设置某个时间点进行播放
		time : function( time ){
			var audio = this.audio('getSettings','audio');
			audio.currentTime =time;
			this.audio('msg','time','设置当前时间'+time+'开始播放')
			return this;
		},
		//展开列表或收起
		toggleList : function(){
			var thiz = this;
			var $list = thiz.$ele.find('.byy-player-list');
			$list.toggleClass('show');
		},
		//根据index更新list ui
		updateList : function( nextIndex ){
			var thiz = this;
			var $list = thiz.$ele.find('.byy-player-list');
			$list.find('.selected').removeClass('selected');
			$list.find('.byy-player-list-block').eq(nextIndex).addClass('selected');
		},
		//点击切换歌曲
		clickList : function(ev){
			var thiz = this;
			ev = ev || window.event;
			var target = ev.target || ev.srcElement;
			var $block = $(target);
			if($block.length > 0){
				$block.parent().find('.selected').removeClass('selected');
				$block.addClass('selected');
				var nextIndex = $block.attr('index');
				thiz.audio('next',nextIndex);
			}
		},
		//切换
		toggle : function( flag ){
			this.audio('msg','toggle','切换播放状态');
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
			var backStyle = '';
			if(this.audio('getSettings','theme')){
				backStyle = ' style="background-color:'+this.audio('getSettings','theme')+'"';
			}
			this.$ele.find('.byy-player-post').html(byy.formatStr(templates['play'],backStyle));
			if(!audio.paused){
				audio.pause();
				this.audio('msg','pause','暂停播放');
				this.audio('getSettings','onPause').apply(this);
				//并停止进度条更新
				this.audio('stopInterval');
			}
		},
		//下一首
		next : function( nextIndex ){
			var thiz = this;
			thiz.audio('msg','next','切换到下一首进行播放');
			var opts = thiz.audio('getSettings');
			var audio = opts.audio;
			var mode = opts.mode,musics = opts.music,playindex = opts.playindex;
			if(!nextIndex){//不存在，自然下一首
				switch (mode){
					case 0 : 
						//顺序
						nextIndex = playindex >= musics.length-1 ? -1 : playindex + 1;
						break;
					case 1 : 
						//单曲循环
						nextIndex = playindex;
						break;
					case 2 : 
						//列表
						nextIndex = playindex >= musics.length-1 ? 0 : playindex+1;
						break;
					case 3 :
						//随机
						nextIndex = musics.length == 1 ? 0 : Math.round((Math.random()*(musics.length-1)));
						break;
				}
			}else{
				//指定下一首
				if(!audio.ended){
					console.log('-------------preload下切歌');
					// audio.ended = true;
					// audio.pause();//暂停
					// audio= null;
					thiz.audio('setSettings','audio',null);
				}
			}
			
			if(nextIndex > -1){
				//触发下一首歌曲
				thiz.$ele.trigger('next',[musics[nextIndex],nextIndex]);
				thiz.audio('render',nextIndex);
				//重新启动
				thiz.audio('startInterval');

			}else{
				//暂停
				var audio = thiz.audio('getSettings','audio');
				this.$ele.find('.byy-player-post').html(templates['play']);
				this.audio('getSettings','onPause').apply(this);
			}
		},
		//点击进度条，变更播放事件
		clickPercent : function(event){
			event = event || window.event;
			var thiz = this;
			var $bar = thiz.$ele.find('.byy-player-progress-bar');
			var audio = thiz.audio('getSettings','audio');
			var percentage = (event.clientX - $bar.offset().left) / $bar.width();
			if(isNaN(audio.duration)){
				percentage = 0;
			}
            percentage = Math.max(percentage , 0);
            percentage = Math.min(percentage , 1);
            thiz.audio('updatePercent','progress',percentage);//
            thiz.audio('msg','clickPercent','更新进度条');
            //更新时间
			thiz.audio('updateTime',percentage * thiz.audio('getSettings','audio').duration);
		},
		//静音或取消静音
		clickMuted : function(){
			this.audio('msg','clickMuted','点击音量图标');
			var $this = this,audio = $this.audio('getSettings','audio');
			$this.audio('setMuted',!audio.muted)
		},
		//设置静音或取消
		setMuted : function( flag ){
			this.audio('msg','setMuted','设置静音'+flag);
			var $this = this,audio = $this.audio('getSettings','audio');
			audio.muted = flag;
			$this.$ele.find('[audio-filter="clickMuted"]').removeClass(audio.muted ? 'icon-volume' : 'icon-volume-off').addClass(audio.muted ? 'icon-volume-off' : 'icon-volume');	
		},
		//根据music信息获得audio对象
		setAudioByMusic : function( music ){
			var thiz = this;
			thiz.audio('msg','setAudioByMusic','根据music设置audio信息');
			var audio = thiz.audio('getSettings','audio');
			var autoplay = thiz.audio('getSettings','autoplay');
			var preload = thiz.audio('getSettings','preload');
			var volume = thiz.audio('getSettings','volume');

			audio = audio || document.createElement('audio');
			try{
				audio.src = music.url;
			}catch(e){
				console.log(e);
			}
			audio.controls = false;
			audio.autoplay = false;
			audio.volume = volume > 1 ? 1 : (volume < 0 ? 0 : volume);
			if(audio.volume == 0){
				audio.muted = true;//设置静音
			}
			audio.preload = preload || 'auto';

			//开始播放
			audio.onplay = function(){
				thiz.$ele.trigger('play');
			}
			//下载进度
			audio.onprogress = function(){				
				thiz.$ele.trigger('progress');//进度条
			}
			//设置audio事件
			audio.oncanplay = function(){
				thiz.$ele.trigger('canplay');
			}
			//audio 播放结束
			audio.onended = function(){
				thiz.$ele.trigger('onEnded');
			}
			//audio 获得时长
			audio.ondurationchange = function(){
				thiz.$ele.trigger('durationchange');//
			}
			//error
			audio.onerror = function(e){
				console.log(e);
			}
			thiz.audio('setSettings','audio',audio);

			return this;
		},
		//更新时间
		updateTime : function( currentTime ){
			if(currentTime){
				//由于在移动的时候太频繁，导致音频声音有点乱,暂定如此
				this.audio('msg','updateTime','更新时间'+currentTime);
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
			//更新歌词
			var showlrc = this.audio('getSettings','showlrc');
			if(showlrc){
				this.audio('updateLrc',currentTime);
			}
		},
		//更新缓存
		updateProgress : function( percentage ){
			this.audio('msg','updateProgress','当前缓存进度'+percentage);
			percentage = percentage || 0;
			percentage = Math.max(percentage,0);
			percentage = Math.min(percentage,1);
			this.$ele.find('.byy-player-progress-down').css('width',(percentage*100)+'%');
		},
		//更新进度条
		updatePercent : function( type , percent){
			var percent = percent || 0;
			percent = percent > 1 ? 1 : (percent < 0 ? 0 : percent);
			percent = (percent * 100).toFixed(2);
			this.$ele.find('.byy-player-progress-left').css('width',percent+'%');
		},
		//开始监控监督条
		startInterval : function(){
			this.audio('msg','startInterval','开启进度条更新');
			var thiz = this;
			var opts = thiz.audio('getSettings');
			var id = opts.id;
			if(AudioCache.playtime[id]){
				clearInterval(AudioCache.playtime[id]);
			}
			AudioCache.playtime[id] = setInterval(function(){
				var audio = thiz.audio('getSettings','audio');
				var percent = audio.currentTime / audio.duration;
				thiz.audio('updatePercent','progress',percent);
				thiz.audio('updateTime');
				thiz.$ele.trigger('playing');
			},300);
		},
		//停止进度条监控
		stopInterval : function(){
			var thiz = this;
			thiz.audio('msg','stopInterval','取消进度条更新');
			var opts = thiz.audio('getSettings');
			var id = opts.id;
			clearInterval(AudioCache.playtime[id]);
		},
		//加载事件渲染
		initEvents : function(){
			var thiz = this;
			thiz.audio('msg','initEvents','初始化事件');
			thiz.$ele.on('click','[audio-filter]',function(ev){
				var type = $(this).attr('audio-filter');
				thiz.audio('msg','audio-filter','点击触发：'+type);
				if(type && methods[type]){
					thiz.audio(type,ev);
				}
			});
			
			//切歌事件
			thiz.$ele.on('next',function(ev, music,nextIndex){
				thiz.audio('msg','onChange','切换下一首歌曲'+music.title);
				//更新list
				var opts = thiz.audio('getSettings');
				if(typeof opts['onChange'] === 'function'){
					opts['onChange'].call(thiz,music);
				}
			});
			//下载进度条
			thiz.$ele.on('progress',function(){
				thiz.audio('msg','progress','加载音频缓存');
				var thisAudio = thiz.audio('getSettings','audio');
				var percentage = thisAudio.buffered.length ? thisAudio.buffered.end(thisAudio.buffered.length - 1) / thisAudio.duration : 0;
				thiz.audio('updateProgress',percentage);
			});
			//监听开始播放
			thiz.$ele.on('play',function(){
				thiz.audio('msg','event:play','开始播放');
				var opts = thiz.audio('getSettings');
				if(typeof opts['onPlay'] === 'function'){
					opts['onPlay'].call(thiz);
				}
			});
			//播放进行中
			thiz.$ele.on('playing',function(){
				var opts = thiz.audio('getSettings');
				if(typeof opts['onPlaying'] === 'function'){
					opts['onPlaying'].call(thiz);
				}
			});
			//音频时长变更
			thiz.$ele.on('durationchange',function(){
				var thisAudio = thiz.audio('getSettings','audio');
				thiz.audio('msg','durationchange','当前音频时长变化'+thisAudio.duration);
				if (thisAudio.duration !== 1) {//android 浏览器
                    thiz.audio('updateTime',0);
                }
			});

			//更新音量
			thiz.$ele.on('updateVolume',function( ev,volume ){
				thiz.audio('msg','updateVolume','更新音量'+volume);
				var opts = thiz.audio('getSettings');
				if(typeof opts['onVolume'] === 'function'){
					opts['onVolume'].call(thiz,volume);
				}
			});

			//音频可以播放事件
			thiz.$ele.on('canplay',function(){
				//启动进度条
				thiz.audio('startInterval');
				var opts = thiz.audio('getSettings');
				thiz.audio('msg','canplay','当前音频已就绪，可以播放');
				if(typeof opts['onCanplay'] === 'function'){
					opts['onCanplay'].call(thiz);
				}
			});
			//播放结束
			thiz.$ele.on('onEnded',function( ev ){
				thiz.audio('msg','onEnded','播放结束');
				var opts = thiz.audio('getSettings');
				//播放结束，触发播放结束事件，并进行切歌，如果当前只有一首，则停止
				if(typeof opts['onEnded'] === 'function'){
					opts['onEnded'].call(thiz);
				}
				//停止进度条监控
				thiz.audio('stopInterval');
				//播放下一曲
				thiz.audio('next');
			});

			//bar move event
			var dotMove = function( event ){
				event = event || window.event;
	            var percentage = (event.clientX - thiz.$ele.find('.byy-player-progress').offset().left) / thiz.$ele.find('.byy-player-progress').width();
	            percentage = percentage > 0 ? percentage : 0;
	            percentage = percentage < 1 ? percentage : 1;
	            thiz.audio('updatePercent','progress',percentage);//
	            if (thiz.audio('getSettings','showlrc')) {
	                // this.updateLrc(parseFloat(bar.playedBar.style.width) / 100 * this.audio.duration);
	            }
	            thiz.audio('setSettings','movetime',percentage * thiz.audio('getSettings','audio').duration)
			};
			//bar mouse up event
			var dotUp = function(){
				$(document).off('mousemove',dotMove);
				$(document).off('mouseup',dotUp);
				//更新时间
				thiz.audio('updateTime',thiz.audio('getSettings','movetime'));
				//重新启用循环
				thiz.audio('startInterval');
			};
			//进度条拖动
			thiz.$ele.on('mousedown','.byy-player-progress-dot',function(ev){
				thiz.audio('stopInterval');
				$(document).off('mousemove',dotMove).on('mousemove',dotMove);
				$(document).off('mouseup',dotUp).on('mouseup',dotUp);
			});
		},
		//根据music 获得对应的template 模版。
		getTemplate : function( music, opts ){
			this.audio('msg','getTemplate','获得DOM模版内容');
			var post = music.post ? 'style="background-image:url('+music.post+')"' : '';
			var lrc = '<div class="byy-player-lrc">';
			if(opts.showlrc && music.lrc){
				//判断music里面的歌词是string 还是 url 或者是dom?
				var lrchtml = this.audio('getLrc',music.lrc);
				lrc += lrchtml;
			}
			lrc += '</div>';
			var borderStyle = '',
				colorStyle = '',
				backStyle = '',
				backStyle2 = '';
			if(opts.theme){
				borderStyle = ' style="border-color:'+opts.theme+'" ';
				colorStyle = ' style="color:'+opts.theme+'"';
				backStyle = ' style="background-color:'+opts.theme+'"';
				backStyle2 = 'background-color:'+opts.theme+';';
			}

			//列表信息
			var listhtml = '';
			var playindex = this.audio('getSettings','playindex');
			if(opts.music.length > 1){//多余1个，展示列表
				opts.music.forEach(function( item ,i ){
					var title = item.title;
					listhtml += '<div class="byy-player-list-block '+( i === parseInt(playindex,10) ? 'selected' : '')+'" index="'+i+'" audio-filter="clickList">'+title+'</div>';
				});
			}

			/**
			var template = `
			<div class="byy-player" ${borderStyle}>
				<div class="byy-player-post" ${post}>
					<i class="byyicon icon-play" audio-filter="play" ${backStyle}></i>
				</div>
				<div class="byy-player-info">
					<div class="byy-player-title">
						<span class="title">${music.title}</span>
						<span class="author">${music.author}</span>
					</div>
					${lrc}
					<div class="byy-player-control">
						<div class="byy-player-progress" audio-filter="clickPercent">
							<div class="byy-player-progress-bar">
								<div class="byy-player-progress-down"></div>
							</div>
							<div class="byy-player-progress-left" ${backStyle}>
								<span class="byy-player-progress-dot" ${borderStyle}></span>
							</div>
						</div>
						<div class="byy-player-right">
							<div class="byy-player-time">
								<span class="left-time"></span>
								/
								<span class="right-time"></span>
							</div>
							<div class="byy-player-volume">
								${opts.volume <=0 ? byy.formatStr(templates.muted,'') : byy.formatStr(templates.volume,'')}
								<div class="byy-player-volume-select" audio-filter="clickVolume" ${borderStyle}>
									<div class="byy-player-volume-now" style="height:${opts.volume*100 > 100 ? 100 : (opts.volume*100 < 0 ? 0 : opts.volume*100)}%;${backStyle2}"></div>
								</div>
							</div>
							<div class="byy-player-type" audio-filter="changeMode">
								${byy.formatStr(templates.type[opts.mode],'')}
							</div>
							<div class="byy-player-list-icon" audio-filter="toggleList"><i class="byyicon icon-list"></i></div>
						</div>
					</div>
				</div>
				<div class="byy-player-list">
					${listhtml}
				</div>
			</div>
			`;
			**/
			var template = '<div class="byy-player" '+borderStyle+'><div class="byy-player-post" '+post+'><i class="byyicon icon-play" audio-filter="play" '+backStyle+'></i></div><div class="byy-player-info"><div class="byy-player-title"><span class="title">'+music.title+'</span><span class="author">'+music.author+'</span></div>'+lrc+'<div class="byy-player-control"><div class="byy-player-progress" audio-filter="clickPercent"><div class="byy-player-progress-bar"><div class="byy-player-progress-down"></div></div><div class="byy-player-progress-left" '+backStyle+'><span class="byy-player-progress-dot" '+borderStyle+'></span></div></div><div class="byy-player-right"><div class="byy-player-time"><span class="left-time"></span>/<span class="right-time"></span></div><div class="byy-player-volume">'+(opts.volume <=0 ? byy.formatStr(templates.muted,'') : byy.formatStr(templates.volume,''))+'<div class="byy-player-volume-select" audio-filter="clickVolume" '+borderStyle+'><div class="byy-player-volume-now" style="height:'+(opts.volume*100 > 100 ? 100 : (opts.volume*100 < 0 ? 0 : opts.volume*100))+'%;'+backStyle2+'"></div></div></div><div class="byy-player-type" audio-filter="changeMode">'+byy.formatStr(templates.type[opts.mode],'')+'</div><div class="byy-player-list-icon" audio-filter="toggleList"><i class="byyicon icon-list"></i></div></div></div></div><div class="byy-player-list">'+listhtml+'</div></div>';
			return template;
		},
		//dom 更新音量
		clickVolume : function(ev){
			var $this = this;
			$this.audio('msg','clickVolume','点击音量区域');
			var $select = $this.$ele.find('.byy-player-volume-select');
			var vb = $select.offset().top,
				vh = $select.height(),
				nowc = ev.clientY;
			var volume = (Math.abs(nowc - (vb + vh)) / vh).toFixed(1) ;
			volume = volume > 1 ? 1 : ( volume < 0.1 ? 0 : volume);
			//更新ui
			var height = (volume * 100)+'%';
			$select.find('.byy-player-volume-now').css('height',height);
			$this.audio('updateVolume',volume);
		},
		updateVolume : function( volume ){
			var $this = this;
			$this.audio('msg','updateVolume','更新音量信息'+volume);
			volume = volume > 1 ? 1 : (volume < 0 ? 0 : volume);
			var audio = this.audio('getSettings','audio');
			audio.volume = volume;
			$this.audio('setMuted',volume === 0 ? true : false);
			$this.$ele.trigger('updateVolume',[volume]);
		},
		//改变播放模式
		changeMode : function(){
			var $this = this;
			var mode = $this.audio('getSettings','mode');
			//从上线下，+1，循环
			var next = parseInt(mode,10)+1;
			next = next > 3 ? 0 : next;
			$this.audio('msg','changeMode','变更播放模式'+next);
			$this.audio('setSettings','mode',next);
			//改变UI
			var colorStyle = '';
			if($this.audio('getSettings','theme')){
				colorStyle = ' style="color:'+$this.audio('getSettings','theme')+'"';
			}
			$this.$ele.find('.byy-player-type').html(byy.formatStr(templates.type[next],colorStyle));
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