/****
 * 表单中的输入框用来检索远程数据或者本地数据的组件
 * @author lixun 
 * @create on 2017年3月29日 17:01:06
 * @version 1.0 版本初建
****/

/**
配置项：
{
	selector : 'input',
	id : 'id',//唯一ID
	name : 'realname',//显示的数据项
	data : [],//本地数据项
	remote : '/inputsearch.do',//远程URL
	remote : function(keywords,callback){
		$.ajax({
			url : '/inputsearch.do',
			type : 'POST',
			data : {key : keywords},
			success : function(res){
				var result = byy.json(res);
				var data = result.rows;//自己处理数据
				//convert data 
				callback(data);
			}
		});
	},
	formatter : function(obj){ //对LI进行格式化，返回字符串
		var id = obj.id,name = obj.name;
		return '<li>'+name+'</li>';
	},
	onClick : function( obj ){//选中事件触发
		console.log(obj);
		//do something else
	}
}
**/

'use strict';
var inputsearch = function( opts ){

	return new inputsearch.fn.init( opts );
};

inputsearch.fn = inputsearch.prototype = {
	constructor: inputsearch,
	init : function( opts ){
		var cfg= {
			multi : false
		};
		this.opts = opts;
		this.render();
		return this;
	}
};

inputsearch.fn.init.prototype = inputsearch.fn;


inputsearch.fn.check = function(){
	//检查各项参数，同时增加默认参数
	var decfg = {

	};
	decfg = byy.extend(decfg,this.opts);
	if(!decfg.selector){
		byy.error('inputsearch opts->selector is required!');
		return false;
	}
	if( (typeof decfg.selector == 'string' && $(decfg.selector).length == 0 ) || (typeof decfg.selector == 'object' && decfg.selector.length == 0) ){
		byy.error('inputsearch not found elements by selector:'+decfg.selector);
		return false;
	}else{
		var $ele = typeof decfg.selector == 'string' ? $(decfg.selector) : decfg.selector;
		decfg.$ele = $ele;
		var tempFlag = true;
		$ele.each(function(){
			var $this = $(this),nodeName = $this[0].nodeName;
			if(nodeName != 'INPUT'){
				tempFlag = false;
				return;
			}
		});
		if(!tempFlag){
			byy.error('inputsearch elements is not all input ');
			return false;
		}
		//检查源或者远程数据
		if(!decfg.data && !decfg.remote){
			byy.error('inputsearch has empty data source');
			return false;
		}
	}
	this.opts = decfg;//重定义
	return true;
};

inputsearch.fn.view = function(data){
	var thiz = this,opts = thiz.opts,formatter = opts.formatter || '';
	var html = '';
	data = data || [];
	if(data.length > 0){
		var rs = data.map(function( ele ){
			if(typeof formatter == 'function'){
				var html = formatter(ele);
				var $html = $(html);
				$html.attr('id',ele.id).attr('title',ele.name).data('obj',ele);
				return $html;
			}else{
				var $html = $('<li></li>');
				$html.html(ele.name);
				$html.attr('id',ele.id).attr('title',ele.name).data('obj',ele);
				return $html;
			}
		});
		return rs;
	}else{
		return [$('<span class="empty">没有检索到数据</span>')];
	}
};

//
inputsearch.fn.review = function( $ele,data ){
	var thiz = this,width = $ele.width() + 10,height = $ele.height() + 4,x = $ele.offset().left,y = $ele.offset().top + height;
	//检查DOM节点，查看是否存在面板。
	//清空面板，用数据重新显示
	var $ul;
	if($ele.next().hasClass('byy-input-search')){
		$ul = $ele.next();
	}else{
		$ul = $('<ul></ul>');
		$ul.addClass('byy-input-search');
		$ele.after($ul);
	}
	$ul.css('width',width).css('top',height);
	//绑定事件--> 点击选项（查看是否多选？）然后赋值（包括上下左右）
	var $lis = thiz.view(data);
	$ul.html('').append($lis);
	thiz.select( $ele );
	$ul.find('li').off('click').on('click',function(){
		var $li = $(this);
		thiz.checkLi($li);
		thiz.setValue($ele);
	});
};

//在展开的时候用
inputsearch.fn.select = function( $ele ){
	//根据已存在的数据，选中LI
	var thiz = this;
	var id = $ele.attr('data-id'),name = $ele.attr('data-name');
	if(id && $ele.next().hasClass('byy-input-search') ){
		var $ul = $ele.next();
		var $li = $ul.find('li[id="'+id+'"]');
		thiz.checkLi($li);
	}
};


inputsearch.fn.search = function( $ele, keywords ){
	//1.检查内部数据
	var thiz = this,opts = thiz.opts,data = opts.data,remote = opts.remote;
	if(null != data && undefined != data){
		//开始校验
		var rs;
		if(data.length > 0 && typeof data[0] == 'object' ){
			//对象数据，查找属性和值
			var name = opts.name || 'name',id = opts.id || 'id';//default value
			//组装返回数据
			rs = data.filter(function(ele,index){
				return ele[name].indexOf( keywords ) > -1 ? true : false;
			}).map(function(ele,index){
				return {
					obj : ele,//元数据
					name : ele[name],
					id : ele[id]
				};
			});

		}else if(data.length > 0 && typeof data[0] != 'object'){
			//str  number
			rs = data.filter(function( ele,index ){
				return ele.indexOf(keywords) > -1 ? true : false;
			}).map(function( ele,index ){
				return {
					name : ele,
					id : index
				};
			});
		}else{
			rs = [];
		}
		//进行产生view 渲染
		thiz.review($ele,rs);
	}else if(null != remote && typeof remote == 'string'){//是一个地址
		var winIndex ;
		if(byy.win){
			winIndex = byy.win.load(1);
		}
		$.ajax({
			url : remote,
			type : 'POST',
			data : {keywords : keywords}
		}).done(function(res){
			if(byy.win){
				byy.win.close(winIndex);
			}
			var data = byy.json(res);
			if(data instanceof Array){
				thiz.review($ele,data);
			}
		}).fail(function(res){
			if(byy.win){
				byy.win.msg('查询错误！');
			}else{
				thiz.reivew($ele,[]);
			}
		});
	}else if(null != remote && typeof remote == 'function'){
		var callback = function( data ){
			thiz.review($ele, data );
		}
		remote(keywords,callback);
	}
};

inputsearch.fn.destroy = function( $ele ){
	if($ele){
		if($ele.next().hasClass('byy-input-search')){
			$ele.next().remove();
		}
	}else{
		$('.byy-input-search').remove();
	}
};

inputsearch.fn.checkLi = function( $li ){
	if($li.length > 0){
		var $ul = $li.parent();
		$ul.find('.byy-this').removeClass('byy-this');
		$li.addClass('byy-this');
		//滚动到该位置
		var ulHeight = $ul.height() ,ulTop = $ul.offset().top,
			liHeight = $li.height() + 10,liTop = $li.offset().top;
		if( (liTop + liHeight) > (ulHeight + ulTop )){//down hide
			var min = (liTop + liHeight ) - (ulHeight + ulTop);
			var nowScrollTop = $ul.scrollTop();
			$ul.scrollTop(min + nowScrollTop);
		}else if( liTop < ulTop -1){//up hide 
			var nowScrollTop = $ul.scrollTop();
			$ul.scrollTop(nowScrollTop - (ulTop - liTop));
		}
	}
};

inputsearch.fn.direct = function($ele,code){
	var $ul,thiz = this;
	if($ele.next().hasClass('byy-input-search')){
		$ul = $ele.next();
		var $lis = $ul.find('li');
		if($lis.length > 0){
			//检查现在是否已经有选中的了？
			var $byythis = $ul.find('li.byy-this');
			var bhasSel = $byythis.length > 0 ? true : false;
			var $up ,$down;
			if(bhasSel){
				var thisIndex = $byythis.index();
				$up = thisIndex > 0 ? $ul.find('li:eq('+(thisIndex - 1)+')') : $ul.find('li:last');
				$down = thisIndex < $ul.find('li').length - 1 ? ($ul.find('li:eq('+(thisIndex + 1)+')')) : $ul.find('li:first');
			}else{
				$up = $ul.find('li:last');
				$down = $ul.find('li:first');
			}
			var $checkLi ;
			switch (code) {
				case 40 : //下
					$checkLi = $down;
					break;
				case 38 : 
					$checkLi = $up;
					break;
			}
			if($checkLi){
				thiz.checkLi($checkLi);
			}
		}
	}else if(code == 40){//在没有数据的情况下还继续调用的话，重新查询
		var nowval = $ele.val();
		thiz.search($ele,nowval);
	}
}

inputsearch.fn.setValue = function( $ele ){
	//获得选中进行回调
	var thiz = this,opts = thiz.opts,onClick = opts.onClick;
	if($ele.next().hasClass('byy-input-search')){
		var $ul = $ele.next();
		if($ul.find('li.byy-this').length > 0){
			var $sel = $ul.find('li.byy-this');
			var data = $sel.data('obj'),id = $sel.attr('id'),name = $sel.attr('title');
			//赋值？
			$ele.val(name);
			$ele.attr('data-id',id);
			$ele.attr('data-name',name);
			thiz.destroy($ele);
			if(onClick && typeof onClick =='function'){
				onClick(data);
			}
		}
	}
};

inputsearch.fn.callback = function( ele ){
	//绑定事件
	var thiz = this,opts = thiz.opts,$ele = opts.$ele;
	$ele.on('keyup',function( ev ){

		var $this = $(this),nowval = $this.val(),keycode = ev.keyCode;
		console.log($this);
		switch (keycode){
			case 40 : //下
			case 39 :
			case 38 : 
			case 37 : 
				thiz.direct($this,keycode);
				break;
			case 13 :
				thiz.setValue($this);
				break;
			default :
				if(nowval.trim() == ''){
					thiz.destroy($(this));
				}else{
					thiz.search($(this),nowval);	
				}
		}
	});

	$ele.on('focus',function(ev){
		//移除其他的review
		$('.byy-input-search').remove();
		var v = $(this).val();
		if(v.trim() != ''){
			thiz.search($(this),v);
		}
		byy.stope(ev);
	});

	// $ele.on('blur',function(){
	// 	thiz.destroy($ele);
	// });
	$('body').on('click',function(ev){
		var t = ev.target || ev.srcElement,$t = $(t);
		if($t.parents('.byy-input-search').length > 0 || $t.hasClass('byy-form-search')){
			
		}else{
			thiz.destroy();
		}
		byy.stope(ev);
	});
};

inputsearch.fn.render = function(){
	var thiz = this;
	if(thiz.check()){
		thiz.callback();
	}
};


byy.define(function( exports ){
	exports('inputsearch',inputsearch);
});