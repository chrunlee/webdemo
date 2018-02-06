/****
 * 模拟打字效果
****/
byy.define('jquery',function( exports ){
	var typper = function( selector, timemin ){
		timemin = timemin || 75;
		var $ele = $(selector),str = $ele.html(),progress = 0;
		$ele.html('');
		var typertimer = setInterval(function() {
            var current = str.substr(progress, 1);
            if (current == '<') {
                progress = str.indexOf('>', progress) + 1;
            } else {
                progress++;
            }
            $ele.html(str.substring(0, progress) + (progress & 1 ? '_' : ''));
            if (progress >= str.length) {
            	if($ele.html().endWith('_')){
            		$ele.html($ele.html().substring(0,$ele.html().length -1));
            	}
                clearInterval(typertimer);
            }
        }, timemin);
	};
	byy.fn.extend({
		typper : function(min){
			var $ele = this.$ele;
			typper($ele,min);
		}
	});
	exports('typper',typper);
});