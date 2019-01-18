var Article = {
	id : '',
	events : {
		showdir : function(){
			$('.article-dir').removeClass('closed');
		},
		closedir:function(){
			$('.article-dir').addClass('closed');	
		},
		jump : function(d){
			var id = d.id;
			var $item = $('#'+id);
			$('html,body').animate({
				scrollTop : $item.offset().top - 65
			},500);
		},
		login : function(){
			byy.common.login();
		},
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
				content = $content.val();
				
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
			if(!validate){
				return;
			}
			$.ajax({
				url : '/article/saveComment',
				type : 'post',
				data : {
					articleId : Article.id,
					content : content,
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
							name : LoginUser.name,
							avatar_url : LoginUser.avatar_url,
							ctime : moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
							content : content,
							commentid : commentid,
							toid : toid,
							toname : toname
						},$comment);
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
						var arr = byy.store.local('zan')|| {};
						arr[Article.id] = true;
						byy.store.local('zan',arr);
					}
				}
			});
		},

		//回复 @或者 不@
		reply : function(data,ev){
			if(!LoginUser){
				byy.common.login();
				return;
			}
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
		//创建目录，如果没有就算啦
		createDir : function(){
			console.log('dir');
			var arr = [];
			$('.article-detail').find('h1,h2,h3,h4,h5,h6').each(function(index,item){
				var tagName = item.tagName;
				var level = parseInt(tagName.replace('H',''),10);
				var seq = 1;
				//获得当前的seq
				for(var i=arr.length-1;i>=0;i--){
					var temp = arr[i];
					if(level > temp.level){
						seq = parseInt((temp.seq+'')+'1',10);
						break;
					}else if(level == temp.level){
						seq = temp.seq + 1;
						break;
					}
				}
				var id = 'article-dir-'+seq;
				$(item).attr('id',id);
				arr.push({
					id : id,
					level : level,
					seq : seq,
					content : $(item).text()
				});
			})
			//开始生成
			if(arr.length > 0){
				var $dir = $('<div class="article-dir closed"></div>'),
				html = '<span class="article-dir-title">目录:</span><span class="article-dir-icon" filter="closedir" title="关闭目录"><i class="byyicon icon-ellipsis"></i></span><span class="article-dir-icon2" title="展开目录" filter="showdir"><i class="byyicon icon-expand"></i></span>';
				arr.forEach(function(item){
					var seq = item.seq,len = (seq+'').length,title = (seq+'').split('').join('.')+' '+item.content;
					html += '<span class="article-dir-seq-'+len+'"><a href="javascript:;" title="'+title+'" filter="jump" data-id="'+item.id+'">'+title+'</a></span>';
				});
				$dir.html(html);
				$('body').append($dir);
			}
		},
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
			var arr = byy.store.local('zan')||{};
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
			var $commentinfo = $('<div class="comment-info"><div class="comment-author"><a href="'+comment.blog+'" target="_blank"><img src="'+comment.avatar_url+'" /></a><a class="name">'+comment.name+'</a><a class="meta">'+comment.ctime+'</a></div><div class="comment-wrap"><p>'+comment.content+'</p><span class="reply" filter="reply" data-id="'+comment.id+'" data-name="'+comment.name+'" data-commentid="'+comment.id+'"><i class="byyicon icon-comment"></i>回复</span></div></div>');
			$block.append($commentinfo);
			if(comment.childs && comment.childs.length > 0){
				//子级
				var $subcomment = $('<div class="comment-child"></div>');
				comment.childs.forEach(function(item){
					var $child = $('<div class="sub-comment"><p><a href="'+item.blog+'" target="_blank"><img src="'+item.avatar_url+'" /></a><a class="comment-author-name">'+item.name+'</a>:<a class="comment-author-name">@'+item.toname+'</a>'+item.content+'</p><div class="sub-reply"><span>'+item.ctime+'</span><span class="sub-reply-btn" filter="reply" data-id="'+item.id+'" data-name="'+item.name+'" data-commentid="'+comment.id+'"><i class="byyicon icon-comment"></i>回复</span></div></div>')
					$subcomment.append($child);
				})
				$block.append($subcomment);
			}
			return $block;
		},
		getSubComment : function(comment){
			return $('<div class="sub-comment"><p><a href="'+comment.blog+'" target="_blank"><img src="'+comment.avatar_url+'" /></a><a class="comment-author-name">'+comment.name+'</a>:<a class="comment-author-name">@'+comment.toname+'</a>'+comment.content+'</p><div class="sub-reply"><span>'+comment.ctime+'</span><span class="sub-reply-btn" filter="reply" data-id="'+comment.id+'" data-name="'+comment.name+'" data-commentid="'+comment.commentid+'"><i class="byyicon icon-comment"></i>回复</span></div></div>')
		},
		//返回评论控制区
		getCommentControl :function(){
			return '<div class="sub-reply-control"><textarea name="comment" placeholder="写下你的评论.."></textarea><div class="comment-control byy-clear"><div class="pull-left"></div><div class="pull-right"><span class="byy-btn pull-right small" filter="saveComment">提交评论</span></div></div></div>';
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
			//检查登录用户
			if(!LoginUser){
				byy.common.login();
			}else{
				$(this).next().removeClass('hide');
			}
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
		Article.tool.createDir();
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
byy.require(['jquery','win','moment','store','common','easy'],function(){Article.init();})