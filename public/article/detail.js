var Article = {
	id : '',
	events : {
		//求各位土豪赏点..撑服务器啊
		shang : function(){
			byy.win.open({
				type : 1,
				title : '赏作者一杯咖啡',
				content : $('.zanshang-pic'),
				area : ['440px','250px']
			});
		},
		//保存评论
		saveComment : function(){
			//校验内容是否填写
			var $comment = $(this).parent().parent().parent();//父级容器
			var $content = $comment.find('textarea'),
				content = $content.val(),
				$name= $comment.find('[name="name"]'),
				name = $name.val(),
				$email =$comment.find('[name="email"]'),
				email = $email.val();
			//保存内容
			var validate = true;
			//获得toid
			var toid = $comment.find('[filter="saveComment"]').data('toid');
			var toname = $comment.find('[filter="saveComment"]').data('toname');
			var commentid = $comment.find('[filter="saveComment"]').data('commentid');
			content = content.replace('@'+toname,'');
			content = content.trim();
			if(content.length > 1000 || content.length == 0){
				byy.win.tips('内容请不要超过1000字,也不要为空！',$content,{tipsMore : true});
				validate = false;
			}
			name = name.trim();
			if(name.length>20 || name.length == 0){
				byy.win.tips('名字请不要超过20字,也不要为空！',$name,{tipsMore : true});
				validate = false;
			}
			if(email.length > 50){
				byy.win.tips('邮件名字不要太长！',$email,{tipsMore : true});
				validate = false;
			}
			if(!validate){
				return;
			}
			$.ajax({
				url : '/article/saveComment',
				type : 'post',
				data : {
					articleId : Article.id,
					content : content,
					name : name,
					email : email,
					toid : toid,
					commentid : commentid,
					toname :toname
				},success : function(res){
					//suc err
					if(res.success){
						byy.win.msg('感谢您的评论~~');
						//重新加载评论或动态加载评论
						Article.renderComment({
							id : res.id,
							name : name,
							ctime : moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
							content : content,
							commentid : commentid,
							toid : toid,
							toname : toname
						},$comment);
						//将用户信息更新至浏览器存储
						storage('user',{name : name,email : email});
						$content.val('');
					}else{
						byy.win.msg(res.msg);
					}
				}
			});
			//渲染评论
		},
		//点赞
		addZan : function(){
			var $zan = $(this);
			if($zan.hasClass('addzan')){
				return ;
			}
			//继续点击喜欢
			$.ajax({
				url : '/article/zan',
				type : 'post',
				data : {id : Article.id},
				success : function(res){
					if(res.success){
						byy.win.msg('您的点赞是我最大的动力.感谢~~');
						$zan.addClass('addzan');
						var $num = $zan.find('.modal-wrap>a');
						$num.html(parseInt($num.text(),10)+1);
						//更新数据
						var arr = storage('zan').result || {};
						arr[Article.id] = true;
						storage('zan',arr);
					}
				}
			});
		},

		//回复 @或者 不@
		reply : function(data,ev){
			console.log('aaa');
			var $this = $(this),id = data.id,name = data.name,commentid= data.commentid;
			var $block = $this.parents('.comment-block');
			//判断是否已经有了评论或回复。
			if($block.find('.comment-child').length == 0){
				$block.append('<div class="comment-child"></div>');
			}
			if($block.find('.sub-reply-control').length == 0){
				//加入sub-control
				var $sub = Article.tool.getCommentControl();
				$block.find('.comment-child').append($sub);
			}
			//更新
			$block.find('[name="name"]').val(Article.user.name);
			$block.find('[name="email"]').val(Article.user.email);
			//更新@ 数据
			$block.find('[filter="saveComment"]').data('toid',id);
			$block.find('[filter="saveComment"]').data('toname',name);
			$block.find('[filter="saveComment"]').data('commentid',commentid);
			$block.find('textarea').val('@'+name+' ');
			$block.find('textarea').focus();
		}
	},
	//渲染评论区域
	renderComment : function(comment,$dom){
		//此处做判断
		if($('.empty-comment').length > 0){
			$('.empty-comment').remove();
		}
		if(comment.commentid){//子级
			var $block = $dom.parent().parent();
			if($block.find('.comment-child').length == 0){
				$block.prepend('<div class="comment-child"></div>');
			}
			var $comment = Article.tool.getSubComment(comment);
			$block.find('.comment-child').prepend($comment);
		}else{
			var $block = Article.tool.getCommentHtmlByComment(comment);
			$('.comment-show>.comment-wrap').prepend($block);	
		}
	},
	tool : {
		highlight : function(){
			$('pre code').each(function(i, block) {
		    	hljs.highlightBlock(block);
		  	});
		},
		checkImg : function(){
			$('p>img').each(function(){
				$(this).parent().addClass('img-wrap');
				var alt = $(this).attr('alt') || '示例图';
				$(this).after('<div class=""><div class="img-caption">'+alt+'</div></div>');
			});
		},
		checkTable : function(){
			$('.article-detail table').each(function(){$(this).addClass('byy-table')})
		},
		checkZan : function(){
			var zan = storage('zan'),
				arr = zan.result;
			var has = false;
			for(var item in arr){
				if(item == Article.id){
					has = true;
				}
			}
			if(has){
				$('.like').addClass('addzan');
			}
		},
		//绑定图片展示
		showPic : function(){
			$('.article-detail').on('click','img',function(){
				var img = $(this).attr('src'),alt = $(this).attr('alt');
				byy.win.photos({
					anim : Math.round(Math.random() * 5),
					photos : {
						title : alt || '',
						data : [{
							alt : alt || '',
							src : img
						}]
					}
				});
			})
		},
		//根据一个评论获得html
		getCommentHtmlByComment : function(comment){
			var $block = $('<div class="comment-block"></div>');
			var $commentinfo = $('<div class="comment-info"><div class="comment-author"><a class="name">'+comment.name+'</a><a class="meta">'+comment.ctime+'</a></div><div class="comment-wrap"><p>'+comment.content+'</p><span class="reply" filter="reply" data-id="'+comment.id+'" data-name="'+comment.name+'" data-commentid="'+comment.id+'"><i class="byyicon icon-comment"></i>回复</span></div></div>');
			$block.append($commentinfo);
			if(comment.childs && comment.childs.length > 0){
				//子级
				var $subcomment = $('<div class="comment-child"></div>');
				comment.childs.forEach(function(item){
					var $child = $('<div class="sub-comment"><p><a class="comment-author-name">'+item.name+'</a>:<a class="comment-author-name">@'+item.toname+'</a>'+item.content+'</p><div class="sub-reply"><span>'+item.ctime+'</span><span class="sub-reply-btn" filter="reply" data-id="'+item.id+'" data-name="'+item.name+'" data-commentid="'+comment.id+'"><i class="byyicon icon-comment"></i>回复</span></div></div>')
					$subcomment.append($child);
				})
				$block.append($subcomment);
			}
			return $block;
		},
		getSubComment : function(comment){
			return $('<div class="sub-comment"><p><a class="comment-author-name">'+comment.name+'</a>:<a class="comment-author-name">@'+comment.toname+'</a>'+comment.content+'</p><div class="sub-reply"><span>'+comment.ctime+'</span><span class="sub-reply-btn" filter="reply" data-id="'+comment.id+'" data-name="'+comment.name+'" data-commentid="'+comment.commentid+'"><i class="byyicon icon-comment"></i>回复</span></div></div>')
		},
		//返回评论控制区
		getCommentControl :function(){
			return '<div class="sub-reply-control"><textarea name="comment" placeholder="写下你的评论.."></textarea><div class="comment-control byy-clear"><div class="pull-left"><div class="byy-form-info">*您的email只用来给您发提醒消息，不会做其他用途!</div></div><div class="pull-right"><span><input type="text" class="byy-form-input" name="name" placeholder="您的名字"></span><span><input type="text" class="byy-form-input" name="email" placeholder="您的email"></span><span class="byy-btn pull-right small" filter="saveComment">提交评论</span></div></div></div>';
		}
	},
	//加载文章评论
	loadComment : function(){
		$.ajax({
			url : '/article/getComment',
			type : 'post',
			data : {id : Article.id},
			success : function(res){
				console.log(res);
				if(res.length > 0){
					$('.empty-comment').remove();
					//对评论进行数据处理
					var arr = [];
					res.forEach(function(item){
						if(!item.toid){
							arr.push(item);
						}
					})
					arr.forEach(function(item){
						item.childs = [];
						res.forEach(function(item2){
							if(item2.commentid == item.id){
								item.childs.push(item2);
							}
						})
					})
					//不处理
					arr.forEach(function(comment){
						var $block = Article.tool.getCommentHtmlByComment(comment);
						$('.comment-show>.comment-wrap').append($block);
					})
				}
			}
		});
	},
	//不做IP校验，刷一次就有一次...
	addRead : function(){
		$.ajax({
			url : '/article/read',
			type : 'post',
			data : {id : Article.id},
			success:function(res){}
		});
	},
	bindEvents : function(){
		//事件绑定
		$('[name="comment"]').on('focus',function(){
			var $name = $(this).parent().find('[name="name"]'),
				$email = $(this).parent().find('[name="email"]');
			if($name.val().trim() == ''){
				$name.val(Article.user.name || '');
			}
			if($email.val().trim() == ''){
				$email.val(Article.user.email || '');
			}
			$(this).next().removeClass('hide');
		});
	},
	init : function(){
		Article.bindEvents();
		byy.bindEvents(Article.events);
		//
		Article.id = $('[name="id"]').val();
		Article.tool.highlight();
		Article.tool.checkImg();
		Article.tool.showPic();
		Article.tool.checkTable();
		Article.tool.checkZan();
		//获取浏览器用户信息
		Article.user  = storage('user').result || {};
		//加载评论
		Article.loadComment();
		Article.addRead();

		
		//1.增加backTop
		$('body').append('<div class="backTop" title="点击返回顶部"><div></div></div>');
		$('body').on('click','.backTop',function(){
			$('html,body').animate({
				scrollTop : 0
			},500);
		});
		//滚动监听，隐藏顶部
		var exeHide = function(ev){
			var now = $(window).scrollTop();
			if(now > 250){//如果滚动到了200PX以下，则闪出
				$('.backTop').addClass('showme');
			}else{
				$('.backTop').removeClass('showme');
			}
		};
		$(window).on('scroll',exeHide);


	}
};
//启动
byy.require(['jquery','win','moment'],function(){Article.init();})