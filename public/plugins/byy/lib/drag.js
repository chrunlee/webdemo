/*
	@company 博育云
	@site : www.boyuyun.cn
	@author boyuyun
*/

var options={elem:"",type:"move",beforeMove:function(){return!0},direct:"xy",retain:!1,guideLine:"xy"},Drag=function(a){this.elem=a.elem,this.$elem=$(a).elem};Drag.prototype.start=function(){var a=this,b=a.options;$("body").on("mousedown",b.elem,function(a){var c=a.currentTarget||a.srcElement,d=b.beforeMove(c);(d=null==d||void 0==d||d)&&$(document)}).on("mouseup",a.elem,function(a){})},$("body").on("mouseup","",function(){});