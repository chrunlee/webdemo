/***
 * 星级评分
 * @author lixun
 * @created on 2017年6月14日 12:46:25
 * @version 1.0.0
 ***/
//插件特点
/**
1. 允许自定义星星的个数，默认 5
2. 允许自定义星星的颜色
3. 允许自定义半个星星还是全的星星
4. 指定容器渲染
5. 只读模式
6. 动态赋值
7. 提供方法获取值
8. 选中后回调事件
9. 分数自定义设置
10.可配置的名称
11. 鼠标经过的事件
12. 星星的类型，是图片还是字体图标，默认字体图标
**/
//HTML DOM j结构

byy.define('jquery',function( exports ){

	var Raty = function( opts ){
		return new this.fn.init(opts);
	}

	Raty.prototype = Raty.fn = {
		init : function( opts ){
			//处理选项
			return this;
		}
	};

	Raty.fn.init.prototype = Raty.fn;

	byy.extend(Raty,{
		//默认参数配置
		defaults : {
			count : 5,											//星星的个数
			color : 'yellow',									//星星的颜色
			half : false,										//是否开启半的选择
			score : 0,											//星星的当前分数
			minScore : 0,										//星星最小的分值
			maxScore : 5,										//星星的最大分值
			readOnly : false,									//是否只读
			names : ['差','不好','一般','好','很好'],			//从第一个开始
			onClick :function(){},
			onMouseover : function(){},
			selector : 'body',
			starOff :'',
			starOn :'',
			starHalf : '',
			starType : 'i'//img

		}
	});

	byy.extend(Raty.fn,{

		/*渲染容器样式*/
		render : function(){

		}
	});
	exports ( 'raty' , raty);
});