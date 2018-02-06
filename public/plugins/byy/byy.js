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
 ***/

(function( global , factory ){

	factory(global);

})(typeof window !== "undefined" ? window : this,function( win , undefined ){
	var 
		version = '1.4.0',
		location = win.location,
		localizeName = 'data-localize',//国际化名称
		dataLocalizeName = 'localize',
		localizeTitle = 'data-localize-title',//国际化的title属性
		dataLocalizeTitle = 'localize-title',
		isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]',
		byy = function( selector , context ){
			return new byy.fn.init( selector , context );
		},
		error = function( msg ){
			win.console && console.error && console.error('byyjs hint: ' + msg);
		},
		doc = win.document, 
		byylang = 'zh',
		getPath = function(){
			var js = doc.scripts, tnode = js[js.length - 1],jsPath = tnode.querySelector ? tnode.src : tnode.getAttribute('src'),language = tnode.getAttribute('lang') || 'zh';
			byylang = language;
  			return jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
		}(),
		byynsc = {},//byy命名空间存储
		modules = {
			page : 'lib/page'//分页
			,jquery : 'lib/jquery'//
			,win : 'lib/win'
			// ,table : 'lib/table'
			,webuploader : 'lib/webuploader'
			,validator : 'lib/validator'
			,inputsearch : 'lib/inputsearch'
			,searchselect : 'lib/searchselect'
			,selectextend : 'lib/selectextend'
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
			,treeext : 'lib/treeext'
			,audio : 'lib/audio'
			,laytpl : 'lib/laytpl'
			,table : 'lib/table2'

		};

	if (!Object.create) {
		Object.create = function (o) {
			if (arguments.length > 1) {
				throw new Error('Object.create implementation only accepts the first parameter.');
			}
			function F() {}
			F.prototype = o;
			return new F();
		};
	}
	
	if (!Object.keys) {
		Object.keys = function(o) {
			if (o !== Object(o)) {
				throw new TypeError('Object.keys called on a non-object');
			}
			var k=[], p;
			for (p in o) {
				if (Object.prototype.hasOwnProperty.call(o,p)) {
					k.push(p);
				}
			}
			return k;
		};
	}
	
	/*
	 * Date ES5 extend
	*/
	if (!Date.now) {
		Date.now = function now() {
			return (new Date).valueOf();
		};
	}
	/*
	 * Function ES5 extend
	*/
	if (!Function.prototype.bind) {
	  	Function.prototype.bind = function (oThis) {
			if (typeof this !== "function") {
		  		// closest thing possible to the ECMAScript 5 internal IsCallable function
		  		throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
			}
	
			var aArgs = Array.prototype.slice.call(arguments, 1), 
				fToBind = this, 
				fNOP = function () {},
				fBound = function () {
			  		return fToBind.apply(this instanceof fNOP && oThis
									 ? this
									 : oThis || window,
								   aArgs.concat(Array.prototype.slice.call(arguments)));
				};
	
			fNOP.prototype = this.prototype;
			fBound.prototype = new fNOP();
	
			return fBound;
	  	};
	}
	/*
	 * Array ES5 extend
	*/
	if(!Array.isArray) {
		Array.isArray = function (vArg) {
			return Object.prototype.toString.call(vArg) === "[object Array]";
		};
	}
	if ( !Array.prototype.forEach ) {
		Array.prototype.forEach = function forEach( callback, thisArg ) {
			var T, k;
			if ( this == null ) {
				throw new TypeError( "this is null or not defined" );
			}
			var O = Object(this);
			var len = O.length >>> 0; 
			if ( typeof callback !== "function" ) {
				throw new TypeError( callback + " is not a function" );
			}
			if ( arguments.length > 1 ) {
				T = thisArg;
			}
			k = 0;
			while( k < len ) {
				var kValue;
				if ( k in O ) {
					kValue = O[ k ];
					callback.call( T, kValue, k, O );
				}
				k++;
			}
		};
	}
	if (!Array.prototype.map) {
	    Array.prototype.map = function(callback, thisArg) {
	        var T, A, k;
	        if (this == null) {
	            throw new TypeError(" this is null or not defined");
	        }

	        var O = Object(this);
	        var len = O.length >>> 0;

	        if (typeof callback !== "function") {
	            throw new TypeError(callback + " is not a function");
	        }

	        if (thisArg) {
	            T = thisArg;
	        }

	        A = new Array(len);

	        k = 0;
	        while(k < len) {

	            var kValue, mappedValue;
	            if (k in O) {
	                kValue = O[ k ];
	                mappedValue = callback.call(T, kValue, k, O);
	                A[ k ] = mappedValue;
	            }
	            k++;
	        }
	        return A;
	    };
	}
	if (!Array.prototype.filter) {
	  Array.prototype.filter = function(fun/*, thisArg*/) {
	    'use strict';

	    if (this === void 0 || this === null) {
	      throw new TypeError();
	    }

	    var t = Object(this);
	    var len = t.length >>> 0;
	    if (typeof fun !== 'function') {
	      throw new TypeError();
	    }

	    var res = [];
	    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
	    for (var i = 0; i < len; i++) {
	      if (i in t) {
	        var val = t[i];

	        // NOTE: Technically this should Object.defineProperty at
	        //       the next index, as push can be affected by
	        //       properties on Object.prototype and Array.prototype.
	        //       But that method's new, and collisions should be
	        //       rare, so use the more-compatible alternative.
	        if (fun.call(thisArg, val, i, t)) {
	          res.push(val);
	        }
	      }
	    }

	    return res;
	  };
	}
	if (!Array.prototype.some) {
	  Array.prototype.some = function(fun/*, thisArg*/) {
	    'use strict';

	    if (this == null) {
	      throw new TypeError('Array.prototype.some called on null or undefined');
	    }

	    if (typeof fun !== 'function') {
	      throw new TypeError();
	    }

	    var t = Object(this);
	    var len = t.length >>> 0;

	    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
	    for (var i = 0; i < len; i++) {
	      if (i in t && fun.call(thisArg, t[i], i, t)) {
	        return true;
	      }
	    }

	    return false;
	  };
	}
	if (!Array.prototype.every) {
	  Array.prototype.every = function(callbackfn, thisArg) {
	    'use strict';
	    var T, k;

	    if (this == null) {
	      throw new TypeError('this is null or not defined');
	    }

	    // 1. Let O be the result of calling ToObject passing the this 
	    //    value as the argument.
	    var O = Object(this);

	    // 2. Let lenValue be the result of calling the Get internal method
	    //    of O with the argument "length".
	    // 3. Let len be ToUint32(lenValue).
	    var len = O.length >>> 0;

	    // 4. If IsCallable(callbackfn) is false, throw a TypeError exception.
	    if (typeof callbackfn !== 'function') {
	      throw new TypeError();
	    }

	    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
	    if (arguments.length > 1) {
	      T = thisArg;
	    }

	    // 6. Let k be 0.
	    k = 0;

	    // 7. Repeat, while k < len
	    while (k < len) {

	      var kValue;

	      // a. Let Pk be ToString(k).
	      //   This is implicit for LHS operands of the in operator
	      // b. Let kPresent be the result of calling the HasProperty internal 
	      //    method of O with argument Pk.
	      //   This step can be combined with c
	      // c. If kPresent is true, then
	      if (k in O) {

	        // i. Let kValue be the result of calling the Get internal method
	        //    of O with argument Pk.
	        kValue = O[k];

	        // ii. Let testResult be the result of calling the Call internal method
	        //     of callbackfn with T as the this value and argument list 
	        //     containing kValue, k, and O.
	        var testResult = callbackfn.call(T, kValue, k, O);

	        // iii. If ToBoolean(testResult) is false, return false.
	        if (!testResult) {
	          return false;
	        }
	      }
	      k++;
	    }
	    return true;
	  };
	}
	if (!Array.prototype.indexOf) {
	  Array.prototype.indexOf = function(searchElement, fromIndex) {

	    var k;

	    // 1. Let o be the result of calling ToObject passing
	    //    the this value as the argument.
	    if (this == null) {
	      throw new TypeError('"this" is null or not defined');
	    }

	    var o = Object(this);

	    // 2. Let lenValue be the result of calling the Get
	    //    internal method of o with the argument "length".
	    // 3. Let len be ToUint32(lenValue).
	    var len = o.length >>> 0;

	    // 4. If len is 0, return -1.
	    if (len === 0) {
	      return -1;
	    }

	    // 5. If argument fromIndex was passed let n be
	    //    ToInteger(fromIndex); else let n be 0.
	    var n = fromIndex | 0;

	    // 6. If n >= len, return -1.
	    if (n >= len) {
	      return -1;
	    }

	    // 7. If n >= 0, then Let k be n.
	    // 8. Else, n<0, Let k be len - abs(n).
	    //    If k is less than 0, then let k be 0.
	    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

	    // 9. Repeat, while k < len
	    while (k < len) {
	      // a. Let Pk be ToString(k).
	      //   This is implicit for LHS operands of the in operator
	      // b. Let kPresent be the result of calling the
	      //    HasProperty internal method of o with argument Pk.
	      //   This step can be combined with c
	      // c. If kPresent is true, then
	      //    i.  Let elementK be the result of calling the Get
	      //        internal method of o with the argument ToString(k).
	      //   ii.  Let same be the result of applying the
	      //        Strict Equality Comparison Algorithm to
	      //        searchElement and elementK.
	      //  iii.  If same is true, return k.
	      if (k in o && o[k] === searchElement) {
	        return k;
	      }
	      k++;
	    }
	    return -1;
	  };
	}
	if (!Array.prototype.lastIndexOf) {
	  Array.prototype.lastIndexOf = function(searchElement /*, fromIndex*/) {
	    'use strict';

	    if (this === void 0 || this === null) {
	      throw new TypeError();
	    }

	    var n, k,
	      t = Object(this),
	      len = t.length >>> 0;
	    if (len === 0) {
	      return -1;
	    }

	    n = len - 1;
	    if (arguments.length > 1) {
	      n = Number(arguments[1]);
	      if (n != n) {
	        n = 0;
	      }
	      else if (n != 0 && n != (1 / 0) && n != -(1 / 0)) {
	        n = (n > 0 || -1) * Math.floor(Math.abs(n));
	      }
	    }

	    for (k = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n); k >= 0; k--) {
	      if (k in t && t[k] === searchElement) {
	        return k;
	      }
	    }
	    return -1;
	  };
	}
	//reduce
	if (typeof Array.prototype.reduce != "function") {
	  Array.prototype.reduce = function (callback, initialValue ) {
		 var previous = initialValue, k = 0, length = this.length;
		 if (typeof initialValue === "undefined") {
			previous = this[0];
			k = 1;
		 }
		 
		if (typeof callback === "function") {
		  for (k; k < length; k++) {
			 this.hasOwnProperty(k) && (previous = callback(previous, this[k], k, this));
		  }
		}
		return previous;
	  };
	}
	// Production steps of ECMA-262, Edition 5, 15.4.4.22
	// Reference: http://es5.github.io/#x15.4.4.22
	if ('function' !== typeof Array.prototype.reduceRight) {
	  Array.prototype.reduceRight = function(callback /*, initialValue*/) {
	    'use strict';
	    if (null === this || 'undefined' === typeof this) {
	      throw new TypeError('Array.prototype.reduce called on null or undefined');
	    }
	    if ('function' !== typeof callback) {
	      throw new TypeError(callback + ' is not a function');
	    }
	    var t = Object(this), len = t.length >>> 0, k = len - 1, value;
	    if (arguments.length >= 2) {
	      value = arguments[1];
	    } else {
	      while (k >= 0 && !(k in t)) {
	        k--;
	      }
	      if (k < 0) {
	        throw new TypeError('Reduce of empty array with no initial value');
	      }
	      value = t[k--];
	    }
	    for (; k >= 0; k--) {
	      if (k in t) {
	        value = callback(value, t[k], k, t);
	      }
	    }
	    return value;
	  };
	}
	String.prototype.startWith=function(str){     
		var reg=new RegExp("^"+str);     
		return reg.test(this);        
	}  

	String.prototype.endWith=function(str){     
		var reg=new RegExp(str+"$");     
		return reg.test(this);        
	}
	/*
	 * String ES5 extend
	*/
	if(!String.prototype.trim) {
		String.prototype.trim = function () {
			return this.replace(/^\s+|\s+$/g,'');
		};
	}
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
	config.timeout = 10; //符合规范的模块请求最长等待秒数
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
		}
	});

	byy.extend({
		version : version
		,basePath : getPath
		,byylang : byylang
		,error : error
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
				  if(/windows/.test(agent)){
				    return 'windows';
				  } else if(/linux/.test(agent)){
				    return 'linux';
				  } else if(/iphone|ipod|ipad|ios/.test(agent)){
				    return 'ios';
				  }
				}()
				,ie: function(){ //ie版本
				  return (!!win.ActiveXObject || "ActiveXObject" in win) ? (
				    (agent.match(/msie\s(\d+)/) || [])[1] || '11' //由于ie11并没有msie的标识
				  ) : false;
				}()
				,ff : function(){
					return agent.indexOf('firefox') > -1;
				}()
				,safari : function(){
					return agent.indexOf('safari') > -1 && agent.indexOf('chrome') == -1;
				}()
				,chrome : function(){
					return agent.indexOf('chrome') > -1 && agent.indexOf('safari') > -1;
				}()
				,opera : function(){
					return agent.indexOf('opera') > -1;
				}()
				,weixin: getVersion('micromessenger')  //是否微信
			}
			//移动设备
		    result.android = /android/.test(agent);
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
			thiz.require(deeps , mods);
			return thiz;
		}
		,require : function( apps , callback ,exports ){
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
				  that.require(apps.slice(1), callback, exports)
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
		}
	});
	
	/** 绑定一些常用的小默认事件 **/
	var initUI = function( target ){
		/* 如果页面中存在 .byy-code 则初始化code */
		target = target || $('body');
		if(target.find('pre.byy-code').length > 0 ){
			byy(target.find('pre.byy-code')).code();
		}

		/* 如果页面中存在 .byy-radio 则初始化 radio */
		if(target.find('input.byy-form-radio').length > 0){
			byy(target.find('input.byy-form-radio')).radio();
		}
		/* 如果页面中存在 .byy-checkbox 则初始化 checkbox */
		if(target.find('input.byy-form-checkbox').length > 0){
			byy(target.find('input.byy-form-checkbox')).checkbox();
		}
		/* 如果页面中存在 .byy-form-select 则初始化select */
		if(target.find('select.byy-form-select').length > 0 ){
			byy(target.find('select.byy-form-select')).select();
		}

		/*NAV*/
		if(target.find('.byy-nav').length > 0){
			byy(target.find('.byy-nav')).nav();
		}
		/*breadcrumb*/
		if(target.find('.byy-breadcrumb').length > 0){
			byy(target.find('.byy-breadcrumb')).breadcrumb();
		}
		/*按钮菜单*/
		if(target.find('.byy-btn-menu').length > 0){
			byy(target.find('.byy-btn-menu')).buttonmenu();
		}
		/*进度条*/
		if(target.find('.byy-progress').length > 0){
			byy(target.find('.byy-progress')).progress();
		}
		/*tab标签*/
		if(target.find('.byy-tab').length > 0){
			byy(target.find('.byy-tab')).tabEvent();
		}
		/*列表页面处理*/
		if(target.find('.list-panel').length > 0){
			//由于其他渲染问题，需要延迟加载处理
			setTimeout(function(){
				byy(target.find('.list-panel')).list();	
			},20);
		}
	}

	byy.fn.extend({
		initUI : function(){
			var $ele = this.$ele;
			initUI($ele);
		},
		onevent : function(modName,events,callback){
			if(typeof modName !== 'string' || typeof callback !== 'function') return this;

		    return byy.event(modName, events, null, callback);
		}
	});
	/**暴露initUI接口**/
	byy.extend({ 
		initUI : function(){
			initUI();
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
	      var isNum = /^-?\d+$/
	      ,v1 = o1[key]
	      ,v2 = o2[key];
	      
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

	/**工具类：创建Js / css **/
	byy.extend({
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


	/**工具类：数组**/
	byy.extend({
		contains : function( target , item ){
			return target.indexOf(item) > -1;
		},
		removeAt : function( target , index ){
			return !!target.splice( index , 1).length;
		},
		remove : function( target , item ){
			var index = target.indexOf( item );
			if( index > -1 ){
				return byy.removeAt( target , index);
			}
			return false;
		},
		shuffle : function( target ){
			var x , j , l ;
			for(l = target.length; l > 0 ;){
				j = parseInt(Math.random() * l);
				x = target[--l],target[l] = target[j],target[j] = x;
			}
			return target;
		},
		random : function( target ){
			return target[parseInt(Math.random() * target.length )];
		},
		flatten : function( target ){
			var res = [];
			target.forEach(function( ele , index){
				if(Array.isArray( ele )){
					res = res.concat( byy.flatten( ele ) );
				}else{
					res.push( ele );
				}
			});
			return res;
		},
		unique : function( target ){
			var res = [];
			loop : for( var i =0 ,n = target.length;i<n;i++){
				for(var x = i + 1 ;x < n ; x++ ){
					if(target[x] === target[i]){
						continue loop;
					}
				}
				res.push(target[i]);
			}
			return res;
		},
		compact : function( target , isTrim){
			isTrim = isTrim ? isTrim : false;
			return target.filter(function( ele ){
				//isTrim -- true  判断"  ",false 不判断
				return !byy.isNull( ele ) && ( isTrim ? !(byy.trim(ele+'') === '') : !(ele+'' === ''));
				// return ( isTrim ? (byy.trim(ele) === '' ? false : true ) : true ) && !byy.isNull( ele );
			});
		},
		/*仅仅能提取一层关系，主要是对于纯对象*/
		pluck : function( target , name ,rtnNull){
			var result = [], prop ;
			target.forEach(function( ele ){
				prop = ele[name];
				if(prop != null){
					result.push(prop);
				}else if(rtnNull === true){
					result.push(prop);
				}
			});
			return result;
		},
		union : function(){
			var len = arguments.length,res = [];
			for(var i=0;i<len;i++){
				res = res.concat(arguments[i]);
			}
			return byy.unique(res);
		},
		min : function( target ){
			return Math.min.apply(0 , target);
		},
		max : function( target ){
			return Math.max.apply(0 , target);
		}

	});


	/**工具类：日期**/
	byy.extend({
		
		isLeepYear : function( d ){
			if(d instanceof Date){
				var year = d.getFullYear();
	    		return !!((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)));
			}else{
				error('日期类型不正确!');
			}
		},
		//获得两个日期的偏差
		/***
		 * @param date1 ： 第一个日期，字符串格式仅支持 - / 
		 * @param date2 : 第二个日期
		 * @param type : 返回的偏差类型(Y : 年,M : 月　,　D : 天,　ｈ : 小时, m : 分钟, s : 秒　,default : 毫秒)
		 * 
		 **/
		getDiffOfDate : function(date1,date2,type){


		},
		//增加天数
		addDay : function( date , day){

		},
		//获得本月最后一天
		getLastDayOfMonth : function( date ){

		},
		
		//获得某天后一个月的当天
		getAfterMonth : function(){

		},
		//返回周几
		getWeek : function(){

		},
		//返回当月有几天
		getDaysInMonth : function(){
			var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
			var m = d.getMonth();
	        return m == 1 && this.isLeapYear(d) ? 29 : daysInMonth[m];
		},
		parseDate : function(){

		},
		formatDate : function(){
			
		}
	});



	/**工具类：变量判断**/
	byy.extend({
		isNull : function( obj ){
			return null == obj || undefined == obj;
		},
		isEmpty : function( obj ){
			return null == obj || undefined == obj || '' == obj;
		},
		isArray : function( obj ){
			return $.isArray( obj );
		},
		isFunction : function( obj ){
			return $.isFunction( obj );
		},
		isEmptyObject : function( obj ){
			return $.isEmptyObject( obj );
		},
		isPlainObject : function( obj ){
			return $.isPlainObject( obj );
		},
		isWindow : function( obj ){
			return $.isWindow( obj );
		},
		isNumeric : function( obj ){
			return $.isNumeric( obj );
		},
		type : function( obj ){
			return $.type ( obj );
		}
	});


	/**工具类：浏览器判断**/
	byy.extend({	
		isIE : function(){
			return $.browser.msie;
		},
		isOpera : function(){
			return $.browser.opera;
		},
		isFF : function(){
			return $.browser.mozilla;
		},
		isSafari : function(){
			return $.browser.safari;
		},
		//校验当前是否为移动端设备
		isMobile : function(){
			var sUserAgent = navigator.userAgent.toLowerCase();
		    var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
		    var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
		    var bIsMidp = sUserAgent.match(/midp/i) == "midp";
		    var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
		    var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
		    var bIsAndroid = sUserAgent.match(/android/i) == "android";
		    var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
		    var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
		    if (!(bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) ){
		        return false;
		    }else{
		    	return true;
		    }
		},
		isIOS : function(){
			var sUserAgent = navigator.userAgent.toLowerCase();
		    var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
		    var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
		    var bIsMidp = sUserAgent.match(/midp/i) == "midp";
		    var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
		    var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
		    var bIsAndroid = sUserAgent.match(/android/i) == "android";
		    var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
		    var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
		    if (!(bIsIpad || bIsIphoneOs ) ){
		        return false;
		    }else{
		    	return true;
		    }
		}
	});

	/**工具类：url**/
	byy.extend({
		getSearch : function( url , name ){
			if( !name ){
				name = url;
				url = location.href;
			}
			var rv = '';
			url = url.indexOf('?') > -1 ? url.split('?')[1] : '';
			if(url != ''){
				var ls = url.split('&');
				for(var i=0;i<ls.length;i++){
					var ele = ls[i];
					var kname = ele.split('=')[0] ||'',kvalue = ele.split('=')[1] || '';
					if(kname === name){
						rv = kvalue;
						break;
					}
				}
			}
			return decodeURIComponent(rv);
		},
		addUrlParams : function( url , params){
			if(!!!params){
				params = url;
				url = location.href;
			}
			var addStr = (function(opt){
				var ts = '';
				for(var k in opt){
					var value = encodeURIComponent(opt[k]);
					ts += k+'='+value+'&';
				}
				ts = ts.substring(0,ts.lastIndexOf('&'));
				return ts;
			})(params);
			if(url.indexOf('?') > -1 ){
				url = url + '&' + addStr;
			}else{
				url = url + '?' + addStr;
			}
			return url;
		}

	});


	/***工具类：字符串*/
	byy.extend({
		trim : function( str ){
			if( typeof str === 'string'){
				return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,'');
			}
			return str;
		},
		/**格式化字符串替换**/
		formatStr : function( ){
			var str = arguments[0];
			var arr = [].splice.call(arguments,1,arguments.length -1);
			return str.replace(/\{(\d+)\}/g,function(s,i){
				if(arr[i]!='0'){
					return arr[i] || '';
				}else{
					return arr[i];
				}
			});
		}
	});

	/**工具类：md5**/
	byy.extend({
		md5 : function( string ){
			var rotateLeft = function(lValue, iShiftBits) {
				return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
			};
			var addUnsigned = function(lX, lY) {
				var lX4, lY4, lX8, lY8, lResult;
				lX8 = (lX & 0x80000000);
				lY8 = (lY & 0x80000000);
				lX4 = (lX & 0x40000000);
				lY4 = (lY & 0x40000000);
				lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
				if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
				if (lX4 | lY4) {
					if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
					else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
				} else {
					return (lResult ^ lX8 ^ lY8);
				}
			};
			var F = function(x, y, z) {
				return (x & y) | ((~ x) & z);
			};
			var G = function(x, y, z) {
				return (x & z) | (y & (~ z));
			};
			var H = function(x, y, z) {
				return (x ^ y ^ z);
			};
			var I = function(x, y, z) {
				return (y ^ (x | (~ z)));
			};
			var FF = function(a, b, c, d, x, s, ac) {
				a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
				return addUnsigned(rotateLeft(a, s), b);
			};
			var GG = function(a, b, c, d, x, s, ac) {
				a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
				return addUnsigned(rotateLeft(a, s), b);
			};
			var HH = function(a, b, c, d, x, s, ac) {
				a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
				return addUnsigned(rotateLeft(a, s), b);
			};
			var II = function(a, b, c, d, x, s, ac) {
				a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
				return addUnsigned(rotateLeft(a, s), b);
			};
			var convertToWordArray = function(string) {
				var lWordCount;
				var lMessageLength = string.length;
				var lNumberOfWordsTempOne = lMessageLength + 8;
				var lNumberOfWordsTempTwo = (lNumberOfWordsTempOne - (lNumberOfWordsTempOne % 64)) / 64;
				var lNumberOfWords = (lNumberOfWordsTempTwo + 1) * 16;
				var lWordArray = Array(lNumberOfWords - 1);
				var lBytePosition = 0;
				var lByteCount = 0;
				while (lByteCount < lMessageLength) {
					lWordCount = (lByteCount - (lByteCount % 4)) / 4;
					lBytePosition = (lByteCount % 4) * 8;
					lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
					lByteCount++;
				}
				lWordCount = (lByteCount - (lByteCount % 4)) / 4;
				lBytePosition = (lByteCount % 4) * 8;
				lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
				lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
				lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
				return lWordArray;
			};
			var wordToHex = function(lValue) {
				var WordToHexValue = "", WordToHexValueTemp = "", lByte, lCount;
				for (lCount = 0; lCount <= 3; lCount++) {
					lByte = (lValue >>> (lCount * 8)) & 255;
					WordToHexValueTemp = "0" + lByte.toString(16);
					WordToHexValue = WordToHexValue + WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2);
				}
				return WordToHexValue;
			};
			var uTF8Encode = function(string) {
				string = string.replace(/\x0d\x0a/g, "\x0a");
				var output = "";
				for (var n = 0; n < string.length; n++) {
					var c = string.charCodeAt(n);
					if (c < 128) {
						output += String.fromCharCode(c);
					} else if ((c > 127) && (c < 2048)) {
						output += String.fromCharCode((c >> 6) | 192);
						output += String.fromCharCode((c & 63) | 128);
					} else {
						output += String.fromCharCode((c >> 12) | 224);
						output += String.fromCharCode(((c >> 6) & 63) | 128);
						output += String.fromCharCode((c & 63) | 128);
					}
				}
				return output;
			};
			var x = Array();
			var k, AA, BB, CC, DD, a, b, c, d;
			var S11=7, S12=12, S13=17, S14=22;
			var S21=5, S22=9 , S23=14, S24=20;
			var S31=4, S32=11, S33=16, S34=23;
			var S41=6, S42=10, S43=15, S44=21;
			string = uTF8Encode(string);
			x = convertToWordArray(string);
			a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
			for (k = 0; k < x.length; k += 16) {
				AA = a; BB = b; CC = c; DD = d;
				a = FF(a, b, c, d, x[k+0],  S11, 0xD76AA478);
				d = FF(d, a, b, c, x[k+1],  S12, 0xE8C7B756);
				c = FF(c, d, a, b, x[k+2],  S13, 0x242070DB);
				b = FF(b, c, d, a, x[k+3],  S14, 0xC1BDCEEE);
				a = FF(a, b, c, d, x[k+4],  S11, 0xF57C0FAF);
				d = FF(d, a, b, c, x[k+5],  S12, 0x4787C62A);
				c = FF(c, d, a, b, x[k+6],  S13, 0xA8304613);
				b = FF(b, c, d, a, x[k+7],  S14, 0xFD469501);
				a = FF(a, b, c, d, x[k+8],  S11, 0x698098D8);
				d = FF(d, a, b, c, x[k+9],  S12, 0x8B44F7AF);
				c = FF(c, d, a, b, x[k+10], S13, 0xFFFF5BB1);
				b = FF(b, c, d, a, x[k+11], S14, 0x895CD7BE);
				a = FF(a, b, c, d, x[k+12], S11, 0x6B901122);
				d = FF(d, a, b, c, x[k+13], S12, 0xFD987193);
				c = FF(c, d, a, b, x[k+14], S13, 0xA679438E);
				b = FF(b, c, d, a, x[k+15], S14, 0x49B40821);
				a = GG(a, b, c, d, x[k+1],  S21, 0xF61E2562);
				d = GG(d, a, b, c, x[k+6],  S22, 0xC040B340);
				c = GG(c, d, a, b, x[k+11], S23, 0x265E5A51);
				b = GG(b, c, d, a, x[k+0],  S24, 0xE9B6C7AA);
				a = GG(a, b, c, d, x[k+5],  S21, 0xD62F105D);
				d = GG(d, a, b, c, x[k+10], S22, 0x2441453);
				c = GG(c, d, a, b, x[k+15], S23, 0xD8A1E681);
				b = GG(b, c, d, a, x[k+4],  S24, 0xE7D3FBC8);
				a = GG(a, b, c, d, x[k+9],  S21, 0x21E1CDE6);
				d = GG(d, a, b, c, x[k+14], S22, 0xC33707D6);
				c = GG(c, d, a, b, x[k+3],  S23, 0xF4D50D87);
				b = GG(b, c, d, a, x[k+8],  S24, 0x455A14ED);
				a = GG(a, b, c, d, x[k+13], S21, 0xA9E3E905);
				d = GG(d, a, b, c, x[k+2],  S22, 0xFCEFA3F8);
				c = GG(c, d, a, b, x[k+7],  S23, 0x676F02D9);
				b = GG(b, c, d, a, x[k+12], S24, 0x8D2A4C8A);
				a = HH(a, b, c, d, x[k+5],  S31, 0xFFFA3942);
				d = HH(d, a, b, c, x[k+8],  S32, 0x8771F681);
				c = HH(c, d, a, b, x[k+11], S33, 0x6D9D6122);
				b = HH(b, c, d, a, x[k+14], S34, 0xFDE5380C);
				a = HH(a, b, c, d, x[k+1],  S31, 0xA4BEEA44);
				d = HH(d, a, b, c, x[k+4],  S32, 0x4BDECFA9);
				c = HH(c, d, a, b, x[k+7],  S33, 0xF6BB4B60);
				b = HH(b, c, d, a, x[k+10], S34, 0xBEBFBC70);
				a = HH(a, b, c, d, x[k+13], S31, 0x289B7EC6);
				d = HH(d, a, b, c, x[k+0],  S32, 0xEAA127FA);
				c = HH(c, d, a, b, x[k+3],  S33, 0xD4EF3085);
				b = HH(b, c, d, a, x[k+6],  S34, 0x4881D05);
				a = HH(a, b, c, d, x[k+9],  S31, 0xD9D4D039);
				d = HH(d, a, b, c, x[k+12], S32, 0xE6DB99E5);
				c = HH(c, d, a, b, x[k+15], S33, 0x1FA27CF8);
				b = HH(b, c, d, a, x[k+2],  S34, 0xC4AC5665);
				a = II(a, b, c, d, x[k+0],  S41, 0xF4292244);
				d = II(d, a, b, c, x[k+7],  S42, 0x432AFF97);
				c = II(c, d, a, b, x[k+14], S43, 0xAB9423A7);
				b = II(b, c, d, a, x[k+5],  S44, 0xFC93A039);
				a = II(a, b, c, d, x[k+12], S41, 0x655B59C3);
				d = II(d, a, b, c, x[k+3],  S42, 0x8F0CCC92);
				c = II(c, d, a, b, x[k+10], S43, 0xFFEFF47D);
				b = II(b, c, d, a, x[k+1],  S44, 0x85845DD1);
				a = II(a, b, c, d, x[k+8],  S41, 0x6FA87E4F);
				d = II(d, a, b, c, x[k+15], S42, 0xFE2CE6E0);
				c = II(c, d, a, b, x[k+6],  S43, 0xA3014314);
				b = II(b, c, d, a, x[k+13], S44, 0x4E0811A1);
				a = II(a, b, c, d, x[k+4],  S41, 0xF7537E82);
				d = II(d, a, b, c, x[k+11], S42, 0xBD3AF235);
				c = II(c, d, a, b, x[k+2],  S43, 0x2AD7D2BB);
				b = II(b, c, d, a, x[k+9],  S44, 0xEB86D391);
				a = addUnsigned(a, AA);
				b = addUnsigned(b, BB);
				c = addUnsigned(c, CC);
				d = addUnsigned(d, DD);
			}
			var tempValue = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
			return tempValue.toLowerCase();
		}
	});

	/**** 工具类： json ****/
	byy.extend({
		json : function(str,flag){
			if(null !=str && undefined != str && ''!=str && typeof str != 'object'){
				var obj = {};
				try{
					obj = $.parseJSON(str);	
				}catch(Error){
					return {error:Error,str : str};
				}
				null != flag && undefined != flag && flag == true ? byy.fixJson(obj) : '';
				return obj;
			}else if(typeof str == 'object'){
				return str;
			}
			return {};
		},
		fixJson : function(target){
			var map = {};
			var scan = function(o){
				if(o.hasOwnProperty('$id')){
					var v = o['$id'];
					map[v] = o;
				}
				//如果含有ID ，则为独立对象，需要对ref进行替换
				if(!$.isEmptyObject(o) && !$.isFunction(o) &&null!=o&&o&&'null'!=o){
					for(var n in o){
						if(o.hasOwnProperty(n)){
							if(o[n] instanceof Object){
								scan(o[n]);
							}	
						}
					}
				}	
			};
			var replaceObj = function(o){
				//移除其他属性
				if(o.hasOwnProperty('$id')){
					delete o['$id'];
					delete o['$type'];
				}
				if(o.hasOwnProperty('$ref')){
					var v = o['$ref'];
					o = map[v];
					return o;
				}
				if(!$.isEmptyObject(o) && !$.isFunction(o)){
					for(var n in o){
						if(o[n] instanceof Object){
							o[n] = replaceObj(o[n]);
						}
					}
				}
				return o;
			};
			scan(target);
			replaceObj(target);
		},
		stringfy : function( obj ){
			if(null == obj || obj == undefined)return undefined;
			if(typeof obj == 'string')return obj;
			if(typeof obj =='number')return obj;
			var arrParse = function(temp){
				var tempstr = [];
				tempstr.push('[');
				for(var i=0;i<temp.length;i++){
					var tempobj = temp[i];
					var str = switchObj(tempobj);
					tempstr.push(str);
					if(i != temp.length-1){
						tempstr.push(',');
					}
				}
				tempstr.push(']');
				return tempstr.join('');
			
			};
			var switchObj  = function(tempobj){
				if(typeof tempobj == 'object'){
					if(tempobj instanceof Array){
						return arrParse(tempobj);
					}else if(tempobj instanceof Object){
						return objParse(tempobj);	
					}
				}else if(typeof tempobj == 'function'){
					return ''+tempobj.toString()+'';
				}else{
					return '"'+tempobj+'"';
				}
				return '';
			};
			var objParse = function(obj){
				var htmls = [];
				htmls.push('{');
				for(var p in obj){
					var tempobj = obj[p];
					var str= switchObj(tempobj);
					htmls.push('"'+p+'":'+str+'');
					htmls.push(',');
				}
				htmls.splice(htmls.length-1);
				htmls.push('}');
				return htmls.join('');
			};
			return switchObj(obj);
		}
	});


	/**guid**/
	byy.extend({
		//guid 生成工具
		guid : function( prefix ){
			var counter = 0;
	        return (function( prefix ) {
	            var guid = (+new Date()).toString( 32 ),i = 0;
	            for ( ; i < 5; i++ ) {
	                guid += Math.floor( Math.random() * 65535 ).toString( 32 );
	            }
	            return (prefix || 'byy_') + guid + (counter++).toString( 32 );
	        })( prefix )
		},
		//格式化文件大小
		formatSize : function(  size, pointLength, units ){
			var unit;
	        units = units || [ 'B', 'KB', 'M', 'G', 'TB' ];

	        while ( (unit = units.shift()) && size > 1024 ) {
	            size = size / 1024;
	        }
	        return (unit === 'B' ? size : size.toFixed( pointLength || 2 )) + unit;
		}
	});


	/**frame 相关工具类**/
	byy.extend({
		//贯穿整个文档，查找该name的frame 对象<..实在找不到咋整昂。>
		findFrameByName : function(name){
			var w = win.top.document;
			//向下查找
			var num = 0;
			if(!$){
				error('jquery未引入');
				return;
			}
			var $iframes = $(w).find('iframe');
			var result = byy.findFrameByNameOfArr($iframes,name,0);
			return result;
		},
		frameLevel : 5,//frame 层级
		findFrameByNameOfArr : function(arr,name,num){
			num++;
			if(num == byy.frameLevel){
				return null;
			}
			var result = null;
			for(var i=0;i<arr.length;i++){
				var temp = arr[i];
				if($(temp).attr('name') == name){
					result =  $(temp);
					break;
				}else{
					var tempArr = $(temp).find('iframe');
					if(tempArr.length>0){
						result = byy.findFrameByNameOfArr(tempArr,name,num);
						if(result == null){
							continue;
						}else{
							break;
						}
					}else{
						continue;
					}
				}
			}
			return result;
		},
		//从顶级窗口开始查找frame,进行刷新reload,如果没有传递sel，则刷新第一个frame
		refreshFrame : function(frameName){
			var tempFrame = null;
			if(frameName){
				tempFrame = byy.findFrameByName(frameName);
			}else{
				tempFrame = $(top.window.document).find('iframe');
			}
			if(null != tempFrame){
				//刷新替换为location.reload，这样，在已经存在条件的页面则可以不丢失条件刷新。
				if(tempFrame[0]){
					tempFrame[0].contentWindow.location.reload();
				}
				//tempFrame.attr('src',tempFrame.attr('src'));
			}else{
				error('刷新失败，没有查找到该frame对象，请检查name是否正确');
			}
		}
	});


	/**其他工具类函数**/
	byy.extend({
		/**
		 * 获得视口的宽度和高度
		 ***/
		getPageWH : function(){
			var pageWidth=win.innerWidth,pageHeight=win.innerHeight;
			if ( typeof pageWidth !="number"){
				if ( doc.compatMode== "CSSICompat"){
					pageWidth=doc.documentElement.clientWidth;
					pageHeight=doc.documentElement.clientHeight;
				} else{
					pageWidth=doc.body.clientWidth;
					pageHeight=doc.body.clientHeight;
				}
			}
			return {
				width : pageWidth,
				height : pageHeight
			};
		},
		/***
		 * 得到obj对象中属性的个数
		 * @param obj
		 */
		getObjectLength : function(obj){
			var len = 0;
			for(var p in obj){
				if(obj.hasOwnProperty(p)){
					len++;
				}
			}
			return len;
		},
		/**
		 * 全屏处理
		 **/
		fullScreen : function(){
			var docElm = doc.documentElement;
	        //W3C  
	        if (docElm.requestFullscreen) {
	            docElm.requestFullscreen();
	        }
	        //FireFox  
	        else if (docElm.mozRequestFullScreen) {
	            docElm.mozRequestFullScreen();
	        }
	        //Chrome等  
	        else if (docElm.webkitRequestFullScreen) {
	            docElm.webkitRequestFullScreen();
	        }
	        //IE11
	        else if (elem.msRequestFullscreen) {
	            elem.msRequestFullscreen();
	        }
		},
		/****
 		 * 注册命名控件，用于多frame查找
		 ***/
		 registerNameSpace : function( name , obj ){
		 	byynsc[name] = obj;
		 },
		 /**
		  * 获得对应空间的对象
		  **/
		 getSpace : function( name ){
		 	return byynsc[name];
		 },
		 /**
		  *函数节流 debounce
		  **/
		 throttle : function( fn , delay , immediate, debounce){
		 	var curr = +new Date(),//当前事件
		       last_call = 0,
		       last_exec = 0,
		       timer = null,
		       diff, //时间差
		       context,//上下文
		       args,
		       exec = function () {
		           last_exec = curr;
		           fn.apply(context, args);
		       };
		   return function () {
		       curr= +new Date();
		       context = this,
		       args = arguments,
		       diff = curr - (debounce ? last_call : last_exec) - delay;
		       clearTimeout(timer);
		       if (debounce) {
		           if (immediate) {
		               timer = setTimeout(exec, delay);
		           } else if (diff >= 0) {
		               exec();
		           }
		       } else {
		           if (diff >= 0) {
		               exec();
		           } else if (immediate) {
		               timer = setTimeout(exec, -diff);
		           }
		       }
		       last_call = curr;
		   }
		 },
		 debounce : function( fn , delay , immediate){
		 	return byy.throttle(fn , delay, immediate , true);
		 }
	});


	/** 代码修饰器 **/
	byy.fn.extend({
		code : function( opts ){
			var elems = [];
		    var options = opts || {};
		    options.elem = this.$ele || $('.byy-code');
		    
		    options.elem.each(function(){
		      elems.push(this);
		    });
		    elems.reverse().forEach(function( item , index ){
				var othis = $(item), html = othis.html();

				//转义HTML标签
				if(othis.attr('encode') || byy.isNull(options.encode) || options.encode == true ){
					html = html.replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;')
				}

				othis.html('<ol class="byy-code-ol"><li>' + html.replace(/[\r\n]+/g, '</li><li>').replace(/[\t]/g,'    ') + '</li></ol>')

				if(!othis.find('>.byy-code-h3')[0]){
					othis.prepend('<h3 class="byy-code-h3">'+ (othis.attr('title') || options.title ||'code')+ '</h3>');
				}

				var ol = othis.find('>.byy-code-ol');
				othis.addClass('byy-box byy-code-view');

				//识别皮肤
				if(othis.attr('skin') || options.skin){
					othis.addClass('byy-code-' +(othis.attr('skin') || options.skin));
				}

				//按行数适配左边距
				if((ol.find('li').length/100|0) > 0){
					ol.css('margin-left', (ol.find('li').length/100|0) + 'px');
				}

				//设置最大高度
				if( options.height){
					ol.css('max-height',  options.height);
				}
		    });
		}
	});


	var rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
		rsubmittable = /^(?:input|select|textarea|keygen)/i,
		rCRLF = /\r?\n/g,
		rcheckableType = (/^(?:checkbox|radio)$/i);
	/**表单序列化**/
	byy.fn.extend({
		getValues : function(){
			var tempArr =  $(this.selector).find('input,select,textarea,keygen')
			.map(function(){
				return $(this).get(0);
			})
			.filter(function(){
				var type = this.type;
				return (this.name && !$(this).is(':disabled') && rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) ) )|| ( ( $(this).hasClass('byy-select-extend') && $(this).attr('select-disabled') !== 'true') );
			})
			.map(function( i , elem ){
				var val;
				if($(this).hasClass('byy-select-extend')){
					val = $(this).data('value');
				}else{
					val = jQuery( this ).val();
				}
				return val == null ?
					null :
					jQuery.isArray( val ) ?
						jQuery.map( val, function( val ) {
							return { name: elem.name, value: val.replace( rCRLF, "\n" ) };
						}) :
						{ name: elem.name, value: val.replace( rCRLF, "\n" ) };
			})
			.get();
			//合并处理
			var obj = {};
			tempArr.forEach(function(ele){
				var name = ele.name,value = ele.value;
				if(name in obj){
					obj[name] = byy.isArray(obj[name]) ? obj[name].push(value) && obj[name] : [obj[name],value];
				}else{
					obj[name] = value;
				}
			});
			return obj;
		},
		setValues : function( obj ){
			if(byy.isEmptyObject( obj )){
				return;
			}
			var thiz = this;
			var map = {};
			thiz.$ele.find('[name]').each(function(){
				var name = $(this).attr('name');
				if(name.indexOf('.') > -1){
					//递归获得
					var names = name.split('.');
					//循环判断
					var getByName = function(obj,names){
						var n = names.splice(0,1)[0];
						if(obj[n] && names.length > 0){
							return getByName(obj[n],names);
						}else{
							if(obj[n]){
								return obj[n];
							}else{
								return "";
							}
							//如果不存在，要怎么处理？
							return "";
						}
					}
					var getVal = getByName(obj,names); 
					map[name] = getVal;
				}else{
					if( !byy.isNull(obj[name]) ){
						map[name] = obj[name];//直接赋值，如果有多个如何处理
					}
				}
			});
			//开始赋值
			for(var name in map){
				//1. 判断当前所属name的nodeType ,如果属于radio checkbox 则进行选中，如果属于text file hidden 则直接赋值，如果是
				var $target = thiz.$ele.find('[name="'+name+'"]');
				var eleshow = $target.css('display') === 'none' ? true : false,formatter = $target.attr('formatter') || '',ff = formatter == '' ? function(v){return v;} : eval('('+formatter+')');
				eleshow ? $target.show() : '';
				var val = map[name];
				if($target.length > 0){
					$target.each(function(){
						var $targetThis = $(this),targetThis = $targetThis[0],nodeType = targetThis.type,nodeName = targetThis.nodeName;
						//1.判断是不是check radio
						if(rcheckableType.test(nodeType)){
							//获得当前的值，判断是否在val中存在
							var targetVal = $targetThis.attr('value') || '';
							var valArr = byy.isArray(val) ? val : (val+'').split(',');//以逗号分割
							if(byy.contains(valArr,targetVal) && targetVal != ''){
								$targetThis.prop('checked',true);
							}else{
								$targetThis.prop('checked',false);
							}
						}else if(rsubmittable.test(nodeName)){
							$targetThis.val(typeof val == 'string' ? ff(val) : val);
						}else{
							$targetThis.html(typeof val == 'string' ? ff(val) : val);
						}
					});
				}
				eleshow ? $target.hide() : '';
			}
			//赋值结束后，如果需要渲染，则重新渲染
			if(thiz.$ele.find('.byy-form-select').length > 0){
				byy(thiz.$ele.find('select.byy-form-select')).select();
			}
			if(thiz.$ele.find('.byy-form-radio').length > 0){
				byy(thiz.$ele.find('.byy-form-radio')).radio();
			}
			if(thiz.$ele.find('.byy-form-checkbox').length > 0){
				byy(thiz.$ele.find('.byy-form-checkbox')).checkbox();
			}
		},
		/*重置表单内的所有的input/select/textarea/keygen/radio/hidden;等表单元素*/
		reset : function( obj ){//可以填写默认数据，类似setValues
			if(byy.isNull( obj )){
				obj = {};
			}
			var thiz = this;
			var map = {};
			thiz.$ele.find('[name]').each(function(){
				var name = $(this).attr('name');
				if(name.indexOf('.') > -1){
					//递归获得
					var names = name.split('.');
					//循环判断
					var getByName = function(obj,names){
						var n = names.splice(0,1)[0];
						if(obj[n] && names.length > 0){
							return getByName(obj[n],names);
						}else{
							if(obj[n]){
								return obj[n];
							}else{
								return "";
							}
							//如果不存在，要怎么处理？
							return "";
						}
					}
					var getVal = getByName(obj,names); 
					map[name] = getVal;
				}else{
					if( !byy.isNull(obj[name]) ){
						map[name] = obj[name];//直接赋值，如果有多个如何处理
					}else{
						map[name] = "";//如果不存在则为空
					}
				}
			});
			//开始赋值
			for(var name in map){
				//1. 判断当前所属name的nodeType ,如果属于radio checkbox 则进行选中，如果属于text file hidden 则直接赋值，如果是
				var $target = thiz.$ele.find('[name="'+name+'"]');
				var eleshow = $target.css('display') === 'none' ? true : false;
				eleshow ? $target.show() : '';
				var val = map[name];
				if($target.length > 1){
					var temp = $target[0];
					if(rcheckableType.test(temp.type)){
						//如果是复选框，判断val是不是数组，如果是数组则合并
						if(byy.isArray(val)){
							val = ','+val.join(',')+',';
						}else{
							val = ','+val+',';
						}
						$target.each(function(){
							if(val.indexOf(','+$(this).attr('value')+',') > -1 ){
								$(this).prop('checked',true);
							}else{
								$(this).prop('checked',false);
							}
						});
					}else{
						if(rsubmittable.test(temp.nodeName)){
							$target.val(val);
						}else{
							$target.attr('value',val);
						}
					}
				}else if($target.length == 1){
					//如果为div 或者span等需要显示的样式的话，用html
					if(rsubmittable.test($target.get(0).nodeName)){
						$target.val(val);
					}else{
						$target.html(val);
					}
				}else{//0 or hidden

				}
				eleshow ? $target.hide() : '';
			}
			//赋值结束后，如果需要渲染，则重新渲染
			if(thiz.$ele.find('.byy-form-select').length > 0){
				byy(thiz.$ele.find('select.byy-form-select')).select();
			}
			if(thiz.$ele.find('.byy-form-radio').length > 0){
				byy(thiz.$ele.find('.byy-form-radio')).radio();
			}
			if(thiz.$ele.find('.byy-form-checkbox').length > 0){
				byy(thiz.$ele.find('.byy-form-checkbox')).checkbox();
			}
		},
		/*切换三个样式，如果cls1 ,cls2,forceCls ,用法如下*/
		/**
		 * byy($ele).toggleChecked('check','checked') ,如果该元素有check ，则切换成checked,如果有 checked ，则切换成check
		 * byy($ele).toggleChecked('check','checked','forcechecked') ，则是将check 和 checked 都换成 forcechecked
		 */
		toggleChecked : function(cls1,cls2,forceCls){
			var $ele = this.$ele;
			var cls = ($ele.attr('class') || '' ).split(' ');
			var newcls = cls.map(function(temp){
				if(temp == cls1){
					return forceCls || cls2;
				}else if(temp == cls2){
					return forceCls || cls1;
				}else{
					return temp;
				}
			});
			$ele.attr('class',newcls.join(' '));
		},
		//获得同级的index
		getIndex : function(){
			var $ele = this.$ele;
			var index = 0;
			while($ele.prev().length > 0){
				$ele = $ele.prev();
				index ++;
			}
			return index;
		}
	});


	/** 选项卡/标签页**/
	byy.fn.extend({
		/*
		 * 增加监听事件
		 **/
		tabEvent : function(){
			var $ele = this.$ele;
			//切换tab
			$ele.on('click','.byy-tab-title>li',function(){
				var $this = $(this),isthis = $this.hasClass('.byy-tab-this'),$tab = $this.parent().parent();
				if(!isthis){//根据index 调整
					$this.parent().find('.byy-tab-this').removeClass('byy-tab-this');
					$this.addClass('byy-tab-this');
					var $content = $tab.find('.byy-tab-content');
					$content.find('.show.byy-tab-item').removeClass('show');
					$content.find('.byy-tab-item:eq('+$this.index()+')').addClass('show');
					
				}
			});
			//关闭tab
			// $ele.on('click','.byy-tab-close',function(){
			// 	var $this = $(this),$li = $this.parent(),index = $li.index(),$tab = $li.parent().parent(),$content = $tab.find('.byy-tab-content');
			// 	$li.remove();
			// 	$content.find('.byy-tab-item:eq('+index+')').remove();
			// });
		},
		tab : function( opts ){
			var thiz = this;
			var cfg = {
				skin : '',//card brief
				max : 1000,
				notitle : false,//默认显示顶部标题
				async : false,//frame 异步加载
				contents : [
					{
						title : 'demo',
						content : 'demo content'
					}
				]
			};
			cfg = byy.extend( cfg , opts) ;
			var skin = (cfg.skin == '' ? 'byy-tab' : ( cfg.skin == 'brief' ? 'byy-tab byy-tab-brief' : 'byy-tab byy-tab-card') ) + ( cfg.notitle === true ? ' notitle ' : '');
			var height = 'height' in cfg ? cfg.height : '';
			var $target = thiz.$ele,selector = thiz.selector;
			//将max存放在选择器元素上。
			$target.data('obj',cfg);
			(function( target ){
				target.html('').append('<div class="'+skin+'" style="'+(height == '' ? '' : 'height:'+height+'px;')+'"><ul class="byy-tab-title"></ul><div class="byy-tab-content" style="'+(height =='' ? '' : 'height:'+(height-40)+'px;')+'"></div></div>');

				cfg.contents.forEach(function( ele ,index ){
					ele.index = index;
					byy(selector).addTab( ele );
					if(cfg.onadd){
						cfg.onadd( ele );
					}
				});
				//查看是否有显示的
				if(target.find('.byy-tab-content>.byy-tab-item.show').length == 0 || target.find('.byy-tab-this').length == 0){
					//没有显示则将第一个设置为显示	
					target.find('.byy-tab-title>li:first').addClass('byy-tab-this');
					target.find('.byy-tab-content>.byy-tab-item:first').addClass('show');
				}
				//监听事件
				$(selector).off('click','.byy-tab-title>li').on('click','.byy-tab-title>li',function(){
					var $tg = $(this);
					var temp = $tg.data('obj');
					if( $tg.hasClass('.byy-tab-this')){
						//不处理
					}else{
						byy(selector).toggleTab(temp.index);
					}
					//调用回调函数
					if(cfg.onClick){
						cfg.onclick( temp );
					}
				});
				$(selector).off('click','.byy-tab-close').on('click','.byy-tab-close',function(ev){
					var temp = $(this).parent().data('obj'),index = temp.index;
					byy(selector).deleteTab(index);
					byy.stope(ev);
					byy(selector).fixTabIndex();
					if(opts.onClose){
						var rs = byy(selector).getNowTab();
						opts.onclose( rs );	
					}
				});
				thiz.hideTabMore(true);
				thiz.tabAuto();
				return thiz;
			})($target);
		},
		//隐藏更多Tab
		hideTabMore: function(e){
			var tsbTitle = $('.byy-tab-title');
			if(e === true || $(e.target).attr('byy-stope') !== 'tabmore'){
				tsbTitle.removeClass('byy-tab-more');
				tsbTitle.find('.byy-tab-bar').attr('title','');
			}
		},
		//Tab自适应
		tabAuto: function(){
			var SCROLL = 'byy-tab-scroll', MORE = 'byy-tab-more', BAR = 'byy-tab-bar'
			,CLOSE = 'byy-tab-close', that = this;

			$('.byy-tab').each(function(){
				var othis = $(this)
					,title = othis.children('.byy-tab-title')
					,item = othis.children('.byy-tab-content').children('.byy-tab-item')
					,STOPE = 'byy-stope="tabmore"'
					,span = $('<span class="byy-unselect byy-tab-bar" '+ STOPE +'><i '+ STOPE +' class="byyicon icon-arrow-down"></i></span>');

				if(that === window && device.ie != 8){
					thiz.hideTabMore(true)
				}

				//允许关闭
				if(othis.attr('byy-allowClose')){
					title.find('li').each(function(){
					var li = $(this);
					if(!li.find('.'+CLOSE)[0]){
						var close = $('<i class="byyicon icon-close byy-unselect '+ CLOSE +'"></i>');
						close.on('click', call.tabDelete);
						li.append(close);
					}
					});
				}

				//响应式
				if(title.prop('scrollWidth') > title.outerWidth()+1){
					if(title.find('.'+BAR)[0]) return;
					title.append(span);
					othis.attr('overflow', '');
					span.on('click', function(e){
					title[this.title ? 'removeClass' : 'addClass'](MORE);
					this.title = this.title ? '' : '收缩';
					});
				} else {
					title.find('.'+BAR).remove();
					othis.removeAttr('overflow');
				}
			});
		},
		getNowTab : function(){
			var $target = this.$ele;
			var rs = $target.find('.byy-tab-this').data('obj') || {};
			return rs;
		},
		addTab : function( object, index ){
			//查找ul和content
			var thiz = this;
			var $container = this.$ele,cfg = $container.data('obj'),max = cfg.max || 10,notitle = cfg.notitle,async = cfg.async,selector = this.selector;
			var $title = $container.find('.byy-tab-title'),$content = $container.find('.byy-tab-content');
			//检查是否已经存在该tab页面（从title上进行监测）
			var nowtitle = object.title || '标题';
			var existsTab = false,existsTabIndex = 0;
			$title.find('li').each(function(){
				var tempObj = $(this).data('obj');
				if( (tempObj.title || '标题') == nowtitle){
					existsTab = true;
					existsTabIndex = tempObj.index;
				}
			});
			if(existsTab){
				byy(selector).toggleTab(existsTabIndex);
				return this;
			}
			var close = 'close' in object ? ( object.close === true ? true : false) : false;
			var li = $('<li></li');
			object.async = async;//设置everybody
			li.html(nowtitle);
			if(close){
				li.append('<i class="byyicon byy-unselect icon-close byy-tab-close"></i>');
			}
			//判断index 范围
			var hasIndex = false,nl = $title.find('li').length;
			if(!byy.isNull(index) && byy.isNumeric(index)){
				
				if(index > nl || index < 0 || index == nl) {
					index = nl;
					object.index = index;//直接插入
				}else {
					//修改后续的所有li
					hasIndex = true;
					object.index = index;
				}
			}
			if(byy.isNull(object.index)){
				object.index = nl;
			}
			li.data('obj',object);
			var content = '';
			if(object.url && object.url != ''){
				var iframe = '<iframe src="'+( !async ? object.url : '')+'" style="border:none;width:100%;height:100%;" ></iframe>';
				content = '<div class="byy-tab-item">'+(iframe)+'</div>';
			}else{
				content = '<div class="byy-tab-item">'+(object.content)+'</div>';	
			}
			if(hasIndex){
				$title.find('li:eq('+index+')').before(li);
				$content.find('.byy-tab-item:eq('+index+')').before(content);
			}else{
				$title.append(li),$content.append(content);	
			}
			byy(selector).fixTabIndex();
			//如果当前的长度已经大于max了
			if(nl > max-1 ){
				byy(selector).deleteTab(0);
			}
			//插入后如果当前没有显示的tab，则显示最后一个
			if($container.find('.byy-tab-this').length == 0){
				byy(selector).toggleTab($container.find('li').length -1 );
			}
			byy(selector).toggleTab(object.index);//跳转到第一个
			thiz.hideTabMore(true);
			thiz.tabAuto();
			return this;
		},
		fixTabIndex : function( ){
			var $othli = this.$ele.find('li');
			$othli.each(function(i,ele){
				var to = $(this).data('obj');
				to.index = i;
				$(this).data('obj',to);
			});
			return this;
		},
		deleteTab : function( index ){
			//删除某tab
			var $t = this.$ele,selector = this.selector;
			$t.find('.byy-tab-title').find('li:eq('+index+')').remove();
			$t.find('.byy-tab-content').find('.byy-tab-item:eq('+index+')').remove();
			//删除后调整index
			//关闭后跳转
			if($t.find('.byy-tab-this').length == 0 && $t.find('li').length > 0){
				byy(selector).toggleTab(index== 0 ? 0 : (index -1));
			}
			byy(selector).fixTabIndex();
			return this;
		},
		toggleTab : function( index ){
			//切换tab标签
			var $s = this.$ele;
			$s.find('.byy-tab-this').removeClass('byy-tab-this');
			$s.find('.show').removeClass('show');
			var $li = $s.find('.byy-tab-title>li:eq('+index+')'), obj = $li.data('obj'),async = obj.async,url = obj.url,hasload = obj.hasload ? true : false;
			$li.addClass('byy-tab-this');
			var $c = $s.find('.byy-tab-content>div:eq('+(index)+')');
			$c.addClass('show');
			if(!hasload && $c.find('iframe').length > 0){
				$c.find('iframe').attr('src',url);
				obj.hasload = true;
				$li.data('obj',obj);
			}
			return this;
		}
	});
	
	/*中间增加国际化临时处理，获得数据*/
	byy.extend({
		//如果没有则返回null
		getLocal : function( key ){
			if(byy && byy.i18n && byy.i18n.map && byy.i18n.map[key]){
				return byy.i18n.map[key];
			}
			return null;
		},
		//渲染某容器内的国际化处理
		renderLocal : function( selector, cb ){
			//渲染某容器内的国际化处理
			//ie6-ie8
			if(byy.device().ie < 9 ){
				document.createElement('langbyy');
			}
			$(selector).find("["+localizeName+"],["+localizeTitle+"]").each(function() {
                var elem = $(this),
                    localizedValue = $.i18n.map[elem.data(dataLocalizeName)] || '',
                    localizedTitle = $.i18n.map[elem.data(dataLocalizeTitle)] || '',
                    localizeStr = elem.data("format") == null || elem.data("format") == undefined ? "" : elem.data("format")+"";
                var arr = (''+localizeStr).split(',');
                localizedValue = localizedValue.replace(/\{(\d+)\}/g,function(s,i){
					return arr[i] || '';
				});
                //根据值进行分割然后调用
                if (elem.is("input[type=text]") || elem.is("input[type=password]") || elem.is("input[type=email]") || elem.is('textarea') || elem.is('select')) {
                    if(localizedValue != ''){
                    	elem.attr("placeholder", localizedValue);
                    }
                    if(localizedTitle != ''){
                    	elem.attr('title',localizedTitle);
                    }
                } else if (elem.is("input[type=button]") || elem.is("input[type=submit]")) {
                	if(localizedValue != ''){
                		elem.attr("value", localizedValue);
                	}
                    if(localizedTitle != ''){
                    	elem.attr('title',localizedTitle);
                    }
                    
                } else {
                	if(localizedValue != ''){
                		//hack ie8
                		if(elem[0].nodeName == 'LANGBYY' && byy.device().ie < 9 ){
                			elem.after('<langbyy>'+localizedValue+'</langbyy>');
                			elem.remove();
                		}else{
                			elem.text(localizedValue);	
                		}
                	}
                    if(localizedTitle != ''){
                    	elem.attr('title',localizedTitle);
                    }
                }
            });
            if(cb)cb();
		}
	});

	/** radio 组件**/
	byy.fn.extend({

		/**
		 * 给radio 赋值，或者从radio 拿值
		 **/
		radioVal : function(){
			//arguments 存在则为赋值
			if(arguments.length > 0){
				//1.赋值，2.渲染，
				var radioValue = [].slice.call(arguments)[0],$radio = this.$ele;
				$radio.each(function(){
					$(this).val() != radioValue ? ($(this).prop('checked',false)) : ($(this).prop('checked',true));
				});
				byy($radio).radio();
				return;
			}else{
				//获取值，根据name的不同，分别返回不同的数据
				var $radio = this.$ele;
				var valmap = {};
				$radio.each(function(){
					var $ele = $(this);
					if($ele.prop('checked') && !!$ele.attr('name')){
						var radioName = $ele.attr('name'),radioValue = $ele.attr('value');
						if(radioName in valmap){
							valmap[radioName] instanceof Array ? ( valmap[radioName].push(radioValue) ) : ( valmap[radioName] = [valmap[radioName],radioValue]);
						}else{
							valmap[radioName] = radioValue;
						}
					}
				});
				//根据个数返回不同值
				if(byy.getObjectLength(valmap) == 1){
					var rs;
					for(var key in valmap){
						rs = valmap[key];
					}	
					return rs;
				}else if(byy.getObjectLength(valmap) == 0){
					return null;
				}
				return valmap;
			}
		},
		/**
   		 * 将radio进行渲染模拟实现
		 **/
		radio : function(){
	        var CLASS = 'byy-form-radio', ICON = ['icon-radio', 'icon-radio-checked'],
	        radios = this.$ele
	        
	        ,events = function(reElem){
	          var radio = $(this), ANIM = 'byy-anim-scaleSpring';
	          
	          reElem.on('click', function(){
	            var name = radio[0].name, forms = radio.parents();
	            // var filter = radio.attr('lay-filter'); //获取过滤器
	            var sameRadio = forms.find('input[name="'+ name.replace(/(\.|#|\[|\])/g, '\\$1') +'"]'); //找到相同name的兄弟
	            if(radio[0].disabled) return;
	            
	            $.each(sameRadio, function(){
	              var next = $(this).next('.'+CLASS);
	              this.checked = false;
	              next.removeClass(CLASS+'ed');
	              next.find('.byyicon').removeClass(ANIM).removeClass(ICON[1]).addClass(ICON[0])
	            });
	            
	            radio[0].checked = true;
	            reElem.addClass(CLASS+'ed');
	            reElem.find('.byyicon').addClass(ANIM).removeClass(ICON[0]).addClass(ICON[1]);
	            
	            radio.triggerHandler('click');
	          });
	        };
	        
	        radios.each(function(index, radio){
	        	var othis = $(this), hasRender = othis.next('.' + CLASS), disabled = this.disabled;
	        	var localizeValue = othis.attr(localizeName) || '',//key
	        		title =  byy.getLocal(localizeValue) || (radio.title || byy.lang.radio.title);
				//替代元素
				var reElem = $(['<div class="byy-unselect '+ CLASS + (radio.checked ? (' '+CLASS+'ed') : '') + (disabled ? ' byy-radio-disbaled ' : '') +'">'
				,'<i class="byy-anim byyicon '+(ICON[radio.checked ? 1 : 0])+' "></i>'
				,'<span '+($(radio).attr(localizeName) ? ''+localizeName+'="'+$(radio).attr(localizeName)+'"' : '')+'>'+ (title) +'</span>'
				,'</div>'].join(''));

				hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
				othis.after(reElem);
				events.call(this, reElem);
	        });
		},
		/***
 		 * 向checkbox 赋值，或者从checkbox 拿值
		 ***/
		checkboxVal : function(){
			//arguments存在则为赋值
			if(arguments.length > 0){
				//可能存在的形式: 0-逗号隔开 ；1-多个参数；2-数组
				var $checkbox = this.$ele,valueArr = [].slice.call(arguments);
				//对arguments 处理
				var setValue = [];
				$.each(valueArr,function( index,ele ){
					if(typeof ele =='string'){
						var tempArr = ele.split(',');
						setValue = setValue.concat(tempArr);
					}else if(byy.isArray(ele)){
						setValue = setValue.concat(ele);
					}
				});
				$checkbox.each(function(){
					var checkValue = $(this).val();
					var check = false;
					for(var i=0;i<setValue.length;i++){
						var tempValue= setValue[i];
						if(checkValue == tempValue || checkValue == tempValue.toString()){//关于true或 false
							check = true;
							break;
						}
					}
					$(this).prop('checked',check);
				});
				byy($checkbox).checkbox();
				return;
			}else{
				//获得值
				var $checkbox = this.$ele,valmap ={};
				$checkbox.each(function(){
					var item = $(this),flag = item.prop('checked'),name = item.attr('name'),value = item.attr('value');
					if(flag && !!name){
						if(name in valmap){
							valmap[name] instanceof Array ? (valmap[name].push(value)) : (valmap[name] = [valmap[name],value]);
						}else{
							valmap[name] = value;
						}
					}
				});
				if(byy.getObjectLength(valmap) == 0){
					return null;
				}else if(byy.getObjectLength(valmap) == 1){
					var rs;
					for(var key in valmap){
						rs = valmap[key];
					}
					return  rs;
				}
				return valmap;
			}
		},
		//将checkbox 进行渲染，模拟实现
		checkbox : function(){
	        var CLASS = {
	          checkbox: ['byy-form-checkbox', 'byy-form-checked', 'checkbox']
	          ,_switch: ['byy-form-switch', 'byy-form-onswitch', 'switch']
	          ,_primary : ['byy-form-checkbox-primary','byy-form-checked','primary','icon-checkbox','icon-checkbox-checked']
	        }
	        ,checks = this.$ele
	        
	        ,events = function(reElem, RE_CLASS){
	          var check = $(this);
	          
	          //勾选
	          reElem.on('click', function(){
	            // var filter = check.attr('lay-filter'); //获取过滤器

	            if(check[0].disabled) return;
	            var hasChecked = check.prop('checked');
	            if(hasChecked){
	            	check.prop('checked',false);
	            	reElem.removeClass(RE_CLASS[1]);
	            	if(reElem.hasClass(RE_CLASS[0])){
		            	reElem.find('.byyicon').removeClass(RE_CLASS[4]).addClass(RE_CLASS[3]);
		            }
	            }else{
	            	check.prop('checked',true);
	            	reElem.addClass(RE_CLASS[1]);	
	            	if(reElem.hasClass(RE_CLASS[0])){
		            	reElem.find('.byyicon').removeClass(RE_CLASS[3]).addClass(RE_CLASS[4]);
		            }
	            }
	            check.triggerHandler('click');
	          });
	        }
	        
	        checks.each(function(index, check){
	          var othis = $(this), skin = othis.attr('byy-skin'), disabled = this.disabled;
	          var localizeValue = othis.attr(localizeName) || '',
	          	  localSwitch = localizeValue.indexOf(',') > -1,
	          	  localizeArr = localizeValue.split(','),

	          	  switch_before = byy.getLocal(localizeArr[0]) || (othis.attr('byy-before') || byy.lang.checkbox.before),
	          	  switch_after = localSwitch ? (byy.getLocal(localizeArr[localizeArr.length-1]) || (othis.attr('byy-after') || byy.lang.checkbox.after)) : (othis.attr('byy-after') || byy.lang.checkbox.after),
	          	  check_title = byy.getLocal(localizeArr[0]) || (othis.attr('title') || byy.lang.checkbox.title);
	          //增加国际化处理
	          if(skin === 'switch') skin = '_'+skin;
	          if(skin === 'primary') skin = '_'+skin;
	          var RE_CLASS = CLASS[skin] || CLASS.checkbox;
	          
	          //替代元素
	          var hasRender = othis.next('.' + RE_CLASS[0]);
	          var reElem = $(['<div class="byy-unselect '+ RE_CLASS[0] + (
	            check.checked ? (' '+RE_CLASS[1]) : '') + (disabled ? ' byy-checkbox-disbaled ' : '') +'">'
	          ,{
	            _switch: '<span class="first" '+(localizeArr[0] != '' ? (localizeName+'="'+localizeArr[0]+'"') : '')+'>'+switch_before+'</span><i></i><span class="last" '+(localizeArr.length > 1 && localizeArr[1] != '' ? (localizeName+'="'+localizeArr[1]+'"') : '')+'>'+switch_after+'</span>',
	            _primary : '<span '+(localizeArr[0] != '' ? (localizeName+'="'+localizeArr[0]+'"') : '')+'>'+check_title+'</span><i class="byyicon '+(RE_CLASS[check.checked ? 4 : 3])+'"></i>'
	          }[skin] || ('<span '+(localizeArr[0] != '' ? (localizeName+'="'+localizeArr[0]+'"') : '')+'>'+ (check_title) +'</span><i class="byyicon icon-correct"></i>')
	          ,'</div>'].join(''));

	          hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
	          othis.after(reElem);
	          events.call(this, reElem, RE_CLASS);
	        });
      	},
      	/***
		 * 向 select 进行赋值，或者从 select 拿值
      	 ***/
      	selectVal : function(){
      		//如果arguments 存在，则为赋值
      		var args = [].slice.call(arguments);
      		var $select = this.$ele;
      		if(args.length > 0){
      			//考虑多选或者单选
      			var valueArr = [];
      			for(var i=0;i<args.length; i++){
      				var temp = args[i];
      				if(temp == '')continue;
      				if((typeof temp == 'string' && temp.indexOf(',') < 0 )|| typeof temp== 'number'){
      					valueArr.push(temp.toString());
      				}else if(typeof temp == 'string' && temp.indexOf(',') > -1){
      					valueArr = valueArr.concat(temp.split(','));
      				}else if(byy.isArray(temp)){
      					valueArr = valueArr.concat(temp);
      				}
      			}
      			$select.each(function(){
      				var $tempSelect = $(this),tempSelect = $tempSelect[0],multi = $tempSelect.attr('multi') ? true : false,size = parseInt($tempSelect.attr('size') || '0'),options = tempSelect.options;
      				//如果是多选，则多选控制个数，如果是单选则第一个
      				var hasSelectCount = 0;
      				$.each(options,function(index,item){
      					var selected = false,value = item.value,disabled = item.disabled;
      					if(disabled){return true;}
      					for(var i=0;i<valueArr.length;i++){
      						if(value === valueArr[i]){
      							selected = true;
      							break;
      						}
      					}
      					if( size> 0 && hasSelectCount >= size){
      						return true;
      					}
      					item.selected = selected;
      					selected && hasSelectCount ++;

      				});
      			});
      			byy($select).select();
      			return;
      		}else{
      			return $select.val();
      		}
      	},
      	//将select 进行渲染，模拟实现
      	select : function(){
	      	var TIPS = byy.lang.select.tip || '请选择', CLASS = 'byy-form-select', TITLE = 'byy-select-title'
	        
	        ,selects = this.$ele, hide = function(e, clear){
	          var $nowselect = $(e.target).parents('.byy-form-select');
	          var nowmulti = $nowselect.attr('multiple') ? true : false;
	          if(nowmulti){
				if((!$(e.target).parent().parent().parent().hasClass('byy-form-select') && !$(e.target).parent().parent().hasClass('byy-form-select') && !$(e.target).parent().hasClass('byy-form-select') && !$(e.target).parent().hasClass(TITLE) )|| clear){
					$('.'+CLASS).removeClass(CLASS+'ed');
				}
	          }else{
	          	if( !$(e.target).parent().hasClass(TITLE) || clear){
		            $('.'+CLASS).removeClass(CLASS+'ed');
		        }
	          }
	        }
	        
	        ,events = function(reElem, disabled){
	          var select = $(this), title = reElem.find('.' + TITLE),multi = select.attr('multiple') ? true : false,size = parseInt((select.attr('size') || '0'),10);
	          
	          if(disabled) return;
	          //edited by lixun on 2017年3月13日 16:38:31，增加可以输入的情景
	          var canInput = select.attr('canInput') ? true : false;
	          if(canInput){
	          	var inputEle = reElem.find('input');
	          	inputEle.on('keyup',function(e){
	          		var val = $(this).val();//对底部的LI进行过滤
	          		var dds = reElem.find('dd');
	          		if(byy.trim(val) == ''){
	          			//全部显示
	          			dds.show();
	          		}else{
	          			var showCount = 0;
	          			dds.each(function(index,ele){
	          				if($(this).html().toLowerCase().indexOf(val.toLowerCase()) > -1){
	          					showCount ++ ;
	          					$(this).show();
	          				}else{
	          					$(this).hide();
	          				}
	          			});
	          			if(showCount < 1){
	          				reElem.find('dl').find('.empty').remove();
	          				reElem.find('dl').prepend('<p class="empty">'+(byy.lang.select.nosearch)+'</p>');
	          			}else{
	          				reElem.find('dl .empty').remove();
	          			}
	          		}
	          	});
	          }

	          //展开下拉
	          title.on('click', function(e){
	          	if(reElem.hasClass(CLASS+'ed')){
	          		reElem.removeClass(CLASS+'ed');
	          	}else{
	          		hide(e, true);
	          		reElem.addClass(CLASS+'ed');
	          		//判断是否能出入
	          		reElem.find('dl dd').each(function(){
	          			$(this).show();
	          		});
	          	}
	          }); 
	          
	          //选择
	          reElem.find('dl>dd').off('click').on('click', function(){
	            var othis = $(this), value = othis.attr('byy-value');
	            var filter = select.attr('byy-filter'); //获取过滤器

	            if(othis.hasClass('byy-disabled')) return false;
	            
	            if(!multi){
	            	select.val(value).removeClass('byy-form-danger'), title.find('input').val(othis.text());
	            	othis.addClass('byy-select-this').siblings().removeClass('byy-select-this');
	            }else{
	            	//复选,判断当前是否选中
	            	var nowValue = select.val();
	            	var nowValueArr = nowValue == null  ? [] : (typeof nowValue == 'string' ? nowValue.split(',') : nowValue);
	            	if(othis.hasClass('byy-select-this')){//取消
						othis.removeClass('byy-select-this');
						byy.remove(nowValueArr,value);
						othis.find('.byyicon').removeClass('icon-checkbox-checked').addClass('icon-checkbox');
						//取消判断是否有全选
						if(reElem.find('.select-all.checked').length > 0){
							reElem.find('.select-all.checked').removeClass('checked');
						}
						if(nowValueArr.length == 0){
							reElem.find('.select-all').find('i').removeClass('icon-checkbox-checked').addClass('icon-checkbox');
						}
	            	}else{//选中
	            		//校验选中数量
	            		if( size > 0 && nowValueArr.length+1 > size){
	            			//增加tips
	            			if(reElem.find('.maxlimit').length == 0){
	            				othis.after('<p class="maxlimit">'+(byy.formatStr(byy.lang.select.maxlimit,size))+'</p>');
	            				setTimeout(function(){
	            					reElem.find('.maxlimit').remove();
	            				},500);
	            			}
	            			return ;
	            		}
	            		othis.addClass('byy-select-this');	
	            		nowValueArr.push(value);
	            		othis.find('.byyicon').removeClass('icon-checkbox').addClass('icon-checkbox-checked');
	            		//判断是否全部选中
	            		var hasSelectAll = true;
	            		var sopts = select[0].options;
	            		for(var i=0;i<sopts.length;i++){
	            			var soptVal = sopts[i].value;
	            			if(byy.trim(soptVal) !='' && !byy.contains(nowValueArr,soptVal)){
	            				hasSelectAll = false;
	            				break;
	            			}
	            		}
	            		if(hasSelectAll){
	            			reElem.find('.select-all').removeClass('checked').addClass('checked');
	            			reElem.find('.byyicon').removeClass('icon-checkbox').addClass('icon-checkbox-checked');
	            		}
	            	}
	            	select.val(nowValueArr);
	            	//找到选中的值，然后赋值
	            	var txtArr = othis.parent().find('.byy-select-this').filter(function(){
	            		return $(this).attr('byy-value') == '' ? false : true;
	            	}).map(function(){
	            		return $(this).text();
	            	}).get();
	            	title.find('input').val(txtArr.join(',')).attr('title',txtArr.join(','));
	            }
	            // layui.event(MOD_NAME, 'select('+ filter +')', {
	            //   elem: select[0]
	            //   ,value: value
	            // });
	            select.triggerHandler('change');
	          });
	          reElem.find('.select-all').off('click').on('click',function(e){
	          	var $selectAll = $(this),hasAll = $selectAll.hasClass('checked');
	          	if(hasAll){//取消全部
	          		//手动置空
	          		var sopts = select[0].options;
	          		for(var i=0;i<sopts.length;i++){
	          			sopts[i].selected = false;
	          		}
	          		title.find('input').val('').attr('title','');
	          		reElem.find('dl dd.byy-select-this:not(.byy-disabled)').each(function(){
	          			$(this).removeClass('byy-select-this');
	          			$(this).find('i.icon-checkbox-checked').removeClass('icon-checkbox-checked').addClass('icon-checkbox');
	          		});
	          		$selectAll.removeClass('checked');
	          		$selectAll.find('i.icon-checkbox-checked').removeClass('icon-checkbox-checked').addClass('icon-checkbox');
	          	}else{//全部选中
	          		var valueArr = [],textArr = [];
	          		reElem.find('dl dd:not(.byy-disabled)').each(function(index,ele){
	          			if(size > 0 && index+1 > size){
	          				return ;
	          			}
	          			$(this).addClass('byy-select-this');
	          			var v = $(this).attr('byy-value'),txt = $(this).text();
	          			if(byy.trim(v) != ''){
	          				valueArr.push(v);
		          			textArr.push(txt);
		          			$(this).find('i.icon-checkbox').removeClass('icon-checkbox').addClass('icon-checkbox-checked');
	          			}
	          		});
	          		select.val(valueArr);
	          		title.find('input').val(textArr.join(',')).attr('title',textArr.join(','))
	          		$selectAll.addClass('checked');
	          		$selectAll.find('i.icon-checkbox').addClass('icon-checkbox-checked').removeClass('icon-checkbox');
	          	}
	          	//触发change
	          	select.triggerHandler('change');
	          });
	          reElem.find('dl>dt').off('click').on('click', function(e){
	            return false;
	          });
	          
	          //关闭下拉
	          $(document).off('click', hide).on('click', hide)
	        }
	        
	        selects.each(function(index, select){

	          var othis = $(this), hasRender = othis.next('.'+CLASS), disabled = othis.attr('disabled')  ? true : false,multi = othis.attr('multiple') ? true : false,placeholder=othis.attr('placeholder');
	          //获得选中的值和选中的文本
	          var valueArr = [],valueTxt = [];
	          for(var i=0;i<select.options.length;i++){
	          	var TempOpt = select.options[i],optSel = TempOpt.selected,optVal = TempOpt.value,optTxt = $(TempOpt).text();
	          	if(optSel){
	          		valueArr.push(optVal);
	          		valueTxt.push(optTxt);
	          	}
	          }
	          //对txt进行处理
	          valueTxt = valueTxt.join(',');
	          // var value = select.value, selected = $(select.options[select.selectedIndex]); //获取当前选中项
	          //edited by lixun on 2017年3月13日 16:35:24,增加可以输入的情景
	          var canInput = othis.attr('canInput') ? true : false;//true可以输入，false正常情况
	          //获得宽度
	          var cls = '';
	          if(othis.css('width')){
	          	//比对宽度和最小宽度，如果宽度设置小于最小宽度，按照最小宽度来设置
	          	var ew = othis.outerWidth();
	          	var minw = othis.css('min-width') || '0px';
	          	minw = parseInt(minw.replace('px',''),10);
	          	var finalWidth = ew > minw ? ew : minw;
	          	// ew = ew.indexOf('px') > -1 ? (parseInt(ew.replace('px',''),10)+10) : parseInt(ew,10)+10;
	          	cls = ' style="width:'+finalWidth+'px;" '
	          }
	          //替代元素
	          var reElem = $(['<div '+cls+' class="byy-unselect '+ CLASS + (disabled ? ' byy-select-disabled' : '') +(multi ? ' multi' : '')+'" '+(multi ? 'multiple="true"' : '')+'>'
	            ,'<div class="'+ TITLE +'"><input type="text" placeholder="'+ (placeholder != null && placeholder != undefined ? placeholder : (select.options.length > 0 && select.options[0].innerHTML ? select.options[0].innerHTML : TIPS)) +'" value="'+ (valueTxt || '') +'" '+( canInput ? '' : 'readonly')+' class="byy-input byy-form-input byy-unselect'+ (disabled ? (' byy-select-disabled') : '') +'">'
	            ,'<i class="byy-edge"></i></div>'
	            ,'<dl class="byy-anim byy-anim-upbit'+ (othis.find('optgroup')[0] ? ' byy-select-group' : '') +'">'+(multi ? '<p class="select-all"><i class="byyicon icon-checkbox"></i>'+(byy.lang.select.selectall)+'</p>' : '')+ function(options){
	              var arr = [];
	              $.each(options, function(index, item){
	                if(multi && index === 0 && !item.value) return;//将第一个为空的值忽略，显示出来。
	                if(item.tagName.toLowerCase() === 'optgroup'){
	                  arr.push('<dt '+($(item).attr(localizeName) ? ''+localizeName+'="'+$(item).attr(localizeName)+'"' : '')+'>'+ item.label +'</dt>'); 
	                } else {
	                	//edited by lixun on 2018年1月24日 17:20:28,处理下下拉选择项目的title,优先title,然后国际化
	                  var itemTitle = $(item).attr('title'),itemLocalizeTitle = $(item).attr(localizeTitle);
	                  arr.push('<dd  '+(itemTitle ? ' title="'+itemTitle+'" ' : '' )+(itemLocalizeTitle ? ' '+localizeTitle+'="'+itemLocalizeTitle+'" ' : '')+' byy-value="'+ item.value +'" class="'+ (byy.contains(valueArr,item.value) ?  'byy-select-this' : '') + (item.disabled ? (' byy-disabled') : '') +'">'+(multi ? '<i class="byyicon '+(byy.contains(valueArr,item.value) ? 'icon-checkbox-checked' : 'icon-checkbox')+'"></i>' : '')+'<span '+($(item).attr(localizeName) ? ''+localizeName+'="'+$(item).attr(localizeName)+'"' : '')+'>'+ ($(item).attr('icon') ? '<i class="'+$(item).attr('icon')+'"></i>': '') +item.innerHTML +'</span></dd>');
	                }
	              });
	              return arr.join('');
	            }(othis.find('*')) +'</dl>'
	          ,'</div>'].join(''));
	          
	          hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
	          othis.after(reElem);
	          events.call(this, reElem, disabled);
	        });
      	},

      	nav : function(){
      		var nav_ele = '.byy-nav',
      			nav_item = 'byy-nav-item',
      			nav_bar = 'byy-nav-bar',
      			mod_name = 'element',
      			nav_this = 'byy-this',
      			nav_show = 'show',
      			nav_tree = 'byy-nav-tree',
      			nav_child = 'byy-nav-child',
      			nav_more = 'byy-nav-more',
      			nav_anim = 'byy-anim byy-anim-upbit',
      			nav_mobile= 'byy-nav-mobile',
      			nav_side = 'byy-side',
      			nav_hide = 'hide',
      			nav_collapse = 'collapse',//收缩状态
      			device = byy.device(),
      			navevents = {
      				clickThis : function(){
	      				var othis = $(this), 
	      					parents = othis.parents(nav_ele);
						if(othis.find('.'+nav_child)[0]){ return;}
						parents.find('.'+nav_this).removeClass(nav_this);
						othis.addClass(nav_this);
	      			},
	      			clickChild : function(){
	      				var othis = $(this), 
	      					parents = othis.parents( nav_ele );
						parents.find('.'+nav_this).removeClass( nav_this );
						othis.addClass( nav_this );
	      			},
	      			showChild : function(){
	      				var othis = $(this), 
	      					parents = othis.parents( nav_ele );
						var parent = othis.parent(), 
							child = othis.siblings('.'+nav_child);
						if(parents.hasClass( nav_tree )){
							child.removeClass( nav_anim );
							parent[child.css('display') === 'none' ? 'addClass': 'removeClass'](nav_item+'ed');
						}
	      			}
      			},
      			time = 200,
      			timer,timerMore,timerEnd,
      			follow = function(bar , nav){
      				var othis = $(this),
      					child = othis.find('.'+ nav_child);
      				if( nav.hasClass( nav_tree )){
      					bar.css({
      						top : othis.position().top,
      						height : othis.children('a').height(),
      						opacity : 1
      					});
      				}else{
      					child.addClass( nav_anim );
      					bar.css({
      						left : othis.position().left + parseFloat( othis.css('marginLeft') ),
      						top : othis.position().top + othis.height() - 5
      					});
      					timer = setTimeout(function(){
      						bar.css({
      							width : othis.width(),
      							opacity : 1
      						});
      					}, device.ie && device.ie < 10 ? 0 : time );
      					clearTimeout( timerEnd );
      					if( child.css('display') === 'block' ){
      						clearTimeout( timerMore );
      					}
      					timerMore = setTimeout(function(){
      						child.addClass( nav_show );
      						othis.find('.'+ nav_more).addClass( nav_more+'d' );
      					}, 300);
      				}
      			},
      			showChild = function( nav ){
      				var $this = $(this);
      				if($this.parent().hasClass(nav_collapse)){
						var top = $this.offset().top;
	      				var $child = $this.children('.'+nav_child);
	      				if($child.length > 0){
	      					$child.css({
	      						top:top,
	      						display:'inline-block'
	      					})
	      				}
      				}
      			}
      		$( nav_ele).each(function(){
      			var othis = $(this),
      				bar = $('<span class="'+ nav_bar +'"></span>'),
      				itemElem = othis.find('.'+ nav_item );
      			//添加小屏展示
      			if(othis.parents('.'+nav_side).length > 0){
      				var $mobilespan = $('<span></span>').addClass(nav_mobile).append('<i class="byyicon icon-arrow-right"></i>');
      				othis.append($mobilespan);
      				$('body').append('<div class="mobile-modal"></div>');
      				$mobilespan.on('click',function(){
      					$('.'+nav_side).addClass('mobile-side');
      					// $('.'+nav_mobile).css('display','none !important');
      					$('.'+nav_mobile).hide();
      					$('.mobile-modal').addClass('show');
      				});
      				$('body').on('click','.mobile-modal',function(){
      					// $('.'+nav_mobile).css('display','block !important');
      					$('.'+nav_mobile).show();
      					$('.'+nav_side).removeClass('mobile-side');
      					$('.mobile-modal').removeClass('show');
      				});
      			}
      			
      			if( !othis.find('.'+ nav_bar)[0] ){
      				othis.append( bar );
      				itemElem.on('mouseenter',function(){
      					follow.call( this ,bar , othis);
      				})
      				.on('mouseleave',function(){
      					if( !othis.hasClass( nav_tree )){
      						clearTimeout( timerMore );
      						timerMore = setTimeout(function(){
      							othis.find('.' + nav_child ).removeClass( nav_show );
      							othis.find('.'+ nav_more ).removeClass( nav_more+'d' );
      						},300);
      					}
      				});
      				
      				othis.on('mouseleave', function(){
      					clearTimeout( timer );
      					var timeEnd = setTimeout( function(){
      						if( othis.hasClass( nav_tree )){
      							bar.css({
      								height : 0,
      								top : bar.position().top + bar.height() / 2,
      								opacity : 0 
      							});
      						}else{
      							bar.css({
      								width : 0,
      								left : bar.position().left + bar.width() / 2,
      								opacity : 0
      							});
      						}
      					} , time );
      				})
      			}
      			//收缩状态
      			if( othis.hasClass(nav_tree) ){
      				//增加监听
      				itemElem.on('mouseenter',function(){
      					showChild.call(this,othis);
      				})
      				.on('mouseleave',function(){
      					$(this).children('.byy-nav-child').attr('style','');
      				});
      			}
      			
      		});
      		$( nav_ele ).each(function(){
  				var othis = $(this),
  					bar = $('<span class="'+ nav_bar +'"></span>'),
  					itemElem = othis.find('.'+ nav_item );
  				itemElem.each(function(){
  					var oitem = $(this),
  						child = oitem.find('.'+ nav_child);
  					if( child[0] && !oitem.find('.'+ nav_more)[0] ){
  						var one = oitem.children('a');
  						one.append('<span class="'+ nav_more +'"></span>');
  					}

  					oitem.off('click',navevents.clickThis ).on('click',navevents.clickThis);
  					oitem.children('a').off('click', navevents.showChild).on('click', navevents.showChild);
  					child.children('li').off('click', navevents.clickChild ).on('click', navevents.clickChild);
  				});
  			});
      	},
		breadcrumb: function(){
			var eles = this.$ele;
			$(eles).each(function(){
				var othis = $(this),separator = othis.attr('separator') || '>',aNode = othis.find('a');
				if(aNode.find('.byy-box')[0]) return;
				aNode.each(function(index){
					if(index === aNode.length - 1) return;
					$(this).append('<span class="byy-box">'+ separator +'</span>');
				});
				othis.css('visibility', 'visible');
			});
		},
		buttonmenu : function(){
			var ele = this.$ele;
			//绑定事件
			//获得btn的宽度和位置
			ele.find('ul').addClass('byy-anim').addClass('byy-anim-upbit');
			// ele.on('mouseenter',function(){
			// 	$(this).addClass('expand');
			// }).on('mouseleave',function(){
			// 	$(this).removeClass('expand');
			// });
			//获得按钮宽度-设置
			var w = ele.css('width');
			ele.find('ul').css('min-width',w);
		}
	});

	/** 进度条 **/
	byy.fn.extend({
		//将相关dom渲染
		progress : function( opts ){
			var $ele = this.$ele;
			$ele.find('.byy-progress-bar').each(function(){
				var $bar = $(this);
				$bar.css('width',opts ? (typeof opts == 'string' ? opts : (opts.width || '0%')) : $bar.attr('percent'));
				if( opts && opts.text){
					var text = opts.text;
					if($ele.find('.byy-progress-text').length > 0){
						$ele.find('.byy-progress-text').html(text);
					}else{
						var $text = '<span class="byy-progress-text">'+text+'</span>';
						$ele.find('.byy-progress-bar').append($text);
					}
				}
			});
		},
		//根据配置返回HTML
		createProgress : function( opts ){
			opts = opts || {
				radius : false,
				width : '0%',
				size : ''
			};
			var html = '<div class="byy-progress '+(opts.radius ? 'radius' : '')+' '+(opts.size || '')+'" '+( opts.id ? 'id="'+opts.id+'"' : '')+'><div class="byy-progress-bar" percent="'+(opts.width || '0%')+'">'+( opts.text ? '<span class="byy-progress-text">'+opts.text+'</span>' : '')+'</div></div>';
			var $ele = this.$ele;
			$ele.html(html);
			$ele.find('.byy-progress-bar').animate({
				width : opts.width || '0%'
			},300);
		},
		//获得对应进度条的进度值
		getProgress : function(){
			var $ele = this.$ele;
			return $ele.find('.byy-progress-bar').map(function(){
				return $(this).attr('percent');
			}).get();
		}
	});

	/** 列表处理 **/
	byy.fn.extend({
		/*处理列表相关信息，包括检索折叠,滚动监听,通用点击等*/
		list : function(){
			var $ele = this.$ele,/*容器*/
				$panels = $ele.hasClass('list-panel') ? $ele : $ele.find('.list-panel').length > 0 ?  $ele.find('.list-panel') : $ele.parents('.list-panel');
			if(null == $panels || $panels.length == 0){
				return;
			}
			$panels.each(function(){
				var $panel = $(this),/*面板元素*/
					expand = $panel.attr('byy-expand') || false,//是否展开，默认false
					more = $panel.attr('byy-more') || true,//是否有更多查询按钮，默认是true
					$search = $panel.find('.byy-panel-search'),/*面板内检索元素*/
					$title = $panel.find('.byy-panel-title'),/*标题元素*/
					$searchBlocks = $search.find('.byy-panel-search-block'),/*检索可见块元素,包括.hide*/
					$searchBtn = $search.find('.byy-btn-group'),/*检索按钮组*/
					maxw = $panel.width(),/*panel 的宽度*/
					height = 0,/*初始距离顶部的高度*/
					left = 0,/*计算左侧的距离*/
					//判断标签样式的检索区域
					$tagsearch = $panel.find('.byy-panel-search-tag'),
					//默认170，最大285.
					buttonWidth = 170,//按钮组的宽度
					buttonWidthMax = 285,
					hasmore = false;/*判断是否有更多换行的元素*/
				if($searchBlocks.length > 0){
					//移除所有重新计算
					var nowwidth = buttonWidth+20;
					var startHide = false;
					var recalc = false;//重新计算
					//需要计算两次，按照最小计算，判断是否有隐藏，如果没有，则不处理，如果有，则中心计算
					$searchBlocks.each(function(){
						$(this).removeClass('hide');
						$(this).removeAttr('mored');
						var $temp = $(this),
							ewidth = $temp.width(),
							emr = parseInt($temp.css('margin-right').replace('px',''),10),
							eallwidth = ewidth + emr;
						if(nowwidth + eallwidth >= maxw){
							recalc = true;
						}else if(!startHide){
							nowwidth+= eallwidth;
						}
					});
					if(recalc){
						nowwidth = buttonWidthMax+20;
						$searchBlocks.each(function(){
							$(this).removeClass('hide');
							$(this).removeAttr('mored');
							var $temp = $(this),
								ewidth = $temp.width(),
								emr = parseInt($temp.css('margin-right').replace('px',''),10),
								eallwidth = ewidth + emr;
							if(nowwidth + eallwidth >= maxw || startHide){
								startHide = true;
								$temp.addClass('hide');
								$temp.attr('mored',true);
							}else if(!startHide){
								nowwidth+= eallwidth;
							}
						});
					}
					
					//根据结果进行处理
					if(startHide){
						$search.css('padding-right',buttonWidthMax);
						$panel.find('.list-panel-hsearch').length == 0 ? $searchBtn.append('<span class="byy-btn small cancel list-panel-hsearch"><i class="fa fa-angle-double-down"></i>'+byy.lang.list.hsearch+'</span>') : '';	
					}else{
						$search.css('padding-right',buttonWidth);
						$panel.find('.list-panel-hsearch').remove();
					}
					if(expand == 'true' || expand == true){
						$('.byy-panel-search-block[mored=true]').removeClass('hide');
					}else{
						$('.byy-panel-search-block[mored=true]').addClass('hide');
					}
					
					$searchBtn.css('left',nowwidth - (startHide ? buttonWidthMax : buttonWidth) - 10);
				}else{
					$searchBtn.hide();
				}
				//处理标签检索区域
				if($tagsearch.length > 0){
					var $tagblock = $ele.hasClass('byy-block') ? $ele : $ele.find('.byy-block'),//$tagsearch.find('.byy-block'),
						$tagmore = $('<span class="tag-more byy-unselect">'+byy.lang.list.more+'<i class="byyicon icon-arrow-down"></i></span>');
					$tagblock.each(function(){
						//块，检查内部的block 是否存在offset换行？
						var $this = $(this),
							$tagblockSpan = $this.find('.search-tag-block');
						var collapse = false,nowtop = 0;
						$tagblockSpan.each(function(){
							//史莎莎:在IE下获取的高度有小数点无法准确判断等于
							// collapse = nowtop != 0 && nowtop != $(this).offset().top ? true : false;
							var top = $(this).offset().top === undefined ? 0 : Math.floor($(this).offset().top);
							collapse = nowtop != 0 && Math.abs(nowtop - top) > 2 ? true : false;
							nowtop = $(this).offset().top;
							return !collapse;
						});
						$this.find('.tag-more').remove();
						if(collapse){
							$this.append($tagmore.clone());
							$this.addClass('byy-block-collapse');
						}
					});

				}
			});
			var actives = {
				SEARCHCLICK : function(){
					var $this = $(this);
					var $s = $this.parents('.byy-panel-search');
					var expand = $s.attr('byy-expand');
					if(expand == 'true' || expand == true){
						$s.attr('byy-expand',false);
						$('.byy-panel-search-block[mored=true]').addClass('hide');
						$this.find('.fa').css({
							'transform' : 'rotate(0deg)'
						});
					}else{
						$s.attr('byy-expand',true);
						$('.byy-panel-search-block[mored=true]').removeClass('hide');
						$this.find('.fa').css({
							'transform' : 'rotate(180deg)'
						});
					}
				},
				COLLAPSE : function(ev){
					var $tagmore = $(ev.target || ev.srcElement);
					$tagmore = $tagmore.hasClass('tag-more') ? $tagmore : $tagmore.parent();
					var $tagblock = $tagmore.parent();
					$tagblock.toggleClass('byy-block-collapse');
					//替换图标
					var $icon = $tagmore.find('.byyicon');
					$icon.hasClass('icon-arrow-down') ? $icon.removeClass('icon-arrow-down').addClass('icon-arrow-up') : $icon.removeClass('icon-arrow-up').addClass('icon-arrow-down');
				}
				// ,
				// CHECKTAG : function(ev){
				// 	var $tagblock = $(ev.target || ev.srcElement),$parent = $tagblock.parent(),multi = $parent.attr('multiple') ? true : false;
				// 	var tagsel = $tagblock.hasClass('tag-selected');
				// 	if(!multi){
				// 		$parent.find('.search-tag-block.tag-selected').removeClass('tag-selected');
				// 	}
				// 	if(!tagsel){
				// 		$tagblock.addClass('tag-selected');
				// 	}else{
				// 		$tagblock.removeClass('tag-selected');
				// 	}
				// }
			};
			$panels.off('click','.list-panel-hsearch').on('click','.list-panel-hsearch',actives['SEARCHCLICK']);
			$panels.off('click','.tag-more').on('click','.tag-more',actives['COLLAPSE']);
			// $panels.off('click','.search-tag-block').on('click','.search-tag-block',actives['CHECKTAG']);
		}
	});

	/** 轮播,来自slideBox **/
	byy.fn.extend({
		slide : function( options ){
			//默认参数
			var defaults = {
				direction : 'left',//left,top
				duration : 0.6,//unit:seconds
				easing : 'swing',//swing,linear
				delay : 3,//unit:seconds
				startIndex : 0,
				hideClickBar : true,
				clickBarRadius : 5,//unit:px
				hideBottomBar : false
			};
			var settings = $.extend(defaults, options || {});
			//计算相关数据
			var wrapper = this.$ele, ul = wrapper.children('ul.items'), lis = ul.find('li'), firstPic = lis.first().find('img'),firstPicDiv= lis.first().find(".bgp");
			var li_num = lis.size(), li_height = 0, li_width = 0;
			//初始化
			var init = function(){
				if(!wrapper.size()) return false;
				wrapper.data('over', 0);
				li_height = settings.height ? settings.height : lis.first().height();
				li_width = settings.width ? settings.width : lis.first().width();
	//			li_height = lis.first().height();
	//			li_width = lis.first().width();
				if(settings.wrapperWidth){
					wrapper.css({ height:li_height+'px'});
				}else{
					wrapper.css({width: li_width+'px', height:li_height+'px'});
				}
				lis.css({width: li_width+'px', height:li_height+'px'});//ADD.JENA.201207051027
				
				ul.append(ul.find('li:first').clone());
				li_num += 1;
				
				if (settings.direction == 'left') {
					ul.css('width', li_num * li_width + 'px');
				} else {
					ul.css('height', li_num * li_height + 'px');
				}			
				ul.find('li:eq('+settings.startIndex+')').addClass('active');
				
				if(!settings.hideBottomBar){//ADD.JENA.201208090859
					var tips = $('<div class="tips"></div>').css('opacity', 0.7).appendTo(wrapper);
					var title = $('<div class="title"></div>').html(function(){
						var active = ul.find('li.active').find('a'), text = active.attr('title'), href = active.attr('href');
						return $('<a>').attr('href', href).text(text);
					}).appendTo(tips);
					var nums = $('<div class="nums"></div>').hide().appendTo(tips);
					lis.each(function(i, n) {
						var a = $(n).find('a'), text = a.attr('title'), href = a.attr('href'), css = '';
						i == settings.startIndex && (css = 'active');
						$('<a>').attr('href', href).text(text).addClass(css).css('borderRadius', settings.clickBarRadius+'px').mouseover(function(){
							wrapper.data('over', 1);
							$(this).addClass('active').siblings().removeClass('active');
							ul.find('li:eq('+$(this).index()+')').addClass('active').siblings().removeClass('active');
							start();
						}).appendTo(nums);
					});
				
					if(settings.hideClickBar){//ADD.JENA.201206300847
						tips.hover(function(){
							nums.animate({top: '0px'}, 'fast');
						}, function(){
							nums.animate({top: tips.height()+'px'}, 'fast');
						});
						nums.show().delay(2000).animate({top: tips.height()+'px'}, 'fast');
					}else{
						nums.show();
					}
				}
				
				lis.size()>1 && start();
			};
			//开始轮播
			var start = function() {
				var active = ul.find('li.active'), active_a = active.find('a');
				var index = active.index();
				var offset,param;
				if(settings.direction == 'left'){
					offset = index * li_width * -1;
					param = {'left':offset + 'px' };
				}else{
					offset = index * li_height * -1;
					param = {'top':offset + 'px' };
				}
				
				wrapper.find('.nums').find('a:eq('+index+')').addClass('active').siblings().removeClass('active');
				wrapper.find('.title').find('a').attr('href', active_a.attr('href')).text(active_a.attr('title'));

				// EDIT.JENA.20150123
				var randomArr = ['linear','swing'];
				ul.stop().animate(param, settings.duration*1000, settings.easing == 'random' ? randomArr[Math.floor(Math.random()*randomArr.length)] : settings.easing, function() {
					active.removeClass('active');
					if(active.next().size()==0){
						ul.css({top:0, left:0}).find('li:eq(1)').addClass('active');
						wrapper.find('.nums').find('a:first').addClass('active').siblings().removeClass('active');
					}else{
						active.next().addClass('active');
					}
					wrapper.data('over')==0 && wrapper.data('timeid', window.setTimeout(start, settings.delay*1000));
				});
			};
			//停止轮播
			var stop = function() {
				window.clearTimeout(wrapper.data('timeid'));
			};
			//鼠标经过事件
	//		wrapper.hover(function(){
	//			wrapper.data('over', 1);
	//			stop();
	//		}, function(){
	//			wrapper.data('over', 0);
	//			start();
	//		});	
			//首张图片加载完毕后执行初始化
			var imgLoader = new Image();
			imgLoader.onload = function(){
				imgLoader.onload = null;
				init();
			};
			var background_image = "";
			if(firstPicDiv!=undefined&& firstPicDiv.css("background-image")!=undefined){
				var background_image = firstPicDiv.css("background-image");
				if(background_image.indexOf('"http')>=0){
					background_image = background_image.substring(background_image.indexOf("(")+2,background_image.length-2);
				}else{
					background_image = background_image.substring(background_image.indexOf("(")+1,background_image.length-1);
				}
			}
			imgLoader.src = firstPic.attr('src')||background_image;
		}
	});

	//自动引入jquery 和 语言包 
	byy.require('lang',function(){
		if(!window.$){
			byy.require('jquery',function(){
				//c
				initUI();
			});
		}else{

			initUI();
		}
	});
	window.b = window.byy = byy;
	return byy;
});