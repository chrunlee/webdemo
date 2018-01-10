var main = {
	config : {
		//功能中通用的参数
	},
	list : {
		bindEvent : function(){
			//1.
			$('.byy-btn').off('click').on('click',main.list.test1);
			//2.事件绑定2
			$('.test').on('click',main.list.test2);
			//3.事件绑定3
			$('.test2').on('click',main.list.test3);
		},
		test3 : function(){
			// var obj = {
			// 	name : '张三',
			// 	sex : 'male',
			// 	age : 28,
			// 	avatar : 'https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=2156840698,1797382580&fm=117&gp=0.jpg'

			// };

			$.ajax({
				url : 'http://byyui.com/byy/src/lib/page.js',
				// url : '/xx_xx.do'
				type : 'POST',//POST
				data : {
					id : '111',
					name : 'aaa',
					page : 2,
					size : 10
				},
				success : function( responseText ){
					console.log(responseText);//string
					//json --> 
					var obj = byy.json(responseText);
					var html = '<label for="">姓名:</label>'+(obj.name)+''+
						'<br />'+
						'<label for="">性别:</label>'+(obj.sex)+''+
						'<br />'+
						'<label for="">头像:</label>'+
						'<img src="'+(obj.avatar)+'" alt="" style="width:100px;height:100px;">';
					//dom 操作
					$('#test2').append(html);
				}
			})	
		},
		test2 : function(){
			//1.给test div 增加一个边框和一个黑色背景
				$('#test').css({
					'border':'1px solid red',
					'background-color':'black',
					'height' : '50px',
					'color' :'white'
				})
				.text('hello wolrd');
				// $('#test').css('background-color','black');
				// $('#test').css('height','50px');
				//2. 给test div 写入一个hello world 文本
				// $('#test').text('hello world');
		},
		test1 : function(){
			//2.赋值notMe的内容到 mydiv
			//2.1 获得notMe的 html内容
			// var html = $('#notMe').html();//get
			//2.2 添加内容到mydiv
			// $('#myDiv').text($('#notMe').text());

			//3.1 获得值
			var name = $('#select').val('3');
			console.log(name);
		}
	},
	form : {},
	tool : {}
};




byy.require(['jquery','win','i18n'],function(){

	//执行 绑定
	main.list.bindEvent();

	//调用方式
	//1.直接使用--工具类
	var str = '请输入至少{0}个字符';
	var str2= byy.formatStr(str,100);
	// byy.win.msg(str2);

	//2.
	main.list.bindEvent();//
});
// main.list.bindEvent();

// var hello = function(str,fn){
// 	console.log(str);
// 	//打印后，想继续执行一些其他个性化的操作。
// 	fn();
// }

// var world = function(){
// 	console.log('world');
// }
// var world2 = function(){
// 	console.log('world2');
// }
// //调用
// hello('abc',function(){
// 	console.log('world');
// });


// var v1 = {name : 'test',age : '28'}
// var v1 = '{"name":"test","age":"28"}';
// hello({name : 'test',age : '28'})


//1.require

byy.require(['win','inputsearch'],function(){
	// byy.win.xxx
	byy.inputsearch.select();
})

