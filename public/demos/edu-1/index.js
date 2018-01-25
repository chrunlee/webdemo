/**
 * 首页相关操作
 */
var base = '';
var Index = {
	//配置
	config : {

		//app list 是否正在滑动中
		appSlip : false
	},
	//事件
	events : {
		//更换皮肤颜色
		changeSkin : function(){
			var name = $(this).data('name');
			var $skin = $('#byycss-index-skin');
			var href = base+'./css/'+name+'.css';
			$skin.remove();
			byy.link(href,'index-skin');
		},
		//应用管理界面切换
		manageApp : function(){
			var $this = $(this);
			$this.parent().toggleClass("myappbox-title-small").addClass("transition");
			$this.parent().parent().toggleClass("myappbox-small").addClass("transition");
			$this.parent().parent().find(".appline-box").toggleClass("app-line-small").addClass("transition");
			byy($this.parent().parent().find('.appicobox')).toggleChecked('col-xs-2','col-xs-1');
			$('.appstore-title').addClass('inmanage');
			$('.myappbox-contain').addClass('inmanage');
			$('.slipbtn').addClass('inmanage');
			$('.app-list').css('top','0px');//还原
			//内容修改
			$this.html('<i class="setting-ico"></i>保存修改');
			$this.attr('byy-filter','saveApp');
			//下方app列表增加添加按钮
			var $tabBox = $('.tabbox'),$appLi = $tabBox.find('.appli');
			$appLi.append('<i class="byyicon icon-plus add-app" byy-filter="addApp"></i>');
			//移除点击事件
			$('.app-list').find('.appicobox').attr('byy-filter','');
			$('.appline-box').css({
				'border' : '1px dashed #eee',
				'box-sizing' : 'border-box'
			});
			Index.drag();//拖拽排序延迟处理

		},
		//保存修改后的app列表
		saveApp : function(){
			var $this = $(this);
			$this.parent().toggleClass("myappbox-title-small").addClass("transition");
			$this.parent().parent().toggleClass("myappbox-small").addClass("transition");
			$this.parent().parent().find(".appline-box").toggleClass("app-line-small").addClass("transition");
			byy($this.parent().parent().find('.appicobox')).toggleChecked('col-xs-2','col-xs-1');
			$('.appstore-title').removeClass('inmanage');
			$('.myappbox-contain').removeClass('inmanage');
			$('.slipbtn').removeClass('inmanage');
			//内容修改
			$this.html('<i class="setting-ico"></i>管理应用');
			$this.attr('byy-filter','manageApp');
			$('.appline-box').attr('style','');
		},
		//删除app
		removeApp : function(ev){
			var $this = $(this),$app = $this.parent().parent();
			var appId = $app.data('id'),appName = $app.data('name'),appCode = $app.data('code');
			$app.remove();
			byy.stope(ev);
		},
		//添加app到上方
		addApp : function(ev){
			var $this = $(this),$app = $this.parent(),appId = $app.data('id'),appName = $app.data('name'),appCode = $app.data('code');
			var imgSrc = $app.find('img').attr('src');
			if($('.app-list').find('.appicobox[data-id="'+appId+'"]').length > 0){
				byy.win.msg('已存在');
				byy.stope(ev);
				return;
			}
			//组装html 
			var html = '<div class="appicobox col-xs-1" data-id="'+(appId)+'" data-name="'+(appName)+'" data-code="'+(appCode)+'" byy-filter="openBar"><div><img src="'+(imgSrc)+'" alt=""><i class="delete-ico" byy-filter="removeApp"></i></div><p>'+(appName)+'</p></div>';
			$('.app-list').append(html);
			byy.stope(ev);
		},
		//展示首页
		showDesk : function(){
			$('.index-dom').removeClass('hide');
			$('.app-dom').addClass('hide');
			byy('header').toggleChecked('index-header','app-header','index-header');
			$('header').find('.byy-nav').removeClass('byy-nav-nobar');
			$('.index-frame').addClass('hide');
			$('.index-body').removeClass('hide');
		},
		showApp : function(){
			$('.app-dom').removeClass('hide');
			$('.index-dom').addClass('hide');
			byy('header').toggleChecked('index-header','app-header','app-header');
			$('header').find('.byy-nav').addClass('byy-nav-nobar');
			$('.index-frame').addClass('hide');
			$('.index-body').removeClass('hide');
			//处理app-list
			Index.tools.renderSlipBtn();
		},
		//顶部点击（除桌面、应用商店除外）
		TOPBAR : function(){
			//1.展示frame
			Index.events.showApp();
			var $this = $(this),appCode = $this.attr('appcode');
			Index.tools.showFrame(appCode);
		},
		//关闭、移除
		CLOSEBAR : function( ev ){
			var $this = $(this).parent().parent();
			var appcode = $this.attr('appcode');
			
			//找到前一个
			var $show = null;
			if($this.next('.byy-nav-item').length > 0){

				if($this.next('.byy-nav-item').hasClass('index-nav-more')){
					$show = $this.next('.byy-nav-item').find('li').eq(0);
				}else{
					$show = $this.next();	
				}
			}else if($this.prev('.byy-nav-item').length > 0){
				$show = $this.prev();
			}else if($this.parent().hasClass('byy-nav-child')){
				$show = $this.next('li').length > 0 ? $this.next('li') : ( $this.prev('li').length > 0 ? $this.prev('li') : $this.parent().parent().prev());
			}
			$this.remove();
			//移除frame
			$('.index-frame-item[appcode="'+appcode+'"]').remove();
			Index.beautyNav();
			if(!$show || $show.attr('byy-filter') == 'showApp'){
				$('.byy-nav-item[byy-filter="showApp"]').click();
			}else{
				var appcode = $show.attr('appcode');
				Index.tools.showFrame(appcode);
			}
			byy.stope(ev);
		},
		//返回顶部
		backTop : function(){
			Index.tools.scrollTo(0);
		},
		//滚动项目
		scrollItem : function(){
			var h = $('.section:eq('+($(this).index()-1)+')').offset().top;
			Index.tools.scrollTo(h + 50);
		},
		//变更国际化语言
		changeLanguage : function(){
			var language = $(this).data('language');
			$(this).parent().find('.active').removeClass('active');
			$(this).addClass('active');
			//获得language
			console.log(language);
		},
		//翻动 APP 列表
		slipApp : function(){
			var $this = $(this),isLeft = $this.hasClass('left-slipbox'),isDisabled = $this.hasClass(isLeft ? 'left-slip-disable' : 'right-slip-disable');
			if(isDisabled || Index.config.appSlip){
				return;
			}
			Index.config.appSlip = true;
			//获得当前距离
			var $list = $('.app-list'),top = $list.css('top');
			top = top.replace('px','');
			top = parseInt(top,10);
			var appHeight = $('.appicobox:eq(0)').height()+10;
			var toHeight = (isLeft ? appHeight : appHeight * -1);
			if(toHeight > 0){
				toHeight = 0;
			}
			if(toHeight <= ($list.height() - appHeight) *-1){
				toHeight = ($list.height() - appHeight)*-1
			}
			$list.animate({'top':top + (isLeft ? appHeight : appHeight * -1)},300,function(){
				Index.tools.renderSlipBtn();	
				Index.config.appSlip = false;
			});
		},
		//打开应用菜单...
		openBar : function(){
			//判断是否在编辑状态，如果在编辑状态，则忽略
			console.log('打开app应用');
			var $this = $(this);
			var appId = $this.data('id'),
				appName = $this.data('name'),
				appCode = $this.data('code');
			//查找是否有code已经存在
			if($('.index-nav li[appcode="'+appCode+'"]').length > 0){
				Index.tools.showFrame(appCode);
				// var $nowItem = $('.index-nav li[appcode="'+appCode+'"]');
				// $('.index-nav li.byy-this').removeClass()
				return;
			}
			var lindex = byy.win.load(1);
			//远程请求获得菜单
			// $.ajax({
			// 	url : base+'menu.do',
			// 	type : 'post',
			// 	data : {id : appId},
			// 	success : function(res){
					var res = [
							{"appId":"1","appName":"","children":[],"createUserId":"","description":"","i18nName":"","icon":"","id":"1","menuName":"选课活动"+byy.guid(),"openModel":"","openModelName":"","pId":"","pName":"","schoolId":"","seq":0,"state":"","stateName":"","type":"","typeName":"","updateTime":null,"updateUserId":"","url":"/Resource_toByyResourceList.do"},
							{"appId":"1","appName":"","children":[],"createUserId":"","description":"","i18nName":"","icon":"","id":"3","menuName":"申报课程","openModel":"","openModelName":"","pId":"","pName":"","schoolId":"","seq":0,"state":"","stateName":"","type":"","typeName":"","updateTime":null,"updateUserId":"","url":"/BaseCourseManage_toApplyCourseList.do"},
							{"appId":"1","appName":"","children":[],"createUserId":"","description":"","i18nName":"","icon":"","id":"2","menuName":"学生选课","openModel":"1","openModelName":"","pId":"","pName":"","schoolId":"","seq":1,"state":"1","stateName":"","type":"0","typeName":"","updateTime":null,"updateUserId":"","url":"/StudentCourseManage_toStudentActivityList.do"},
							{"appId":"1","appName":"","children":[],"createUserId":"","description":"","i18nName":"","icon":"","id":"4","menuName":"选课统计","openModel":"","openModelName":"","pId":"","pName":"","schoolId":"","seq":0,"state":"","stateName":"","type":"","typeName":"","updateTime":null,"updateUserId":"","url":"/CourseCountManage_toCourseCountList.do"}
						  ];
					var resobj = byy.json(res);
					//获得对应的信息，菜单，第一个打开的地址
					byy.win.close(lindex);
					//根据信息获得标题,frame
					var appInfo = Index.tools.getAppInfoByJson(appCode,appName,resobj);
					//渲染
					if(appInfo.success == true){
						var topBar = Index.tools.getTopBarHtml(appCode,appName,0);
						$('.index-nav .nav-right').before(topBar);
						$('.index-frame').append(appInfo.frame);
						Index.beautyNav();
						Index.tools.showFrame( appCode );
					}
			// 	}
			// });
		}

	},
	//美化顶部
	beautyNav : function(){
		var thiz = this;
		var $nav = $('.index-nav'),$header = $nav.parent(),$right = $header.find('.pull-right'),$items = $nav.find('.byy-nav-item,.byy-nav-child li');
		//获得整体宽度
		var allWidth = $header.width(),leftWidth = $('.index-nav .byy-nav-item').eq(0).offset().left,rightWidth = $right.width() + 40,
			inputWidth = 0,//固定宽度
			miniWidth = $('.index-nav .byy-nav-item').eq(2).width();
		var itemWidth = 0;//目前所有的选项卡的宽度和,默认小宽度 95
		$items.each(function(){
			if(!$(this).hasClass('index-nav-more')){
				itemWidth += $(this).width() + 2 ;
			}
		});
		//如果加起来超过了总宽度，则需要设置
		if(itemWidth + leftWidth + rightWidth + inputWidth  > allWidth){
			//把最后面的那个干掉
			if($nav.find('.index-nav-more').length == 0){
				$nav.find('.nav-right').before('<li class="byy-nav-item index-nav-more"><a href="javascript:;">More</a><ul class="byy-nav-child"></ul></div>');
			}
			var $ul= $nav.find('.index-nav-more').find('ul');
			var $clone = $($items.get($items.length - 1)).clone();
			var appcode = $clone.attr('appcode'),html = $clone.html(),appname = $clone.attr('appname');
			var lihtml = Index.tools.getTopBarHtml(appcode,appname,1);
			var isSelected = $clone.hasClass('selected');
			$ul.append(isSelected ? $(lihtml).addClass('selected') : lihtml);
			$($items.get($items.length -1)).remove();
		}else{
			//判断是否有more
			if($nav.find('.index-nav-more').length > 0){
				//检查是否还有LI标签，如果有则提出来一个？试试
				var $more = $nav.find('.index-nav-more');
				var $ul = $more.find('ul');
				var $lis = $ul.find('li');
				if($lis.length > 0){
					var $firli = $($lis.get(0));
					var appcode = $firli.attr('appcode'),appname = $firli.attr('appname');
					var topBarHtml = thiz.tools.getTopBarHtml(appcode,appname,0);
					$more.before(topBarHtml);
					$firli.remove();
				}
				if($ul.find('li').length == 0){
					$nav.find('.index-nav-more').remove();
				}
			}
		}
		$('.index-nav .byy-nav-bar').remove();
		byy('.index-nav').nav();
		//处理二级菜单
		Index.beautyMenu();

	},
	beautyMenu : function(){

		var $item = $('.index-nav .byy-nav-item.byy-this');
		var appcode = '';
		if($item.length > 0){
			appcode = $item.attr('appcode');
		}else if($('.index-nav-more li.selected').length > 0){
			appcode = $('.index-nav-more li.selected').attr('appcode');
		}
		if(appcode != ''){
			
			//计算宽度
			
			
			var appCode = $item.attr('appcode');
			
			var $ul = $('.index-frame-item[appcode="'+appcode+'"]').find('ul.byy-nav');
			var $first = $ul.find('li:eq(0)'),$last = $ul.find('li:last-child');
			var $lis = $ul.find('li');
			var ulWidth = $ul.width();
			var liWidth = 0;
			$lis.each(function(){
				liWidth +=$(this).width();
			});
			if(liWidth >= ulWidth){
				var maxWidth = liWidth - ulWidth;
				var hasRender = $ul.find('.byyicon.menuarrow').length > 0 ? true : false;
				if(!hasRender){
					var leftId = byy.guid();
					var rightId = byy.guid();
					$ul.prepend('<i class="byyicon icon-arrow-left" id="'+leftId+'" style="display:inline-block;width:20px;height:40px;z-index:100;background-color:#eee;left:0px;position:absolute;font-size:20px;cursor:pointer;"></i>');
					$ul.append('<i class="byyicon icon-arrow-right" id="'+rightId+'" style="display:inline-block;width:20px;height:40px;z-index:100;background-color:#eee;right:0px;position:absolute;font-size:20px;cursor:pointer;"></i>');
					
					$('#'+leftId).on('click',function(){
						//向左移动左侧的位置，但是不能超过最右侧
						var nowLeftStr = $first.css('margin-left') || '0px',
							nowLeft = Math.abs(parseInt(nowLeftStr.replace('px',''),10));
						var singleWidth = $first.width();
						var finalLeft = 0;
						if(nowLeft + singleWidth > maxWidth){
							finalLeft = maxWidth;
						}else{
							finalLeft = nowLeft + singleWidth;
						}
						$first.css('margin-left',(finalLeft*-1)+'px');
					});
					$('#'+rightId).on('click',function(){
						var nowLeftStr = $first.css('margin-left') || '0px',
							nowLeft = Math.abs(parseInt(nowLeftStr.replace('px',''),10));
						var singleWidth = $first.width();
						var finalLeft = nowLeft;
						if(nowLeft - singleWidth >= 0){
							finalLeft = nowLeft - singleWidth;
						}else{
							finalLeft = 0;
						}
						$first.css('margin-left',(finalLeft*-1)+'px');
					});
				}
			}
		}
	},
	drag : function(){
		console.log('bind drag')

		$('body').on('mousedown','.appicobox',function(ev){

			//移动
			console.log('drag');
			ev.preventDefault && ev.preventDefault();
			byy.stope(ev);
			/***
			1.在当前位置替换temp
			2.生成clone ,绝对定位
			3.mousemove --> 更新定位
			4.获得要插入的dom
			5.处理结果
			
			**/

			var delayTime = 200;//延时处理

			var startMove = false;
			var $nowApp = $(this),$nowPre = $nowApp.prev(),$nowNext = $nowApp.next();
			var $nowClone = $nowApp.clone();
			$nowApp.remove();
			//
			$nowClone.addClass('movebox').css({
				'position':"fixed",
				'overflow' : 'hidden',
				'width' : '100px',
				'z-index':'10'
			}).attr('id','tempapp');
			var x = ev.pageX,y = ev.pageY;
			$nowClone.css({
				'left' : x - 50,
				'top' : y-70
			});
			$('body').append($nowClone);
			//绑定移动
			$(document).on('mousemove','body',function(ev2){
				//更新位置
				startMove = true;
				var evX = ev2.pageX,evY = ev2.pageY;
				$nowClone.css({
					'left' : evX - 50,
					'top' : evY-70
				});
			});

			$(document).on('mouseup','body',function(ev2){
				//获得位置
				var evx = ev2.pageX,evy = ev2.pageY;
				if(startMove){
					startMove = false;
					//获得所有的appico ,然后判断offset 应该在哪个app里面
					var $insert = $nowClone.clone().attr('style','').attr('id','');
					$nowClone.remove();
					//获得目标
					var $appList = $('.app-list').find('.appicobox');
					if($appList.length > 0){
						var pos = [];
						$appList.each(function(){
							var oset = $(this).offset();
							var height = $(this).height(),
								width = $(this).width();
							oset.right = oset.left + width;
							oset.width = width;
							oset.ele = $(this);
							oset.bottom = oset.top + height;
							pos.push(oset);
						});
						//循环判断
						var inControl = false,$target = null,isBefore = false;
						pos.forEach(function(item){
							if(evx > item.left && evx < item.left + item.width/2 && evy > item.top && evy < item.bottom){
								$target = item.ele;
								isBefore = true;
								inControl = true;
							}else if(evx > item.left+ item.width/2 && evx < item.right && evy > item.top && evy < item.bottom){
								$target = item.ele;
								isBefore = false;
								inControl = true;
							}
						});
						if(!inControl){
							//回到原处
							if( $nowPre.length >0 ){
								$nowPre.after($insert);
							}else if($nowNext.length > 0){
								$nowNext.before($insert);
							}else{
								$('.app-list').append($insert);	
							}
						}else{
							if(isBefore){//前面
								$target.before($insert);
							}else{
								$target.after($insert);
							}
						}
					}else{
						$('.app-list').append($insert);	
					}
					
					delete $insert;
					delete $nowClone;
				}else{
					//没有移动
					//获得所有的appico ,然后判断offset 应该在哪个app里面
					var $insert = $nowClone.clone().attr('style','').attr('id','');
					$nowClone.remove();
					if($nowPre.length >0){
						$nowPre.after($insert);
					}else if($nowNext.length > 0){
						$nowNext.before($insert);
					}else{
						$('.app-list').append($insert);	
					}
					delete $insert;
					delete $nowClone;
				}
				//解绑
				$(document).off('mousemove','body');
				$(document).off('mouseup','body');
			});

		});
	},
	bind : function(){
		//点击事件
		$('body').on('click','[byy-filter]',function(ev){
			var $this = $(this),type = $this.attr('byy-filter');
			type && Index.events[type] && Index.events[type].call($this,ev);
		});
		//背景图替换
		$('.imgbox').each(function(){
        	$(this).css('background-image','url('+$(this).attr('src')+')');
        });
        //页面滚动处理
        $(window).scroll(Index.tools.showRightByHeight);
	},
	tools : {
		getAppInfoByJson : function( appcode,appname,resobj ){
			var res = {
				success : false,
				tab : '',
				menu : '',
				frame : ''
			};
			if(null == resobj || resobj.length == 0){
				byy.win.msg('您当前的身份没有权限操作此菜单...');
				return res;
			}
			var activeMenuId = '';
			var firstNode = resobj[0];
			var basePath = base;
			var firstSrc = '';
			var activeSrc = firstNode.url||'';
			if(activeSrc == '' || activeSrc == 'parent'){
				basePath =  firstNode ? (firstNode.children && firstNode.children.length >0 ? firstNode.children[0].domain : basePath) : basePath;
				basePath = basePath == null || basePath == undefined ? base : basePath;
				firstSrc =  firstNode ? (firstNode.children && firstNode.children.length >0 ? firstNode.children[0].url : '' ) : '';
				activeMenuId = firstNode ? (firstNode.children && firstNode.children.length > 0 ? firstNode.children[0].id : '') : '';
			}else{
				firstSrc = firstNode.url;
				activeMenuId = firstNode.id;
				firstSrc = (firstSrc && firstSrc.lastIndexOf('?')>-1 )? (firstSrc+'&mid='+firstNode.id):(firstSrc+'?mid='+firstNode.id);
			}
			if(resobj[0].open == 'true' || resobj[0].open == true){
				window.open(basePath+firstSrc);
				return res;
			}else{
				//根据菜单获得menu
				res.success = true;
				res.frame = $('<div class="index-frame-item byy-clear selected" appcode="'+appcode+'"></div>');
				var menuHtml = '<div class="index-frame-nav"><ul class="byy-nav light byy-nav-nobar byy-nav-small body-wrap">';
				for(var i=0;i<resobj.length;i++){
					var menu = resobj[i];
					var menuName = menu.menuName, menuSrc = menu.url,menuId = menu.id,childrens = menu.children || [],mbase = base,open = menu.openModel=="inner"?"self":"_blank";
					menuHtml += '<li byy-filter="OPENFRAME" appcode="'+appcode+'" class="byy-nav-item '+(activeMenuId == menuId ? ' byy-this' : '')+'" ><a href="javascript:;" open="'+open+'" data-src="'+(mbase+menuSrc)+'">'+(menuName)+'</a>';
					//循环二级
					if(childrens.length > 0){
						var childHtml = '<ul class="byy-nav-child">';
						for(var m = 0;m<childrens.length;m++){
							var child = childrens[m];
							var cmenuName = child.menuName,cmenuSrc = child.url,cmenuId = child.id,copen = child.open,cbase = child.domain == '' || !child.domain ? base : child.domain;
							childHtml += '<li byy-filter="OPENFRAME"  appcode="'+appcode+'" ><a href="javascript:;" data-src="'+(cbase + cmenuSrc)+'" open="'+copen+'">'+cmenuName+'</a></li>';
						}
						childHtml += '</ul>';
						menuHtml += childHtml;	
					}
					menuHtml+=  '</li>';
				}
				menuHtml += '</ul></div>';
				var $frameEle = $('<iframe src="'+(basePath+firstSrc)+'" class="index-frame-frame" name="index-frame" frameborder="0"></iframe>');
				res.frame.append(menuHtml).append($frameEle);
				Index.tools.frameLoad.call($frameEle);

				//menuHtml += '</ul></div>';
				//res.frame.append(menuHtml).append('<iframe src="'+(basePath+firstSrc)+'" class="index-frame-frame" name="index-frame" frameborder="0"></iframe>');
				return res;
			}
		},
		//type = 0,type = 1
		getTopBarHtml : function(appcode ,appname , type){
			var html = '<div>';
			if(type == 0){
				return '<li class="byy-nav-item" appcode="'+appcode+'" appname="'+appname+'" byy-filter="TOPBAR"><a href="javascript:;">'+appname+'<i class="byyicon byy-unselect icon-close" byy-filter="CLOSEBAR"></i></a></li>';
			}else if(type == 1){
				return '<li appcode="'+appcode+'" byy-filter="TOPBAR" appname="'+appname+'"><a href="javascript:;">'+appname+'<i class="byyicon byy-unselect icon-close" byy-filter="CLOSEBAR"></i></a></li>';
			}
		},
		//根据appcode显示内容
		showFrame : function( appcode ){
			$('.index-nav').find('li.byy-this').removeClass('byy-this');
			$('.index-nav').find('li[appcode="'+appcode+'"]').addClass('byy-this');
			var $frames = $('.index-frame');
			var $frame = $frames.find('[appcode="'+appcode+'"]');
			$('.index-body').addClass('hide');
			$('.index-frame').removeClass('hide');
			$('.index-header').removeClass('index-header-box-shadow');
			$frames.find('.selected').removeClass('selected');
			$frame.addClass('selected');
		},
		frameLoad : function(){
			this.load(function(){
				//判断二级菜单是否隐藏，如果隐藏则显示
				var $nav = $('.index-frame-item[appcode="'+($('.index-nav-item.selected').attr('appcode'))+'"] .byy-nav');
				!$nav.is(':visible') && $nav.show();
			});
		},
		showRightByHeight : function(ev,height){
			if(!height){
				height = $(window).scrollTop();
			}
        	var notice = $('.notice-section'),
        		news = $('.news-section'),
        		resource = $('.resource-section'),
        		week = $('.week-section');
        	var $right = $('.right-fixed');
        	//右侧的返回顶部显示
			if(height < 500){
				$right.find('.right-item-top').addClass('hide');
			}else{
				$right.find('.right-item-top').removeClass('hide');
			}
        	//根据当前高度，确定哪个选中
        	function getIndex (h){
        		if(h < notice.height()){
        			return 0;
	        	}
	        	if(h < (news.height() + news.offset().top)){
	        		return 1;
	        	}
	        	if( h < (resource.height() + resource.offset().top)){
	        		return 2;
	        	}
	        	return 3;
        	}
        	var i = getIndex(height);
        	$right.find('.right-item.selected').removeClass('selected');
        	$right.find('.right-item:eq('+i+')').addClass('selected');
		},
		//滚动到某位置
		scrollTo : function(h){
			$('html,body').animate({'scrollTop':h+'px'},500,function(){
				// Index.tools.showRightByHeight(h);	
			});
		},
		//我的应用初始化按钮-禁用等效果
		renderSlipBtn : function(){
			var $appBox = $('.app-list');
			var height = $appBox.height();
			if(height == 0)return;
			var appHeight = $('.appicobox:eq(0)').height()+10;
			var rowCount = Math.round(height / appHeight);
			var top = $appBox.css('top');
			top = Math.abs(parseInt(top.replace('px',''),10));
			var nowRow =Math.round( top / appHeight );
			//如果nowRow == 0 
			$('.right-slipbox').removeClass('right-slip-disable').addClass('right-slip');
			$('.left-slipbox').removeClass('left-slip-disable').addClass('left-slip');
			if(nowRow == 0){
				$('.left-slipbox').removeClass('left-slip').addClass('left-slip-disable');
			}
			if(nowRow == rowCount-1){
				$('.right-slipbox').removeClass('right-slip').addClass('right-slip-disable');
			}
		}
	},
	//轮播
	slider : function(){
		byy.slider.render({
            elem:'#notice-slider',
            arrow:'none',
            width:'100%',
            height:'158px',
            indicator:'outside',
            anim:'default',
            interval : 8000
        });
        byy.slider.render({
            elem:'#week-slider',
            arrow:'none',
            width:'100%',
            height:'600px',
            indicator:'outside',
            anim:'updown',
            interval : 3000
        });
	},
	//入口
	start : function(){

		Index.bind();
		Index.slider();
		Index.tools.showRightByHeight(null);
		Index.tools.renderSlipBtn();
	}
};

byy.require(['jquery','win','slider'],function(){
	Index.start();
});
