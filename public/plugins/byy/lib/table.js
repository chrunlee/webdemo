/****
 table 组件
 @Author lixun
 @since 2017年2月5日 11:29:54
 @version 1.0.1 : 增加表格如果数据为空的时候的信息展示。
 @version 1.0.2 : 增加排序相关的函数 getSort，用于在分页点击的时候获得排序的数据,关于排序相关的属性有：
 	tname : 't1',//用户表示表的别名
 	sort : function(){} 用来触发点击事件排序调用
 	order : 'asc' ,//默认排序的命令(废弃该属性)
 	sortNo : 1,//用来定义多个排序情况下的先后顺序
 	//所有以上属性必须要有sort 才能触发
 @version 1.0.3 : 增加点击行选中以及只能选择一个行记录和相关的点击行事件，相关属性如下：
 	singleSelect : false,//默认为false ，如果为true,则开启checkOnSelect的时候，只能选择一个
 	checkOnSelect : false,//默认为false ，如果为true,则点击行选中行内的input
 	onClickRow : function(obj){},//默认空函数，点击行的事件
 @version 1.0.4 : 增加排序个数控制，属性为：sortSingle : false,如果为true,则一次只排序一个字段
****/
byy.define(function( exports ){
	'use strict';
	/**
	参数：selector , striped ,data ,columns , border ,(width , border ,frozenColumn-未实现)
	column参数：column , name , align , width , formatter ,checked ,idField , filter ,
	
	**/
	var doc = window.document,tindex = 100,efn = function(){},
	eventsMap = {},//存放table的点击事件
	sortsMap = {},//存放排序数据
	idi = 100,//id开头同时对应 eventsMap
	dfcfg = {
		striped : false,//行背景交替显示
		singleSelect : false,//是否只能选中一个
		index : ++tindex,//当前表格的序号
		data : [],//数据
		sortSingle : false,//排序个数控制
		checkOnSelect : false,//是否点击行选中复选框
		onClickRow : function(){}//用户点击行

	},
	Table = function( opts ){
		
		if( !opts.selector ){
			byy.error('selector must in table config');
			return;
		}
		if( !opts.columns ){
			byy.error('columns must in table config');
			return;	
		}
		var newcfg = byy.extend(dfcfg,opts);
		newcfg.target = $(newcfg.selector);
		Table.create( newcfg );
		
		return new Table.prototype.init(newcfg);
	}
	Table.prototype = {
		version : '1.0.0',
		constructor : Table,
		init : function( cfg ){
			this.cfg = cfg;
			return this;
		},
		loadData : function( data ){
			var tcfg = this.cfg;
			tcfg.data = data;
			this.cfg = tcfg;
			Table.create(tcfg);
		},
		reload : function(  ){
			Table.create( this.cfg );
		},
		getSort : function(){
			return Table.getSort(this.cfg.selector);
		}
	}
	Table.fn = Table.prototype;
	Table.prototype.init.prototype = Table.fn;
	
	byy.extend(Table,{
		create : function( cfg ){
			Table.beauty( cfg );
			Table.getHead(cfg);
			Table.getBody( cfg );
			Table.bindEvent(cfg);
		},
		//获得排序相关的字段以及排序命令
		getSort : function( selector ){
			var tempArr = sortsMap[selector];//排序原则，存在的排序，不存在的后排
			var hasNoArr = [],noNoArr = [];
			if(null != tempArr && tempArr.length > 0){
				for(var i=0;i<tempArr.length;i++){
					var tNode = tempArr[i];
					if(tNode.sortNo){
						hasNoArr.push(tNode);
					}else{
						noNoArr.push(tNode);
					}
				}
			}
			//排序
			if(hasNoArr.length > 0){
				hasNoArr.sort(function(a,b){
					return a.sortNo > b.sortNo;
				});
			}
			var rsArr = hasNoArr.concat(noNoArr);
			return rsArr;
		},
		bindEvent : function(cfg){
			$('body').off('change','input[id^=selectAll]').on('change','input[id^=selectAll]',function(){
				var $ipt = $(this),f = $ipt.prop('checked'),$t = $ipt.parent().parent().parent().parent(),$target = $t.find('th:not(.byy-table-fro),td:not(.byy-table-fro)').find('[type="checkbox"]:not(.hide)');
				$target.prop('checked',f);
			});
			$('body').off('click','th[id^="sort_"]').on('click','th[id^="sort_"]',function(){
				var $this = $(this),tid = $this.attr('id');
				var sortEles = $this.parent().find('[id^="sort_"]');
				var rts = [];
				sortEles.each(function(){
					var $ththis = $(this);
					var name = $ththis.attr('sortname'),
						tname = $ththis.attr('tname') ||'',
						sortNo = $ththis.attr('sortno'),
						nowcls = $ththis.attr('class'),
						nowele = $ththis.attr('id') == tid ,
						nextcls = nowele ? (nowcls.indexOf('nosort') > -1 ? 'asc' : ( nowcls.indexOf('asc') > -1 ? 'desc' : 'asc' )) : (cfg.sortSingle ? 'nosort' : nowcls);
					if(byy.trim(nextcls) != 'nosort'){
						rts.push({
							order : nextcls,
							sort : name,
							tname : tname,
							sortNo : sortNo
						});	
					}
					$ththis.attr('class',nextcls);
				});
				//更换样式
				// byy($this).toggleChecked('asc','desc')
				//保存rts
				sortsMap[cfg.selector] = rts;
				if(eventsMap[tid] && byy.isFunction(eventsMap[tid])){
					eventsMap[tid]( rts.length > 1 ? rts : ( rts.length > 0 ? rts[0] : []) );
				}
			});
			//点击行事件
			$('body').find(cfg.selector).off('click','tbody>tr').on('click','tbody>tr',function(ev){
				//1.
				var $this = $(ev.currentTarget);
				if(cfg.checkOnSelect){
					//更换样式，如果是只能选择一个，则要将其他已经选中的去掉
					if(cfg.singleSelect){
						//获得当前的状态
						var hasC = $this.hasClass('selected');
						$(cfg.selector).find('input[name^="table-checkbox"]:checked').prop('checked',false);
						$(cfg.selector).find('.selected').removeClass('selected');
						if(hasC){
							$this.toggleClass('selected');
							$this.find('input[name^="table-checkbox"]').prop('checked',true);
						}
					}	
					$this.toggleClass('selected');
					//将该行的复选框选中
					$this.find('input[name^="table-checkbox"]').prop('checked',$this.hasClass('selected'));
					byy.stope(ev);
				}
				//继续执行绑定的事件，并传参
				if(cfg.onClickRow){
					var nodeValue = $this.data('obj')||{};
					cfg.onClickRow(nodeValue);
				}
			});
		},
		beauty : function( opts ){
			var target = opts.target ? opts.target : $(opts.selector);
			opts.striped === true ? target.attr('byy-even','even') : '';
			var skin = ['','row','line','nob'];
			target.attr('byy-skin',skin[byy.isNull(opts.border) ? 0 : (opts.border > 3 ? 0 : opts.border)]);
			opts.width ? target.css('width',opts.width+'px') : '';
		},
		getHead : function( opts , isNotRenderHead ){
			//start get Table Head
			var cache = {index : opts.index || ++tindex},col = opts.columns,htmls = [];
			htmls.push('<thead><tr>');
			if(byy.isArray( col )){
				var tempSortArr = [];
				col.forEach(function( ele , index ){
					//开始判断
					var style = (ele.width ? 'width:'+(parseInt(ele.width,10)-30)+'px;' : '' )+( ele.align ? 'text-align:'+ele.align+';' : '');
					if( "checkbox" in ele){
						if( ele.checkbox === true ){//显示复选框
							htmls.push('<th class="'+(ele.hidden === true ? ' hide' : '')+'" style="'+style+'" ><input type="checkbox" id="selectAll'+ (cache.index) +'" /> </th>');
						}
					}else{//nomal th
						if("sort" in ele){
							idi ++;
							eventsMap['sort_'+idi] = ele["sort"];
							var sortCls =  'nosort';
							if(sortsMap[opts.selector]){
								tempSortArr = sortsMap[opts.selector];
								//循环查找cls
								if(null != tempSortArr && tempSortArr.length > 0){
									for(var i=0;i<tempSortArr.length;i++){
										var tempSortObj = tempSortArr[i];
										if(tempSortObj.sort == ele.column){
											sortCls = tempSortObj.order;
											break;
										}
									}
								}
							}
							htmls.push('<th id="sort_'+idi+'" class="'+( ele.hidden === true ? ' hide' : '')+' '+sortCls+'" sortno="'+(ele.sortNo)+'" tname="'+(ele.tname || '')+'" sortname="'+(ele.column || '')+'" style="'+style+'">'+(ele.name||'')+'<span class="byy-edge"></span></th>');	
						}else{
							htmls.push('<th class="'+( ele.hidden === true ? ' hide' : '')+'" style="'+style+'">'+(ele.name||'')+'</th>');	
						}
					}
				});
			}
			htmls.push('</tr></thead>');
			!!!isNotRenderHead && Table.renderHead( opts.target ? opts.target : $(opts.selector) , htmls );
			return htmls;
		},
		renderHead : function( target, htmls ){
			target.find('thead').length > 0 ? (target.find('thead').remove()) : '';
			target.prepend(byy.isArray( htmls ) ? htmls.join('') : htmls+'');
		},
		getValue : function( obj , name ){
			if(!name){return '';}
			var arr = name.split('.');
			var temp = obj;
			for(var i=0,max=arr.length;i<max;i++){
				var ele = arr[i];
				if( !byy.isNull(temp[ele])  ){
					temp = temp[ele];
				}else{
					temp = '';
					break;
				}
			}
			return temp;
		},
		getBody : function( opts ){
			var data = opts ? opts.data||[] : [],col = opts.columns || [],msg = opts ? opts.msg||'暂无数据' : '暂无数据';
			var tbody = $('<tbody></tbody');
			var frozenColumnIndex = opts.frozenColumn === true ? 1 : (opts.frozenColumn === false ? 0 : opts.frozenColumn);
			if(data.length > 0){
				data.forEach(function( obj ){
					var $tr = $('<tr></tr>');
					$tr.data('obj',obj);
					col.forEach( function( ele,index ){
						var style = ' style="' + (ele.align ? ' text-align:'+ele.align+'; ' : '' ) + ( ele.width ? 'width:'+(parseInt(ele.width,10)-30)+'px;' : '') + '"';
						if("checkbox" in ele){//复选框
							var value = byy.isArray(obj) ? obj[parseInt(ele.idField||'0',10)] : obj[ele.idField || 'id'];
							var show = ele.filter ? ele.filter( obj ) : true;
							var temp = '<td class="'+(ele.hidden === true ? ' hide' : ' ')+'" '+style+'><input type="checkbox" class="'+(show ? '' : 'hide')+'" name="table-checkbox-'+(opts.index||index)+'" value="'+value+'" /></td>';
							$tr.append(temp);
							
						}else if("column" in ele){//普通内容
							var val = Table.getValue( obj, ele.column );
							var temp = '<td class="'+( ele.hidden === true ? ' hide' : '')+'" '+style+' >'+(ele.formatter ? ele.formatter( val,obj ) : val)+'</td>';
							$tr.append(temp);
							
						}
					});
					tbody.append($tr);
				});
			}else{
				var len = col.length;
				tbody.append('<tr><td style="height:100px;text-align:center;color:#999;" colspan="'+len+'">'+msg+'</td></tr>');
			}
			
			Table.renderBody( opts.target ? opts.target : $(opts.selector) , tbody);
			if(frozenColumnIndex > 0){
				Table.frozenTable( opts.target ? opts.target : $(opts.selector ), frozenColumnIndex );
			}
		},
		renderBody : function( target , htmls){
			target.find('tbody').length > 0 ? (target.find('tbody').remove()) : '';
			target.append(byy.isArray( htmls ) ? htmls.join('') : htmls);
		},
		frozenTable : function( target ,index ){
			target.find('tr').each(function(){
				var $tr = $(this);
				$tr.find('th,td').each(function( i ){
					var $ele = $(this),nodeName = $ele[0].nodeName,w = $ele.width(),content = $ele[0].outerHTML;
					if( i < index){
						//处理
						$ele.after($(content).addClass('byy-table-place'));
						$ele.addClass('byy-table-fro')
					}
				});
			});
		}
	});

	Table.fn.getHead = function(){
		Table.getHead(this.cfg);
	};
	Table.fn.getBody = function(){
		Table.getBody(this.cfg);
	};
	Table.fn.selectAll = function(flag){
		var $t = this.cfg.target
		var $target = $t.find('th:not(.byy-table-fro),td:not(.byy-table-fro)').find('[type="checkbox"]:not(.hide)');
		$target.prop('checked',byy.isNull(flag) ? true : flag);
	};
	!window.$ ?
	byy.require('jquery',function(){
		exports('table',Table);		
	})
	:
	exports('table',Table);
	
});