/******
 * 第二种检索下拉的插件
 * @author lixun
 * @created on 2017年3月31日 13:37:32
 * @version 1.0
 ******/


 var searchselect = function( opts ){
 	return new searchselect.fn.init( opts );
 };

 searchselect.fn = searchselect.prototype = {
 	init : function( opts ){
 		this.opts  = opts;
 		this.callback();
 		return this;
 	}
 };

var cls = ['selected','item-list','item-add','loading-msg','search-list-wrap','item','close','byy-form-search-btn'];

 searchselect.fn.init.prototype = searchselect.fn;

 //分为两种形式-：1.js控制DOM实现，2.自己组织DOM

/*检查opts是否合格*/
 searchselect.fn.checkOpts = function(){
 	var thiz = this,opts = thiz.opts;
 	if( opts.selector ){
 		opts.$ele = $(opts.selector);
 	}else{
 		byy.error('searchselect must has selector!');
 		return false;
 	}
 	return true;
 };


/*事件绑定*/
 searchselect.fn.callback = function(){
 	//事件绑定。
 	//1.点击addon
 	var thiz = this,opts = thiz.opts,selector = opts.selector,$c = $(selector),onAdd = opts.onAdd || '',onSelect = opts.onSelect || '',multi= opts.multi || false,onKeyUp = opts.onKeyUp || '',onSearch = opts.onSearch || '';
 	$c.on('click','.'+cls[2],function(ev){
 		var $add = $(this),$ele = $add.parent();
 		var callback = function(){
	 		$ele.find('.'+cls[1]).toggleClass('hide');
	 		$ele.find('.'+cls[2]).toggleClass('hide');
	 		//展示内容隐藏部分
	 		setTimeout(function(){
		 		$ele.find('.'+cls[3]).hide();
		 		$ele.find('.'+cls[4]).show();	
	 		},50);
 		};
 		if(typeof onAdd == 'function'){
 			onAdd(callback);
 		}else{
 			setTimeout(callback());
 		}
 		byy.stope(ev);
 	});


 	//点击下拉列表的事件
 	$c.find('.'+cls[4]).on('click','.'+cls[5],function(ev){
 		var $item = $(this);
 		if(typeof onSelect == 'function'){
 			//将选择的数据提供
 			var renderItem = function( item ){
 				var $wrap = $c.find('.'+cls[0]);
 				$wrap.append(item);
 				//
				$c.find('.'+cls[1]).toggleClass('hide');
				if(multi){
					$c.find('.'+cls[2]).toggleClass('hide');
				}else{
					$c.find('.'+cls[2]).removeClass('hide').addClass('hide');
				}
				$c.find('.'+cls[3]).show();
				$c.find('.'+cls[4]).hide();
 			};
 			onSelect($item ,renderItem );
 		}else{
 			//自己处理

 		}
 		byy.stope(ev);
 	});

 	//移除
 	$c.find('.'+cls[0]).on('click','.'+cls[6],function(ev){
 		//移除.如果是multi=false ,显示+号，不是的话只需要移除
 		var $close = $(this),$item = $close.parent();
 		if(typeof onRemove == 'function'){
 			onRemove($item);
 		}else{
 			$item.remove();
 		}
 		if(!multi){
 			$c.find('.'+cls[2]).removeClass('hide');
 		}
 		byy.stope(ev);
 	});

 	var closeDrop = function(ev){
 		var t = ev.target || ev.srcElement,$t = $(t);
		var isItemList = $t.parents('.'+cls[1]).length > 0 ? true : false;
		var isAdd = $t.hasClass(cls[2]) || ($t.parents('.'+cls[2]).length > 0 ? true : false);
		var isSelected = $t.parents('.'+cls[0]).length > 0 ? true : false;
		if( !isItemList && !isAdd && !isSelected){
			//enter
			$c.find('.'+cls[1]).removeClass('hide').addClass('hide');
			if(multi){
				$c.find('.'+cls[2]).removeClass('hide');
			}else{
				//判断
				if($c.find('.'+cls[0]).find('.'+cls[5]).length >0){
					$c.find('.'+cls[2]).removeClass('hide').addClass('hide');
				}else{
					$c.find('.'+cls[2]).removeClass('hide');
				}
			}
			$('.'+cls[3]).show();
			$('.'+cls[4]).hide();
		}
		byy.stope(ev);
 	};

 	$('body').off('click',closeDrop).on('click',function(ev){
		closeDrop(ev);
 	});

 	$c.on('keyup','input',function(){
 		var $dom = $(this),val = $dom.val();
 		$dom.parent().find('.empty').remove();
 		if(typeof onKeyUp == 'function'){
 			onKeyUp($dom,val);
 		}else{
 			//默认处理
 			var $search = $dom.parent().find('.'+cls[4]);
 			var $list = $search.find('p');
 			//过滤
 			var num = 0;
 			$list.each(function(){
 				var $this = $(this);
 				var name = $this.find('.name').html();
 				if(name.indexOf(val) > -1 || byy.trim(val) == ''){
 					$this.show();
 					num ++;
 				}else{
 					$this.hide();
 				}
 			});
 			if(num == 0){
 				$search.append('<div class="empty" style="padding-left:10px;font-size:12px;color:#999;">没有检索到记录</div>');
 			}
 		}
 	});

 	$c.on('click','.'+cls[7],function(){
 		if(typeof onSearch == 'function'){
 			onSearch($c);
 		}
 	});
 	
 };


 byy.define(function( exports ){
 	exports('searchselect',searchselect);
 });