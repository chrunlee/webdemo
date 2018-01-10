/*
	@company 博育云
	@site : www.boyuyun.cn
	@author boyuyun
*/

byy.define("jquery",function(a){var b=function(a){return new this.fn.init(a)};b.prototype=b.fn={init:function(a){return this}},b.fn.init.prototype=b.fn,byy.extend(b,{defaults:{count:5,color:"yellow",half:!1,score:0,minScore:0,maxScore:5,readOnly:!1,names:["差","不好","一般","好","很好"],onClick:function(){},onMouseover:function(){},selector:"body",starOff:"",starOn:"",starHalf:"",starType:"i"}}),byy.extend(b.fn,{render:function(){}}),a("raty",raty)});