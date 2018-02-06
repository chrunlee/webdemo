/*拖拽操作*/
/**
常见的拖拽操作业务有：
1. 将某元素拖放到某个容器中
2. 将某元素与另外的元素进行互换
3. 将某元素拖拽进行排序
---可以会有多个不同的容器存在
**/
//------------------------正在慢慢完善
/***

支持的属性：
1. 指定拖拽元素
2. 指定类型-move,sort,exchange
3.
***/

var options = {
	elem : '',//jquery selector
	type : 'move',//sort exchange
	beforeMove : function(){//在推拽前，先监测该元素是否允许拖拽
		return true;
	},
	direct : 'xy',//拖拽方向，x轴，y轴，不限制
	//是否保留原有DOM
	retain : false,
	guideLine : 'xy',//是否生成插入辅助线，x方向，y方向，无，用于排序使用

};
var Drag = function( options ){
	this.elem = options.elem;
	this.$elem = $(options).elem;
}

Drag.prototype.start = function(){
	var thiz = this,opt = thiz.options;
	$('body').on('mousedown',opt.elem,function(ev){
		//绑定移动事件
		var $target = ev.currentTarget || ev.srcElement;
		var canMove = opt.beforeMove($target);
		canMove =null == canMove || undefined == canMove ? true : canMove;
		if(canMove){
			$(document)	
		}
		
	}).on('mouseup',thiz.elem,function(ev){

	})
}


$('body').on('mouseup','',function(){

})