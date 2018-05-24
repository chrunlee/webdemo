var Speed = function(){
	//1.存储本地数据到data
	//2.用户判定
	//3.历史数据
	//4.渲染
	this.letter = {};//store
	this.diff = 10;
	this.$time = $('.time-show');
	this.start = false;//未开始
	this.init();
}
/***
 * user = {
 *	name : '', 
 *  best : '',
 *  list : [{score : '',time : ''}]
 *}
 **/

Speed.prototype.renderLetter = function(){
	var letters = 'abcdefghijklmnopqrstuvwxyz';//start 65 ,ends 90
	var $ele = $('.letter');
	letters.split('').forEach(function( item,index ){
		$ele.append('<span code="'+(index+65)+'" counts="0">'+item.toUpperCase()+'</span>');
	});
}
Speed.prototype.starttime = function(){
	var that = this;
	that.start = true;
	that.stamp = +new Date();
	that.counter();
	$('.start-btn').remove();
}
Speed.prototype.put = function(){
	var that =this;
	var userName = val('name');//user 信息
	var diff = that.end - that.stamp;
	$.ajax({
		url : '/speed/score',
		type : 'POST',
		data : {user : userName,time : diff},
		success : function(res){
			var resobj = byy.json(res);
			if(resobj.success){
				var msg = resobj.msg +'<a href="/demos/speed/rank.html">查看排行榜</a>';
				$('.rank').html(msg);
			}else{
				byy.win.msg(res.obj.msg);
				$('.rank').html('<a href="/demos/speed/rank.html">查看排行榜</a>');
			}
		},
		error : function(){
			$('.rank').html('<a href="/demos/speed/rank.html">查看排行榜</a>');
		}
	});
}
Speed.prototype.liscode = function(){
	var that = this;
	$(window).on('keydown',function(ev){
		var code = ev.keyCode;
		if(code >= 65 && code <= 90){
			//right code
			that.clickLetter(code);
		}
		if(code === 32 && !that.start){//start
			that.starttime();
		}
	})
	$('.start-btn').on('click',function(){
		that.starttime();
	});
	$('.letter').on('click','span',function(){
		var code = $(this).attr('code');
		that.clickLetter(code);
	})
}
Speed.prototype.checkFull = function(){
	console.log(this.letter);
	return byy.getObjectLength(this.letter) === 26;
}
Speed.prototype.clickLetter = function( code ){
	var that = this;
	if(!that.start)return;
	that.letter[code] = code;
	var $span = $('[code="'+code+'"]'),count = $span.attr('counts');
	count ++ ;
	if(count == 1){
		$span.addClass('suc');
	}else{
		$span.addClass('more').removeClass('suc');
	}
	$span.attr('counts',count);
	if(that.checkFull()){
		//over
		that.end = +new Date();
		that.delcounter();
		that.put();
	}
}
Speed.prototype.init = function(){
	this.renderLetter();
	this.liscode();
}
Speed.prototype.counter = function(){
	//记录毫秒
	//每隔10毫秒自己更新一次
	var that = this;
	var start = that.stamp,$time = that.$time;
	that.timer = setInterval(function(){
		var now = +new Date();
		var diff = now - start;
		var ms = diff % 1000;//毫秒
		ms = ms < 10 ? '00'+ms : (ms < 100 ?'0'+ms : ms);
		var sec = Math.floor(diff / 1000);
		var min = '';
		if(sec > 59){//1分钟以上
			min = Math.floor(sec / 60)+':';
			sec = sec  % 60;
		}
		$time.html(''+min+''+sec+'.'+ms);
	},that.diff);
}
Speed.prototype.delcounter = function(){
	window.clearInterval(this.timer);
}