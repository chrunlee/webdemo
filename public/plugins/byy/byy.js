'use strict';
/****
 * @title 博育云前端框架
 * @author lixun
 * @version 1.0.0 版本初建，并修复部分BUG。
 * @version 1.0.1 去掉cookie操作相关的函数，系统安全性上的考虑。
 * @version 1.0.2 增加 byy('form').reset(obj) 重置，obj可为空，同时setValues 增加dom上的formatter过滤（简单过滤）
 * @version 1.0.3 增加fixJson函数，处理$ref 对应后台的json序列问题，可以通过 byy.json(str,flag) 来控制，默认不转化。
 * @version 1.0.4 集成jquery.validator 插件，扩展byy('selector').validate() 和 byy('selector').valid() 函数供正常使用，若不足，后续添加。
 * @version 1.0.5 修复getSearch addUrlParams 函数的中文解析问题 
 * @version 1.0.6 修复多行文本域在表单提交时换行符号的替换以及换回和显示。
 * @version 1.0.7 修复tab控件的逻辑问题（0.添加后应该立刻显示；1.重复点击问题）
 * @version 1.0.8 增加上传组件，具体功能请参考lib/uploader.js 
 * @version 1.0.9 增加国际化组件 i18n ,具体使用请参考 lib/jqueryi18n.js
 * @version 1.1.0 增加数校相关的列表功能，同时优化检索组件的展现
 * @version 1.1.1 增加内置语言包，通过lang="zh" 来引用，默认中文
 * @version 1.1.2 优化复选框、单选框、下拉框的事件调用，在模拟元素中改变后，调用原生DOM绑定的事件
 * @version 1.1.3 修复下拉框的宽度计算问题，增加最小宽度判断
 * @version 1.1.4 修复校验插件的提示位置；增加校验插件的英文国际化；增加table-href 辅助元素；
 * @version 1.1.5 增加radioVal checkboxVal selectVal 函数，类似$(selector).val() ,使用通过:byy(radioselector).radioVal();带参数则为赋值，不带则为取值 
 * @version 1.1.6 增加radio checkbox select selectextend 的国际化处理
 * @version 1.1.7 增加多选下拉框，依赖原生：multiple="true" size="3" 实现，具体请见:/test/moni.html
 * @version 1.1.8 增加列表模版3 -- 检索为标签式检索
 * @version 1.1.9 增加本地模块引入接口，通过byy.setRequire({basePath : xxx,modules : {moduleName: modulePath}}) 引入后，即可通过 byy.require('moduleName') 引入。
 * @version 1.2.0 国际化增加字符串格式化，data-localize="com.boyuyun.test" "第{0}页" data-format="10" --> 第10页
 * @version 1.2.1 修复国际化处理可能导致空字符串的问题，增加国际化的title 展示，data-localize-title ,和函数 byy.renderLocal('.notice-body') 渲染某容器内的国际化元素。
 * @version 1.2.2 修复数校列表内的高级检索的按钮位置和出现时机
 * @version 1.2.3 增加函数节流和防抖 byy.throttle byy.debounce
 * @version 1.2.4 修复部分es5的函数，支持IE8
 * @version 1.2.5 增加jquery.autocomplete插件，用法不变
 * @version 1.2.6 增加moment.js插件，byy.moment().xxx
 * @version 1.2.7 修复slideBox 下在无img标签下，增加 .bgp 样式确定背景图所在容器。
 * @version 1.2.8 修复list() 函数下的block 去除初始不显示的元素进行计算。
 * @version 1.2.9 修复list() 函数下在tag标签不足换行的时候移除更多元素
 * @version 1.3.0 修复1.2.9的问题
 * @version 1.3.1 修复上传的mime类型和列表的search tag的选择域问题
 * @version 1.3.2 增加树菜单的收缩状态和相关处理，并修复tab关闭的BUG
 * @version 1.3.3 修复tab 在notitle的配置下无法创建多个frame的bug
 * @version 1.3.4 增加animate.css的引入,增加左侧菜单有图标的展示
 * @version 1.3.5 移植layui-slider插件为byy.slider,require('slider'),修复win 下的alert的高度问题。
 * @version 1.3.6 增加blockquote样式，修复导航的背景色太重的问题。
 * @version 1.3.7 修复列表底部高度导致滚动条问题；修复收缩状态下子菜单的定位；
 * @version 1.3.8 修复IE下list函数判断更多的情况不准确
 * @version 1.3.9 集成jcrop,修复animate.less 与 byywin.css的样式冲突
 * @version 1.4.0 getValues 在回车符上替换为\n,而不是\r\n,与jquery一致。
 * @version 1.4.1 集成cookie和jquery.treegrid 插件
 * @version 1.4.2 增加select 下拉框的title和data-localize-title 属性，用于提示；
 * @version 1.4.3 增加h5 audio播放器
 * @version 1.4.4 整理组件，重新划分功能区域；集成layui-table功能；
 * @version 1.4.5 修复1.4.4分离功能导致的BUG(1.4.4版本请不要使用)
 * @version 1.4.6 修复几处小问题：onevent/findFrameByName/tab/
 * @version 1.4.7 增加win下photots参数indicator :outside;修复国际化提示语；修复getSearch获取unicode；剥离上传内的图片;
 * @version 1.4.8 修复form 下tab 的点击，在多重tab下的无法精确定位；增加异步加载等待时长为30S;增加tab控件左右滑动按钮；
 * @version 1.4.9 uploader修复在暂停后继续上传的BUG；增加slider的stop/play函数；
 * @version 1.5.0 增加win 上参数，允许tips在同一ele上只有一个；增加progress的配色；修复table的page参数；
 * @version 1.5.1 修复uploader在frame中的高度有问题，以及排版问题；增加win里面的调用min函数的回调；修复IE下下拉框字体稍微模糊问题;修复table本地数据分页问题;增加深层次clone函数 byy.clone
 * @version 1.5.2 修复clone中array的问题
 ***/

(function( global , factory ){

	factory(global);

})(typeof window !== "undefined" ? window : this,function( win , undefined ){
	var 
		version = '1.5.2',
		location = win.location,
		_ready = false,
		doc = win.document, 
		byylang = 'zh',
		isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]',
		slice = Array.prototype.slice,
		byy = function( selector , context ){
			return new byy.fn.init( selector , context );
		},
		error = function( msg ){
			win.console && console.error && console.error('byyjs hint: ' + msg);
		},
		
		getPath = function(){
			var js = doc.scripts, tnode = js[js.length - 1],jsPath = tnode.querySelector ? tnode.src : tnode.getAttribute('src'),language = tnode.getAttribute('lang') || 'zh';
			byylang = language;
  			return jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
		}(),
		modules = {
			page : 'lib/page'//分页
			,pollify : 'lib/pollify'
			,form : 'lib/form'
			,util : 'lib/util'
			,jquery : 'lib/jquery'//
			,win : 'lib/win'
			,webuploader : 'lib/webuploader'
			,validator : 'lib/validator'
			,i18n : 'lib/jqueryi18n'
			,uploader : 'lib/uploader'
			,school : 'lib/school'//对数校的个性化处理
			//语言包
			,lang : 'lang/'+byylang+'/lang'
			,typper : 'lib/typper'
			,template : 'lib/template'
			,autocomplete : 'lib/autocomplete'
			,moment : 'lib/moment'
			,animate : 'lib/animate'
			,slider : 'lib/slider'
			,jcrop : 'lib/jcrop'
			,cookie : 'lib/cookie'
			,treegrid : 'lib/treegrid'
			,audio : 'lib/audio'
			,laytpl : 'lib/laytpl'
			,table : 'lib/table'

		};

	
	byy.fn = byy.prototype = {
		byy : version,
		constructor: byy,
		init : function( selector , context ){
			//如果selector 是jquery对象的话
			if(typeof selector === 'string'){
				this.selector= selector;
				this.$ele = $(selector, context);
				this.length = this.$ele.length;
				this.$ = this.jquery = $;
			}else if( selector.nodeType ){
				this.selector = $(selector).selector;
				this.$ele = $(selector);
				this.length = 1;
			}else if(selector.selector !== undefined){
				this.selector= selector.selector;
				this.$ele = selector;
				this.length = selector.length;
			}
			return this;
		}
	};


	byy.fn.init.prototype = byy.fn;
	//config
	var config = byy.cache = {};
	config.modules = {}; //记录模块物理路径
	config.status = {}; //记录模块加载状态
	config.timeout = 30; //符合规范的模块请求最长等待秒数
	config.event = {}; //记录模块自定义事件
	

	/*简单的继承,针对纯对象*/
	byy.extend = byy.fn.extend = function(){
		var target = arguments[0]||{}, i = 1,length = arguments.length,clone;
		if(i == length){
			clone = target;
			target = this;
		}else{
			clone = arguments[i];
		}
		for(var k in clone){
			target[k] = clone[k];
		}
		return target;
	};
	/*深层次克隆，不包含原型链，只针对纯对象,递归没有尾调用，大对象可能会溢出*/
	byy.clone = function(){
		var args = slice.call(arguments);
		if(args.length == 0){
			return {};
		}else if(args.length == 1){
			//创造一个新的返回
			var source = args[0];
			if(typeof source != 'object'){
				return source;
			}else{
				var newTarget = {};
				for(var k in target){
					newTarget[k] = target[k];
				}		
				return newTarget;
			}
		}else{
			//多个参数
			var target = args[0];
			var left = args.splice(1);
			if(typeof target == 'object' && !(target instanceof Array)){//非数组的对象
				var newTarget = {};
				//先复制
				for(var k in target){
					newTarget[k] = target[k];
				}
				for(var i=0;i<left.length;i++){
					var source = left[i];
					for(var k in source){
						newTarget[k] = byy.clone(newTarget[k],source[k]);
					}
				}
				return newTarget;
			}else{
				return left[0];
			}
		}
	}
	byy.fn.extend({
		getStyle : function( node , name ){
			var style = node.currentStyle ? node.currentStyle : win.getComputedStyle(node, null);
  			return style[style.getPropertyValue ? 'getPropertyValue' : 'getAttribute'](name);
		},
		config : function( options ){
			options = options || {};
			for(var key in options){
				config[key] = options[key];
			}
			return this;
		},
		onevent : function(modName,events,callback){
			if(typeof modName !== 'string' || typeof callback !== 'function') return this;

		    return byy.event(modName, events, null, callback);
		}
	});

	byy.extend({
		version : version
		,basePath : getPath
		,byylang : byylang
		,error : error
		,onevent : function(modName,events,callback){
			if(typeof modName !== 'string' || typeof callback !== 'function') return this;

		    return byy.event(modName, events, null, callback);
		}
		,test : function(){
			console.log('enter byy tool method');
		}
		//设置引入
		,setRequire : function( obj ){
			this.requireDir = obj.basePath;
			this.requireModules = this.extend(this.requireModules,obj.modules);
			return this;
		}
		,device : function(){
			var agent = navigator.userAgent.toLowerCase();
			//获取版本号
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
				,ie: function(){ //ie版本
				  return (!!win.ActiveXObject || "ActiveXObject" in win) ? (
				    (agent.match(/msie\s(\d+)/) || [])[1] || '11' //由于ie11并没有msie的标识
				  ) : (agent.indexOf('edge') > -1 ? true : false);
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
		,modules : function(){
			var clone = {};
			for(var k in modules){
				clone[k] = modules[k];
			}
			return clone;
		}()
		,define : function( deeps , callback ){
			var thiz = this,
				type = typeof deeps === 'function',
				mods = function(){
					typeof callback === 'function' && callback(function( app , exports){
						byy[app] = exports;
						config.status[app] = true;
					});
					return this;
				};
			if(type){
				callback = deeps;
				deeps = [];
			}
			if(byy['all']){
				return mods.call(thiz);
			}
			thiz.require(deeps , mods,null,true);
			return thiz;
		}
		,require : function( apps , callback ,exports , iswait ){
			//如果在内置组件还未加载完成，即开始加载业务组件，则此处需要等待
			if(!_ready && !!!iswait){
				setTimeout(function(){
					byy.require(apps,callback,exports,iswait);
				},5);
				return;
			}
			var that = this, dir = config.dir = config.dir ? config.dir : getPath;
			var head = doc.getElementsByTagName('head')[0];
			apps = typeof apps === 'string' ? [apps] : apps;

			//如果页面已经存在jQuery1.7+库且所定义的模块依赖jQuery，则不加载内部jquery模块
			if(window.jQuery && jQuery.fn.on){
				that.each(apps, function(index, item){
				  if(item === 'jquery'){
				    apps.splice(index, 1);
				  }
				});
				
			}

			var item = apps[0], timeout = 0;
			exports = exports || [];

			//静态资源host
			config.host = config.host || (dir.match(/\/\/([\s\S]+?)\//)||['//'+ location.host +'/'])[0];

			if(apps.length === 0 || (byy['all'] && modules[item])){
				return typeof callback === 'function' && callback.apply(byy, exports), that;
			}

			//加载完毕
			function onScriptLoad(e, url){
				var readyRegExp = navigator.platform === 'PLaySTATION 3' ? /^complete$/ : /^(complete|loaded)$/;
				if (e.type === 'load' || (readyRegExp.test((e.currentTarget || e.srcElement).readyState))) {
				  config.modules[item] = url;
				  head.removeChild(node);
				  (function poll() {
				    if(++timeout > config.timeout * 1000 / 4){
				      return error(item + ' is not a valid module');
				    };
				    config.status[item] ? onCallback() : setTimeout(poll, 4);
				  }());
				}
			}

			//加载模块
			var node = doc.createElement('script'), 
				url =  (
				modules[item] ? (dir + '') : (that.requireDir || config.base || '')
				) + (that.modules[item] || that.requireModules[item] ||item) + '.js';
			node.async = true;
			node.charset = 'utf-8';
			node.src = url + function(){
			var version = config.version === true 
			? (config.v || (new Date()).getTime())
			: (config.version||'');
			return version ? ('?v=' + version) : '';
			}();
			//首次加载
			if(!config.modules[item]){
				head.appendChild(node);
				if(node.attachEvent && !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) && !isOpera){
				  node.attachEvent('onreadystatechange', function(e){
				    onScriptLoad(e, url);
				  });
				} else {
				  node.addEventListener('load', function(e){
				    onScriptLoad(e, url);
				  }, false);
				}
			} else {
				(function poll() {
				  if(++timeout > config.timeout * 1000 / 4){
				    return error(item + ' is not a valid module');
				  };
				  (typeof config.modules[item] === 'string' && config.status[item]) 
				  ? onCallback() 
				  : setTimeout(poll, 4);
				}());
			}

			config.modules[item] = url;

			//回调
			function onCallback(){
				exports.push(byy[item]);
				apps.length > 1 ?
				  that.require(apps.slice(1), callback, exports,iswait)
				: ( typeof callback === 'function' && callback.apply(byy, exports) );
			}

			return that;
		}
		,stope : function( e ){
			e = e || win.event;
  			e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
		}
		,each : function(obj , fn ){
			var that = this, key;
			if(typeof fn !== 'function') return that;
			obj = obj || [];
			if(obj.constructor === Object){
				for(key in obj){
					if(fn.call(obj[key], key, obj[key])) break;
				}
			} else {
				for(key = 0; key < obj.length; key++){
					if(fn.call(obj[key], key, obj[key])) break;
				}
			}
			return that;
		},
		/**工具类：创建Js / css **/
		getStyle : function(node , name){
    		var style = node.currentStyle ? node.currentStyle : win.getComputedStyle(node, null);
    		return style[style.getPropertyValue ? 'getPropertyValue' : 'getAttribute'](name);
		},
		link : function(href, fn, cssname){
			var that = this, link = doc.createElement('link');
			var head = doc.getElementsByTagName('head')[0];
			if(typeof fn === 'string') cssname = fn;
			var app = (cssname || href).replace(/\.|\//g, '');
			var id = link.id = 'byycss-'+app, timeout = 0;

			link.rel = 'stylesheet';
			link.type = 'text/css';
			link.href = href + (config.debug ? '?v='+new Date().getTime() : '');
			link.media = 'all';

			if(!doc.getElementById(id)){
				head.appendChild(link);
			}

			if(typeof fn !== 'function') return ;
			//轮询css是否加载完毕
			(function poll() {
				if(++timeout > config.timeout * 1000 / 100){
				  return error(href + ' timeout');
				};
				parseInt(that.getStyle(doc.getElementById(id), 'width')) === 1989 ? function(){
				  fn();
				}() : setTimeout(poll, 100);
			}());
		},
		addcss : function(firename, fn, cssname){
			byy.link(config.dir + 'css/' + firename, fn, cssname);
		}
	});
	
	
	

	//事件处理
	byy.fn.event = byy.event = function(modName,events,params,fn){
		var that = this
			,result = null
			,filter = events.match(/\((.*)\)$/)||[] //提取事件过滤器字符结构，如：select(xxx)
			,eventName = (modName + '.'+ events).replace(filter[0], '') //获取事件名称，如：form.select
			,filterName = filter[1] || '' //获取过滤器名称,，如：xxx
			,callback = function(_, item){
				var res = item && item.call(that, params);
				res === false && result === null && (result = false);
			};
		//添加事件
		if(fn){
			config.event[eventName] = config.event[eventName] || {};

			//这里不再对多次事件监听做支持，避免更多麻烦
			//config.event[eventName][filterName] ? config.event[eventName][filterName].push(fn) : 
			config.event[eventName][filterName] = [fn];
			return this;
		}

		//执行事件回调
		byy.each(config.event[eventName], function(key, item){
			//执行当前模块的全部事件
			if(filterName === '{*}'){
				byy.each(item, callback);
				return;
			}

			//执行指定事件
			key === '' && byy.each(item, callback);
			key === filterName && byy.each(item, callback);
		});

		return result;
	}

	//将数组中的对象按其某个成员排序
  	byy.sort = byy.prototype.sort = function(obj, key, desc){
	    var clone = JSON.parse(
	      JSON.stringify(obj || [])
	    );
	    
	    if(!key) return clone;
	    
	    //如果是数字，按大小排序，如果是非数字，按字典序排序
		clone.sort(function(o1, o2){
			var isNum = /^-?\d+$/,v1 = o1[key],v2 = o2[key];

			if(isNum.test(v1)) v1 = parseFloat(v1);
			if(isNum.test(v2)) v2 = parseFloat(v2);

			if(v1 && !v2){
				return 1;
			} else if(!v1 && v2){
				return -1;
			}

			if(v1 > v2){
				return 1;
			} else if (v1 < v2) {
				return -1;
			} else {
				return 0;
			}
		});

	    desc && clone.reverse(); //倒序
	    return clone;
	};

	//自动引入jquery 和 语言包 
	byy.require(['lang','pollify','util','form'],function(){
		_ready = true;
		byy.initUI();
	},null,true);
	window.b = window.byy = byy;
	return byy;
});