byy.define(['jquery'],function( exports ){

	var defaults = {
		speed : 200, //200ms 产生一个图片
		maxSize : 50,
		time : 3000,
		template : '<span style="color:white;position:absolute;">❉</span>'
	};
	
	byy.fn.extend({
		snow : function( opts ){
			opts = byy.extend(defaults,opts);
			var $ele = this.$ele;
			var prettyContainer = function( $container ){
					$container.css({
						'background-color' : 'black',
						'overflow' : 'hidden',
						'position' : 'relative'
					});
			};
			prettyContainer($ele);
			var eleWidth = $ele.width(),eleHeight = $ele.height();
			console.log(eleHeight);
			var start = function(){
				var startLeft = Math.random() * eleWidth;//初始位置
				var endLeft = Math.random()*1 >0.5 ? (0.5+Math.random()*0.5)*startLeft : Math.random() * eleWidth;//结束位置
				var startOpacity = 0.3+Math.random() * 0.7;
				var endOpacity = 0.3 + Math.random() * 0.5;
				var fontSize = 10 + Math.floor(Math.random() * (opts.maxSize - 10));
				$(opts.template).clone().appendTo($ele).css({
					'font-size' : fontSize+'px',
					top : '-'+opts.maxSize+'px',
					left : startLeft,
					opacity : startOpacity
				}).animate({
					left : endLeft,
					top : eleHeight,
					opacity : endOpacity	
				},opts.time,function(){
					$(this).remove();
				});
			}
			setInterval(start,opts.speed);
		}
	});
	exports ('snow',{});
});