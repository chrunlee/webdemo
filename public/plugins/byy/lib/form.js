/** form **/
byy.define('jquery',function( exports ){
	var rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
		rsubmittable = /^(?:input|select|textarea|keygen)/i,
		rCRLF = /\r?\n/g,
		rcheckableType = (/^(?:checkbox|radio)$/i);

	var localizeName = 'data-localize',//国际化名称
		dataLocalizeName = 'localize',
		localizeTitle = 'data-localize-title',//国际化的title属性
		dataLocalizeTitle = 'localize-title';
	var doc = document;
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
							if(/select/i.test(nodeName)){
								$targetThis.val(typeof val == 'string' ? (val.indexOf(',') > -1 ? ff(val.split(',')) : ff(val)) : val);
							}else{
								$targetThis.val(typeof val == 'string' ? ff(val) : val);	
							}
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
					$this.parent().children('.byy-tab-this').removeClass('byy-tab-this');
					$this.addClass('byy-tab-this');
					var $content = $tab.children('.byy-tab-content');
					$content.children('.show.byy-tab-item').removeClass('show');
					$content.children('.byy-tab-item:eq('+$this.index()+')').addClass('show');
				}
			});
			//绑定左右滚动点击事件,由于没有cfg,需要进行判断

			$ele.off('click','.byy-tab-scroll-left').on('click','.byy-tab-scroll-left',function(){
				var $leftBtn = $(this),
					$tab = $leftBtn.parent().parent(),
					$ul = $tab.children('.byy-tab-title'),
					$li = $ul.children('li');
				var nowLeft = parseInt($ul.css('left').replace('px',''));
				var ulWidth = $ul.width();

				var maxWidth = 0;
				$li.each(function(){
					maxWidth += $(this).outerWidth(true);
				});
				var minLeft = 0,
					maxLeft =  ulWidth - maxWidth;
				if(maxWidth - ulWidth <= 30){//没有超出
					return;
				}
				var targetLeft = nowLeft + ulWidth;
				targetLeft = Math.min(minLeft,targetLeft);
				targetLeft = Math.max(maxLeft,targetLeft);
				$ul.css('left',targetLeft);

			});
			//绑定左右滚动点击事件
			$ele.off('click','.byy-tab-scroll-right').on('click','.byy-tab-scroll-right',function(){
				var $leftBtn = $(this),
					$tab = $leftBtn.parent().parent(),
					$ul = $tab.children('.byy-tab-title'),
					$li = $ul.children('li');
				var nowLeft = parseInt($ul.css('left').replace('px',''));
				var ulWidth = $ul.width();

				var maxWidth = 0;
				$li.each(function(){
					maxWidth += $(this).outerWidth(true);
				});
				var minLeft = 0,
					maxLeft = maxWidth - ulWidth;
				if(maxWidth - ulWidth <= 30){//没有超出
					return;
				}
				var targetLeft = Math.abs(nowLeft - ulWidth);
				targetLeft = Math.max(minLeft,targetLeft);
				targetLeft = Math.min(maxLeft,targetLeft);
				var diff = maxLeft - targetLeft < 100 ? 0 : 100;
				$ul.css('left',-1*targetLeft+diff);

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
				//增加左右滚动的配置
				scroll : false,
				menu : true,//是否显示右键菜单
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
			//定义滚动元素
			var scrollCls = cfg.scroll ? ' byy-tab-scroll ' : '';
			var scrollEle = cfg.scroll ? '<div class="byy-tab-scroll-tool"><span class="byy-tab-scroll-left"><i class="byyicon icon-arrow-double-left"></i></span><span class="byy-tab-scroll-right"><i class="byyicon icon-arrow-double-right"></i></span></div>' : '';
			var $target = thiz.$ele,selector = thiz.selector;
			//将max存放在选择器元素上。
			$target.data('obj',cfg);
			(function( target ){
				target.html('').append('<div class="'+skin+scrollCls+'" style="'+(height == '' ? '' : 'height:'+height+'px;')+'">'+scrollEle+'<ul class="byy-tab-title"></ul><div class="byy-tab-content" style="'+(height =='' ? '' : 'height:'+(height-40)+'px;')+'"></div></div>');

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
				//绑定左右滚动点击事件
				$(selector).off('click','.byy-tab-scroll-left').on('click','.byy-tab-scroll-left',function(){
					
					var $leftBtn = $(this),
						$tab = $leftBtn.parent().parent(),
						$ul = $tab.children('.byy-tab-title'),
						$li = $ul.children('li');
					var nowLeft = parseInt($ul.css('left').replace('px',''));
					var ulWidth = $ul.width();

					var maxWidth = 0;
					$li.each(function(){
						maxWidth += $(this).outerWidth(true);
					});
					var minLeft = 0,
						maxLeft =  ulWidth - maxWidth;
					if(maxWidth - ulWidth <= 30){//没有超出
						return;
					}
					var targetLeft = nowLeft + ulWidth;
					targetLeft = Math.min(minLeft,targetLeft);
					targetLeft = Math.max(maxLeft,targetLeft);
					$ul.css('left',targetLeft);

				});
				//绑定左右滚动点击事件
				$(selector).off('click','.byy-tab-scroll-right').on('click','.byy-tab-scroll-right',function(){
					var $leftBtn = $(this),
						$tab = $leftBtn.parent().parent(),
						$ul = $tab.children('.byy-tab-title'),
						$li = $ul.children('li');
					var nowLeft = parseInt($ul.css('left').replace('px',''));
					var ulWidth = $ul.width();

					var maxWidth = 0;
					$li.each(function(){
						maxWidth += $(this).outerWidth(true);
					});
					var minLeft = 0,
						maxLeft = maxWidth - ulWidth;
					if(maxWidth - ulWidth <= 30){//没有超出
						return;
					}
					var targetLeft = Math.abs(nowLeft - ulWidth);
					targetLeft = Math.max(minLeft,targetLeft);
					targetLeft = Math.min(maxLeft,targetLeft);
					var diff = maxLeft - targetLeft < 100 ? 0 : 100;
					$ul.css('left',-1*targetLeft+diff);

				});
				/** TAB 右键菜单 **/
				function hideTabMenu(){
					if($('body').find('.byy-tab-menu').length > 0){
						$('body').find('.byy-tab-menu').remove();
					}
				}
				function render (ev,$tab) {
					var evx = ev.pageX,evy = ev.pageY;
					$('body').find('.byy-tab-menu').remove();
					var $menu = $('<div class="byy-tab-menu" style="position:absolute;left:'+evx+'px;top:'+evy+'px;"><ul class="byy-anim byy-anim-upbit"><li type="3">'+(byy.lang.tab.refresh)+'</li><li type="0">'+(byy.lang.tab.close)+'</li><li type="1">'+(byy.lang.tab.others)+'</li><li type="2">'+(byy.lang.tab.all)+'</li></ul></div>');
					$menu.data('obj',{item : $tab.data('obj'),el : $tab});
					$('body').append($menu);
					$(doc).off('click',hideTabMenu).on('click',hideTabMenu);
				}
				$(selector).off('mouseup','.byy-tab-title li').on('mouseup','.byy-tab-title li',function(ev){
					ev = ev || window.event;
					if(ev.which === 3){
						if(!$(this).get(0).oncontextmenu){
							$(this).get(0).oncontextmenu = function(ev2){
								cfg.menu && render(ev2,$(this));
								return false
							}
						}
						$('body').off('click','.byy-tab-menu li').on('click','.byy-tab-menu li',function(){
							var $li = $(this),$menu = $li.closest('.byy-tab-menu'),item = $menu.data('obj'),$tab = item.el.closest('.byy-tab');
							var type = $li.attr('type');
							switch (type){
								case '0' : 
									byy($tab).deleteTab(item.item.index);
									break;
								case '1' : 
									//查找所有tab
									$tab.find('.byy-tab-title>li').each(function(){
										var $tabLi = $(this),tabIndex = $tabLi.data('obj').index;
										if(tabIndex != item.item.index){
											byy($tab).deleteTab(tabIndex);
										}
									});
									break;
								case '2' : 
									$tab.find('.byy-tab-title>li').each(function(){
										var $tabLi = $(this),tabIndex = $tabLi.data('obj').index;
										byy($tab).deleteTab(tabIndex);
									});
									break;
								case '3' : 
								//刷新当前frame的url
									var $content = $tab.find('.byy-tab-item').eq(item.item.index);
									if($content.find('iframe').length > 0){
										$content.find('iframe').attr('src',item.item.url);
									}
									break;

							}
						});
						byy.stope(ev);
						return false;
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
			var $ele = that.$ele,cfg = $ele.data('obj');

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
				if(title.prop('scrollWidth') > title.outerWidth()+1 && !cfg.scroll){
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
			var $container = this.$ele,cfg = $container.data('obj'),max = cfg.max || 10,notitle = cfg.notitle,fyc = cfg.async,selector = this.selector;
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
			object.async = fyc;//设置everybody
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
				var iframe = '<iframe src="'+( !fyc ? object.url : '')+'" '+(object.name ? 'name="'+object.name+'"' : '')+(object.id ? 'id="'+object.id+'"' : '')+' style="border:none;width:100%;height:100%;" ></iframe>';
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
			}else if(!fyc){
				byy(selector).toggleTab(object.index);//跳转到第一个
			}
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
			var $t = this.$ele;
			$t.find('.byy-tab-title').find('li:eq('+index+')').remove();
			$t.find('.byy-tab-content').find('.byy-tab-item:eq('+index+')').remove();
			//删除后调整index
			//关闭后跳转
			if($t.find('.byy-tab-this').length == 0 && $t.find('li').length > 0){
				byy($t).toggleTab(index== 0 ? 0 : (index -1));
			}
			byy($t).fixTabIndex();
			return this;
		},
		toggleTab : function( index ){
			//切换tab标签
			var $s = this.$ele,$tab = $s.find('.byy-tab:first'),cfg = $s.data('obj');
			$s.find('.byy-tab-title:first').children('.byy-tab-this').removeClass('byy-tab-this');
			$s.find('.byy-tab-content:first').children('.show').removeClass('show');
			var $li = $s.find('.byy-tab-title:first>li:eq('+index+')'), obj = $li.data('obj'),fyc = obj.async,url = obj.url,hasload = obj.hasload ? true : false;
			$li.addClass('byy-tab-this');
			var $c = $s.find('.byy-tab-content:first>div:eq('+(index)+')');
			$c.addClass('show');
			if(!hasload && $c.children('iframe').length > 0 && !$c.children('iframe').attr('src')){
				$c.children('iframe').attr('src',url);
				obj.hasload = true;
				$li.data('obj',obj);
			}
			if(cfg && cfg.scroll){
				//如果有滚动条，则自动跳过去
				var $ul = $tab.children('.byy-tab-title'),$li = $ul.children('li');
				var ulWidth = $ul.width(),
					liWidth = 0;
				$li.each(function(liindex){
					if(liindex <= index){
						liWidth += $(this).outerWidth(true);
					}
				});
				var targetLeft = liWidth - ulWidth > 0 ? -1*(liWidth - ulWidth) : 0;
				$ul.css('left',targetLeft);
			}
			return this;
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
				var reElem = $(['<div class="byy-unselect '+ CLASS + (radio.checked ? (' '+CLASS+'ed') : '') + (disabled ? ' byy-radio-disabled ' : '') +'">'
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
	            check.checked ? (' '+RE_CLASS[1]) : '') + (disabled ? ' byy-checkbox-disabled ' : '') +'">'
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
	            ,'<dl class="'+(byy.device().ie ? '' : 'byy-anim byy-anim-upbit ')+ (othis.find('optgroup')[0] ? ' byy-select-group' : '') +'">'+(multi ? '<p class="select-all"><i class="byyicon icon-checkbox"></i>'+(byy.lang.select.selectall)+'</p>' : '')+ function(options){
	              var arr = [];
	              $.each(options, function(index, item){
	                if(multi && index === 0 && !item.value) return;//将第一个为空的值忽略，显示出来。
	                if(item.tagName.toLowerCase() === 'optgroup'){
	                  arr.push('<dt '+($(item).attr(localizeName) ? ''+localizeName+'="'+$(item).attr(localizeName)+'"' : '')+'>'+ item.label +'</dt>'); 
	                } else {
	                	//edited by lixun on 2018年1月24日 17:20:28,处理下下拉选择项目的title,优先title,然后国际化
	                  var itemTitle = $(item).attr('title'),itemLocalizeTitle = $(item).attr(localizeTitle);
	                  arr.push('<dd  '+(itemTitle ? ' title="'+itemTitle+'" ' : '' )+(itemLocalizeTitle ? ' '+localizeTitle+'="'+itemLocalizeTitle+'" ' : '')+' byy-value="'+ item.value +'" class="'+ (byy.contains(valueArr,item.value) ?  'byy-select-this' : '') + (item.disabled ? (' byy-disabled') : '') +'">'+(multi ? '<i class="byyicon '+(byy.contains(valueArr,item.value) ? 'icon-checkbox-checked' : 'icon-checkbox')+'"></i>' : '')+'<span '+($(item).attr(localizeName) ? ''+localizeName+'="'+$(item).attr(localizeName)+'"' : '')+($(item).data('format') ? ' data-format='+$(item).data('format') : ' ')+'>'+ ($(item).attr('icon') ? '<i class="'+$(item).attr('icon')+'"></i>': '') +item.innerHTML +'</span></dd>');
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
			ele.find('ul').addClass('byy-anim').addClass('byy-anim-upbit');
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
				color : '',
				size : ''
			};
			if(opts.color.indexOf('#') >-1){//认为是颜色，目前只支持16进制
				opts.bgcolor = opts.color;
				opts.color = '';
			}
			var html = '<div class="byy-progress '+(opts.radius ? 'radius' : '')+' '+(opts.size || '')+'" '+( opts.id ? 'id="'+opts.id+'"' : '')+'><div class="byy-progress-bar '+(opts.color)+'" '+(opts.bgcolor ?'style="background-color:'+opts.bgcolor+';"' : '')+' percent="'+(opts.width || '0%')+'">'+( opts.text ? '<span class="byy-progress-text">'+opts.text+'</span>' : '')+'</div></div>';
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
							mright = $temp.css('margin-right') ? $temp.css('margin-right') : '0px',
							emr = parseInt(mright.replace('px',''),10),
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
								mright = $temp.css('margin-right') ? $temp.css('margin-right') : '0px',
								emr = parseInt(mright.replace('px',''),10),
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
	/**暴露initUI接口**/
	byy.extend({ 
		initUI : function(){
			initUI();
		}
	});
	byy.fn.extend({
		initUI : function(){
			var $ele = this.$ele;
			initUI($ele);
		}
	});
	exports('form',{
		version : '1.0',
		msg : 'form元素初始化'
	})
});