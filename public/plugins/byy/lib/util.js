/*** 
 *工具类 
 * @2018年11月9日 10:34:05 : 修复 byy.stringfy 在空对象的处理上发现的BUG;
 * @2018年12月3日 11:37:42 : 修复stringfy 与 json函数，在JSON可以使用的情况下优先使用该函数。
 * @2019年1月18日 14:36:36 : bindEvents 增加单页面多个不同应用处理。
 ***/

byy.define(function( exports ){
	var byynsc = {};//byy命名空间存储
	var win = window;//兼容移动出后的window
	var doc = document;
	var eventsCache = {};//存放页面事件空间
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
			var rs = byy.device();
			return rs.android || rs.ios ? true : false;
		},
		isIOS : function(){
			return byy.device().ios;
		}
	});

	/**工具类：url**/
	byy.extend({
		getSearch : function( url , name ){
			if( !name ){
				name = url;
				url = location.href;
			}
			var rv = {};
			url = url.indexOf('?') > -1 ? url.split('?')[1] : '';
			if(url != ''){
				var ls = url.split('&');
				for(var i=0;i<ls.length;i++){
					var ele = ls[i];
					var kname = ele.split('=')[0] ||'',kvalue = ele.split('=')[1] || '';
					try{
						kvalue = decodeURIComponent(kvalue);
					}catch(e){
						try{
							kvalue = unescape(kvalue);//该函数已经从V3中删除，不建议使用。
						}catch(e){}
					}
					rv[kname] = kvalue;
				}
			}
			if(name)return rv[name];
			return rv;
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
		},
		//16进制颜色转化成rgb展示,返回 rgb(222,222,222) 或者 222,222,222
		hex2rgb : function( str ,iswrap/*是否包裹，默认包裹为true*/){
			if(byy.isNull(str) || str == '')return '';
			str = $.trim(str.replace('#',''));//替换
			if(str.length == 3 || str.length == 6){
				if(str.length == 3){
					str = str.split('').map(function(item){
						return item+''+item;
					}).join('');
				}
				var arr = str.split('');
				var rs = [];
				for(var i=0;i<arr.length;i+=2){
					var code = arr[i]+''+arr[i+1];
					rs.push(parseInt(code,16));
				}
				return iswrap ? ('rgb('+rs.join(',')+')') : rs.join(',');
			}
			return '';
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
					if(JSON && JSON.parse){
						obj = JSON.parse(str);
					}else{
						obj = $.parseJSON(str);
					}
				}catch(Error){
					return str;
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
			if(JSON && JSON.stringify)return JSON.stringify(obj);
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
				//如果是空对象，则不处理
				if(htmls.length > 1){
					htmls.splice(htmls.length-1);
				}
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
			var w = window.top.document;
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
		frameLevel : 50,//frame 层级
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
				}else if(temp.src && temp.src.indexOf('www.sogou.com') > -1){
					//针对搜狗浏览器默认插入frame收集信息，且不允许访问frame导致的问题
					continue;
				}else{
					var tempArr = $($(temp).get(0).contentWindow.document).find('iframe');
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
		 },
		 /****
		  * 页面通用绑定点击事件函数
		  * 例如:绑定所有带有 filter的函数，并根据值进行回调。
		  * <span filter="showMe">Click Me</span> 
		  * 那么就可以这样绑定 byy.bindEvents('filter',{
		  *     showMe : function(){alert('show me')}
		  * })
		  * 注意:该函数仅限于点击事件
		  **/
		 bindEvents : function(type , events){
		 	if(typeof type === 'object' || null === type || undefined === type){
				events = type;
				type = 'filter';
			}
			eventsCache[type] = events;
			delete events;
			$('body').off('click','['+type+']').on('click','['+type+']',function(ev){
				var $dom = $(this),eventType = $dom.attr(type),data = $dom.data();
				if(eventsCache && eventType && eventsCache[type] && eventsCache[type][eventType]){
					eventsCache[type][eventType].call($dom,data,ev);
				}
			});
		 }
	});

	exports('util',{
		version : '1.0',
		msg : '工具类函数'
	})
});