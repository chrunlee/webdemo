/**
 * 物理弹球
 * @author chrunlee
 ***/

//设定一些默认参数
var _p = {
	//球的半径
	ballWidth : 20,
	ballColor : 'red',
	speed : 10,//移动速度- 垂直速度,每秒

};
byy.define(['jquery'],function( exports ){
	var bball = function( canvasId ,opts ){
		this.id = canvasId;
		this.ele = document.getElementById(canvasId);
		this.ctx = this.ele.getContext('2d');


		
		return this;
	}
	//生成一个球，并给定一个矩形宽高、速度、大小、颜色
	var ball = function(ctx,opts){
		this.opts = Object.assign(_p,opts);
		//球的初始位置信息
		this.pos = {
			x : this.opts.ballWidth,
			y : this.height - this.opts.ballWidth,
		};
		this.target = this.getRandom();

	}
	//获得一个随机的目标
	ball.prototype.getRandom = function(){
		// 获得一个初始的随机点
		var pot = Math.cell(Math.random()*this.width);
		return {
			y : this.ballWidth,
			x : pot <= this.ballWidth || pot > this.width-this.ballWidth ? 500 : pot
		}
	}
	//根据两个点，计算出下一个点
	ball.prototype.getNextPos = function(){
			
	}
	//向目标地点移动
	ball.prototype.move = function(){

	}
	//花球
	bball.prototype.drawBall = function(){
		var ctx = this.ctx;
		ctx.arc(100,100,_p.ballWidth,0,Math.PI*2);
		ctx.strokeStyle = _p.ballColor;
		ctx.fillStyle = _p.ballColor;
		ctx.stroke();
		ctx.fill();
	}
	//动起来
	bball.prototype.move =function(){

	}
	exports('bball',bball);
});