/**
 提供一个线性数据，进行处理

*/
(function(){

	var Memman = function( data , primaryKey ,$container ,fi , fv){
		var thiz = this;
		thiz.arr = [];
		thiz.map = {};
		thiz.data = {};
		thiz.primary = data;
		thiz.primaryKey = primaryKey;
		thiz.container = $container;
		thiz.fi = fi;
		thiz.fv = fv;
		var filter = thiz.filter = {};
		(function(){
			data.forEach(function( ele, index ){
				for( var k in ele ){
					if(k === primaryKey){
						continue;
					}
					if(k in thiz.map){
						var tindex = thiz.map[k],
							td = thiz.arr[tindex],
							isexis = false;
						td.forEach(function(ele2,index2){
							if(ele2 == ele[k]){
								isexis = true;
								return true;
							}
						});
						if(!isexis){
							td.push(ele[k]);
							thiz.arr.splice(tindex,1,td);
						}
					}else{
						thiz.map[k] = thiz.arr.length;
						thiz.arr.push([ele[k]]);
					}
				}
				thiz.data[ele[primaryKey]]  = ele;
			});
		})();
	};

	Memman.prototype.view = function(){
		var thiz = this,
			map = thiz.map,
			newmap = {};
		for(var k in map){
			newmap[map[k]] = k;
		}
		thiz.newmap = newmap;
		var appendHtml = function(name , value){
			var $block = $('<div></div>');
			$block.addClass('block').attr('item',name).append('<label>'+name+'</label>').append(value.map(function(ele){
				return '<span class="check" value="'+ele+'">'+ele+'</span>';
			}).join(''));
			thiz.container.append($block);
		}

		thiz.container.html('');
		var arr = thiz.arr;
		arr.forEach(function( value ,index){
			var name = newmap[index];
			appendHtml(name , value);
		});
		thiz.createPath(thiz.primary);
		thiz.firstCheck(thiz.primary[0]);
	};

	Memman.prototype.firstCheck = function( obj ){
		var thiz = this;
		var arr = thiz.arr;
		var map = thiz.newmap;
		thiz.check(thiz.fi,thiz.fv);//默认选中第一个
	};

	Memman.prototype.check = function(name , value){
		var thiz = this;
		var $p = thiz.container.find('.block[item="'+name+'"]');
		var $tar = $p.find('[value="'+value+'"]');
		if($tar.hasClass('disabled')){
			return;
		}
		var lastObj = {},selectValue = value;
		if($tar.length  == 0){
			selectValue = $p.find('.check:not(.disabled):eq(0)').attr('value');
		}
		if($p.prev().length > 0){
			var path = thiz.getPath($p.prev()),
				nowobj = thiz.path;
			if(path.length > 0){
				path.forEach(function( v ){
					nowobj = nowobj[v];
				});
				lastObj = nowobj[selectValue];
				var hasitems = [],name;
				for( name in nowobj){
					hasitems.push(name);
				}
				thiz.initBlock($p,hasitems);
			}else{
				thiz.disabled($p);
			}
		}
		$p.find('.checked').removeClass('checked');
		if($tar.length > 0){
			$tar.addClass('checked');	
		}else{
			$p.find('.check:not(.disabled):eq(0)').addClass('checked');
		}
		if($p.next().length > 0){
			thiz.check($p.next().attr('item'),'');
		}else{
			thiz.showData(lastObj);
		}
	}
	Memman.prototype.showData = function( object ){
		var arr = [];
		for(var k in object){
			arr.push(object[k]);
		}
	};
	Memman.prototype.initBlock = function($p,arr){
		$p.find('.check').each(function(){
			var $this = $(this),value = $this.attr('value');
			$this.removeClass('checked').addClass('disabled');
			arr.forEach(function(ele){
				if(ele == value ){
					$this.removeClass('disabled');
					return true;
				}
			});
		});
	}
	Memman.prototype.getPath = function($target){
		var arr = [];
		while($target != null){
			var $value = $target.find('.checked');
			if($value.length > 0){
				var val = $value.attr('value');
				arr.push(val);
				if($target.prev().length > 0){
					$target = $target.prev();
				}else{
					$target = null;
				}
			}else{
				arr = [];
				break;
			}
		}
		arr.reverse();
		return arr;
	};

	Memman.prototype.createPath = function(data){
		var thiz = this;
		var arr = thiz.arr;
		var newmap = thiz.newmap;
		var pathObj = {};
		data.forEach(function(ele,index){
			var temp = pathObj,
				newobj = false,
				varr = [];
			for(var i=0;i<arr.length;i++){
				var key = newmap[i],
					value = ele[key];
				if(value in temp){
					temp = temp[value];
					if(i == arr.length -1){
						temp[ele[thiz.primaryKey]] = ele
					}
				}else{
					var valueobj = {};
					if(i == arr.length -1){
						var tttid = ele[thiz.primaryKey];
						valueobj[tttid] = ele;
					}
					var parent = pathObj;
					temp = valueobj;
					if(varr.length > 0){
						varr.forEach(function(path){
							parent = parent[path];
						});
						parent[value]= valueobj;
					}else{
						pathObj[value] = valueobj;
					}
				}
				varr.push(value);
			}
		});
		thiz.path = pathObj;
	};

	Memman.prototype.disabled = function($block){
		$block.find('.checked').removeClass('checked');
		$block.find('.check').addClass('disabled');
	};

	$.fn.extend({
		createFilter : function( opts ){
			var m = new Memman(opts.data || [],opts.key || 'id',$(this) ,opts.firstItem,opts.firstValue);
			m.view();
			//绑定点击事件
			$(this).on('click','.check:not(.checked)',function(ev){
				var $p = $(this).parent();
				var name = $p.attr('item'),value = $(this).attr('value');
				m.check( name , value);
			})
		}
	});
})(window);

//按照顺序进行渲染。
var data = [
{ "颜色": "红", "尺码": "大", "型号": "A","内存":"2g", "id": "3158054" },
{ "颜色": "红", "尺码": "中", "型号": "A","内存":"2g", "id": "3158054" },
{ "颜色": "红", "尺码": "小", "型号": "C","内存":"4g", "id": "3158054" },
{ "颜色": "红", "尺码": "大", "型号": "A","内存":"2g", "id": "3158055" },
{ "颜色": "红", "尺码": "大", "型号": "B","内存":"2g", "id": "3158054" },
{ "颜色": "白", "尺码": "中", "型号": "B","内存" :"4g", "id": "3133859" },
{ "颜色": "蓝", "尺码": "小", "型号": "C", "内存":"8g","id": "3516833" }
];

$(function(){
	$('.container').createFilter({
		key : 'id',
		data : data,
		firstItem : '颜色',
		firstValue : '红'
	});
});