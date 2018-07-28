

module.exports = function(agent){
	agent = agent.toLowerCase();
	var getVersion = function(label){
		var exp = new RegExp(label + '/([^\\s\\_\\-]+)');
		label = (agent.match(exp)||[])[1];
		return label || false;
	};

	var result = {
		os: function(){ //底层操作系统
			var bIsIpad = agent.match(/ipad/i) == "ipad";
		    var bIsIphoneOs = agent.match(/iphone os/i) == "iphone os";
		    var bIsMidp = agent.match(/midp/i) == "midp";
		    var bIsUc7 = agent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
		    var bIsUc = agent.match(/ucweb/i) == "ucweb";
		    var bIsAndroid = agent.match(/android/i) == "android";
		    var bIsCE = agent.match(/windows ce/i) == "windows ce";
		    var bIsWM = agent.match(/windows mobile/i) == "windows mobile";
		    var bIsLinux = agent.match(/linux/i) == 'linux';
		    if(bIsIpad || bIsIphoneOs){
		    	return 'ios';
		    }else if(bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM){
		    	return 'android';
		    }else if(bIsLinux){
		    	return 'linux';
		    }else{
		    	return 'windows';
		    }
		}()
		,ff : function(){
			return agent.indexOf('firefox') > -1;
		}()
		,safari : function(){
			return agent.indexOf('safari') > -1 && agent.indexOf('chrome') == -1;
		}()
		,chrome : function(){
			return agent.indexOf('chrome') > -1 && agent.indexOf('safari') > -1 && agent.indexOf('edge') < 0;
		}()
		,opera : function(){
			return agent.indexOf('opera') > -1;
		}()
		,weixin: getVersion('micromessenger')  //是否微信
	}
	//移动设备
	result.android = result.os === 'android';///android/.test(agent);
	result.ios = result.os === 'ios';
	return result;
}