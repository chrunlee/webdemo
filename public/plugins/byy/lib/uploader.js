/**
 * 1.变更offset 弹窗位置
 **/
var logInfo = function( msg ){
	if(console && console.log){
		console.log('%cINFO : '+ msg+'','color:red;');
	}
};
var noop = function(){};
//依赖：jquery webuploader win(tip)

//全局配置
//      通用文件               excel				pdf					word				image			txt					zip				audio				movie				ppt
//图标重定义
var ext = [
	'icon-file',//通用文件
	'icon-file-excel',//excel
	'icon-file-pdf',//pdf
	'icon-file-word',//word
	'icon-file-image',//image
	'icon-file-text',//text
	'icon-file-zip',//zip
	'icon-file-audio',//audio
	'icon-file-video',//video
	'icon-file-ppt',//ppt
	'icon-close',//关闭
	'icon-checkbox-checked',//上传完毕
	'icon-play',//启动
	'icon-pause'//暂停
],
// var ext = ['fa-file-o','fa-file-excel-o','fa-file-pdf-o','fa-file-word-o','fa-file-image-o','fa-file-text-o','fa-file-zip-o','fa-file-audio-o','fa-file-movie-o','fa-file-powerpoint-o'],
config = {
	extpre : 'byyicon',
	extmap : {
		'def' : ext[0],
		'xls' : ext[1],
		'xlsx' : ext[1],
		'pdf' : ext[2],
		'doc' : ext[3],
		'docx' : ext[3],
		'jpg' : ext[4],
		'jpeg' : ext[4],
		'png' : ext[4],
		'gif' : ext[4],
		'bmp' : ext[4],
		'txt' : ext[5],
		'zip' : ext[6],
		'rar' : ext[6],
		'mp3' : ext[7],
		'mp4' : ext[8],
		'avi' : ext[8],
		'm4v' : ext[8],
		'mpeg' : ext[8],
		'rmvb' : ext[8],
		'mpg' : ext[8],
		'flv' : ext[8],
		'mov' : ext[8],
		'ppt' : ext[9],
		'pptx' : ext[9]
	},
	imageAccept : {
		title : '图片',
		extensions : 'gif,jpg,jpeg,png,bmp',
		mimeTypes : 'image/jpg,image/jpeg,image/png,image/bmp,image/gif'
	},
	fileAccept : {
		title : byy.lang.upload.acceptTitle,
		extensions : 'doc,docx,xls,xlsx,ppt,pptx,pdf,txt,jpg,jpeg,png,bmp,gif,avi,mp4,m4v,mpeg,mpg,rmvb,mov,flv,rar,zip',
		mimeTypes : [
		             'application/msword',//doc
		             'application/vnd.openxmlformats-officedocument.wordprocessingml.document',//docx
		             'application/vnd.ms-excel,application/x-excel',//xls
		             'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',//xlsx
		             'application/vnd.ms-powerpoint',//ppt
		             'application/vnd.openxmlformats-officedocument.presentationml.presentation',//pptx
		             'application/pdf',//pdf
		             'text/plain',//txt
		             'image/jpg',//jpg
		             'image/jpeg',//jpeg
		             'image/png',//png
		             'image/bmp',//bmp
		             'image/gif',//gif
		             'video/x-msvideo',//avi
		             'video/mp4',//mp4
		             'video/x-m4v',//m4v
		             'video/mpeg',//mpeg/mpg
		             '.mpg',//mpg
		             'application/vnd.rn-realmedia',//rmvb
		             'video/quicktime',//mov
		             '.flv',//flv
		             'video/x-flv',//flv
		             'application/x-rar-compressed',//rar
		             '.rar',//rar
		             'application/x-zip-compressed'//zip
		             ].join(',')
	}
};

//默认配置
var getPath = byy.basePath,

ready = {
	csspath : getPath + 'css/modules/uploader/default/uploader.css',
	swfpath : getPath + 'css/modules/uploader/Uploader.swf',
	jsonpath : getPath + 'css/modules/uploader/config.json',
	checkMd5 : '/UploaderMd5_checkMd5.do'
};
(function(window,factory){
	//监测依赖
	byy.require(['jquery','win','webuploader'],function(){
		var $ = byy.jquery || $ || jQuery,byywin = byy.win,webuploader = byy.webuploader;
		factory(window,$,byywin,webuploader);
	});
})(window,function(win,$,byywin,webuploader,undefined){
	var doc = win.document,
	Uploader = function( opts ){
		return new Uploader.fn.init();
	};
	Uploader.fn = Uploader.prototype = {
		version : '1.0',
		constructor : Uploader,
		init : function(  ){
			this.addCss();
			var guid = this.guid();
			this.id = guid;
			return this;
		}
	};
	Uploader.fn.init.prototype = Uploader.fn;
	byy.extend(Uploader,{
		getIcon : function( type ){
			if(!type)return '<i class="'+config.extpre+' '+(config.extmap['def'])+' "></i>';
			type = type.replace('.','');
			type = (''+type).toLowerCase();
			return '<i class="'+config.extpre+' '+(config.extmap[type] ? config.extmap[type] : config.extmap['def'] )+' "></i>';
		}
	});
	Uploader.prototype.addCss = function(){
		byy.link(ready.csspath,null,'uploader');
	};
	Uploader.prototype.getCfg = function(){
		return {

				dnd : null,//拖拽的容器 selector
				disableGlobalDnd : false,//是否禁用全局的拖拽，如果要使用dnd ，则需要禁用
				paste : null,//指定粘贴的容器，如果使用建议使用 document.body
				selector : '',//点击容器，同时在里面创建相对应的file input element
//				count : 0,//0 代表不限制
				server : getPath + 'css/modules/uploader/controller.jsp',//文件接收服务器端
				accept : {},//允许的文件类型
				noaccept : [],//不允许的文件类型
				size : 5 * 1024 * 1024 * 1024,//文件大小，5G，单位B
				modal : false,//是否允许遮罩（最小化或者点击隐藏）
				// dialog : false,//是否启用上传窗口，默认不启用，如果是多个文件count>1,则默认启用
				trunked : false,//是否启用分片
				auto : false,//是否自动上传
				md5 : false,//是否启用md5 校验，如果启用后，则启动秒传和断点续传
				progress : false,//是否显示进度条
				compress : false,//图片是否压缩
				skin : 'default',//皮肤
				duplicate : false,//是否去重
				onMd5 : noop,//校验结束后返回md5值
				onMd5Progress : noop,//校验MD5的进度
				tips : '',
				onSuccess : noop,
				onError : noop,
				onComplete : noop
			};
	};
	/***
	 * 获得唯一UUID
	 **/
	Uploader.prototype.guid = function(){
		var counter = 0;
        return (function( prefix ) {
            var guid = (+new Date()).toString( 32 ),i = 0;
            for ( ; i < 5; i++ ) {
                guid += Math.floor( Math.random() * 65535 ).toString( 32 );
            }
            return (prefix || 'up_') + guid + (counter++).toString( 32 );
        })();
	};
	//查看是否全部上传完毕
	Uploader.prototype.getComplete = function(){
		var thiz = this,webupload = thiz.webUpload,tid = thiz.id;
		var $t = $('#'+tid).parent(),$title = $t.find('.byy-byywin-title').find('.title');
		var total = $t.find('.file-block').size();
		var success = $t.find('.file-block .status[complete]').size();
		return total == success;
	};
	//隐藏弹窗，如果有上传失败，上传错误的情况，则不隐藏，否则隐藏
	Uploader.prototype.hideWin = function(){
		var thiz = this;
		if(thiz.getComplete()){
			byy.win.min(thiz.winIndex,thiz.winConfig);
		}
	};
	/*生成大的框架UI*/
	Uploader.prototype.createUI = function(){
		var thiz = this,opts = thiz.opts || {},id = thiz.id;
		if($('#'+id).length > 0){
			
			if(opts.hideDialog == true){
				$('#'+id).parent().addClass('hide');
			}else{
				$('#'+id).parent().show();
				if($('#'+id).parent().attr('area')){
					byy.win.restore(thiz.winIndex);
				}
			}
		}else{
			thiz.winConfig = {
				type : 1,
				title : '<span class="title">'+byy.lang.upload.dialogTitle+'</span>'+( opts.tips == false || opts.tips == null ? '' : '<span class="pull-right"><a class="uploader-tip-a" href="javascript:;">'+byy.lang.upload.uploadTip+'<div class="uploader-tips">'+(opts.tips || '')+'</div></a></span>'),
				maxmin : true,
				content : '',
				shade : opts.modal || false,
				fixed : true,
				move : false,
				btn:[],
				id : thiz.id,
				skin : 'uploader-win',
				restore : function(lll){
					$('#'+id).parent().find('.uploader-tip-a').show();
					$('#'+thiz.id).parent().css({
						top : thiz.winConfig.offset[0] ,
						left : thiz.winConfig.offset[1]
					});
				},
				min : function(lll){
					// thiz.hideWin();
					// lll.css({'bottom':''});
					$('#'+id).parent().find('.uploader-tip-a').hide();
					$('#'+thiz.id).parent().css({
						top : thiz.winConfig.offset[0] + 400 - 45,
						left : thiz.winConfig.offset[1] + 600 - 200
					});
				},
				offset : [parent === window ? $(window).height() - 405 : $(window).height() - 440,$(window).width() - 620],
				cancel : function(index,dom){
					//设置
					$('#'+id).parent().hide();
					$('html').attr('style','');//移除禁止滚动的问题
					return false;
				},
				area : ['600px','400px']
			};
			thiz.winIndex  = byy.win.open(thiz.winConfig);
			if(opts.hideDialog == true){
				$('#'+id).parent().addClass('hide');
			}
		}
		return thiz;
	};
	//根据文件后缀获得对应的图标
	Uploader.prototype.getFileTypeIcon = function( ext ){
		if(byy.isNull(ext))return '<i class="'+(config.extpre)+' '+config.extmap['def']+'"></i>';
		ext = ext.toString().toLowerCase();
		var icon = config.extmap[ext] ? config.extmap[ext] : config.extmap['def'];
		var iconstr = '<i class="'+config.extpre+' '+icon+'"></i>';
		return iconstr;
	};
	
	//添加文件UI
	Uploader.prototype.addFileUI = function( file ){
		var thiz = this,format = thiz.formatSize,tid = thiz.id;
		var extname = file.ext,name = file.name,size = format(file.size),id = file.id;
		var $t = $('#'+tid);
		var iconStr = thiz.getFileTypeIcon(extname);
		//此处判断浏览器版本，如果低于10，则截取字符串\
		var showName = name;
		var device = byy.device();
		if(device.ie && device.ie < 10){
			showName = showName.substring(0,10)+(showName.length > 10 ? '...' : '');
		}
		var html = '<div class="file-block" id="'+id+'"><div class="pro"></div><span title="'+name+'" class="name">'+iconStr+name+'</span><span class="status"></span><span class="size">'+size+'</span><span class="operate"><i class="'+(config.extpre + ' '+ext[10])+'" title="'+byy.lang.upload.removeFile+'"></i></span></div>';
		$t.append(html);
		return thiz;
	};
	//上传失败-服务器
	Uploader.prototype.updateError = function( file,retry ){
		var thiz = this,id = file.id,tid = thiz.id;
		var $t = $('#'+tid),$file = $t.find('#'+id),$status = $file.find('.status'),$pro = $file.find('.pro'),$opr = $file.find('.operate');
		if($pro.length > 0)$pro.css('width','0%');
		$file.addClass('upload-error');
		$status.html('<span style="font-size:12px;">'+(byy.lang.upload.uploadFailP)+':<span style="color:red;">'+(byy.lang.upload.uploadFail)+(retry < 2 ? byy.lang.upload.uploadFailTry : '')+'</span></span>');
		$opr.html('<i class="'+(config.extpre+' '+ext[10])+'" style="color:red;" title="'+byy.lang.upload.removeFile+'"></i>');		
	};
	//更新扫描MD5进度
	Uploader.prototype.updateStatus = function(file ,msg,issuccess){
		var thiz = this,tid = thiz.id;
		var $t = $('#'+tid);
		var id = file.id;
		var $file = $t.find('#'+id);
		var $status = $file.find('.status');
		
		if(issuccess){
			//上传成功
			msg = '<i class="'+(config.extpre+' '+ext[11])+'"></i>' + msg;
			$status.attr('complete',true);
		}
		$status.html(msg);
		return thiz;
	};
	//更新上传进度
	Uploader.prototype.updateProgress = function(file , percent){
		var thiz = this,tid = thiz.id;
		var $t = $('#'+tid);
		var id = file.id;
		var $file = $t.find('#'+id);
		var $progress = $file.find('.pro');
		percent = (percent * 100).toFixed(2);
		$progress.css('width',percent+'%');
		return thiz;
	};
	//更新本次的标题信息
	Uploader.prototype.updateTitle = function(){
		var thiz = this,webupload = thiz.webUpload,tid = thiz.id;
		var $t = $('#'+tid).parent(),$title = $t.find('.byy-byywin-title').find('.title');
		var total = $t.find('.file-block').size();
		var success = $t.find('.file-block .status[complete]').size();
		$title.html(''+byy.lang.upload.uploadInfo+':<span style="color:red;">'+success+'</span>/'+total);
		return thiz;
	};
	//删除文件
	Uploader.prototype.deleteFile = function( id ){
		var thiz = this,webupload = thiz.webUpload,tid = thiz.id,opts = thiz.opts;
		var $t = $('#'+tid),$file = $t.find('#'+id);
		//先根据id获得file对象
		var fileObj = webupload.getFile(id);
		webupload.cancelFile( fileObj );
		webupload.removeFile(id,true);
		$file.animate({
			opacity : 0
		},500,function(){
			$file.remove();
			thiz.updateTitle();
		});
		//如果已经存在回调，则执行
		if(opts.onDelete){
			opts.onDelete(fileObj);
		}
		return thiz;
	};
	//该文件上传成功处理UI
	Uploader.prototype.successFile = function( file ){
		var thiz = this,tid = thiz.id;
		var $t = $('#'+tid);
		var id = file.id;
		var $file = $t.find('#'+id);
		$file.find('.pro').css('width','0%');
		$file.find('.operate').html('<i class="'+(config.extpre+' '+ext[10])+'" title="'+byy.lang.upload.removeFile+'"></i>');
		return thiz;
	};
	//改变操作按钮
	Uploader.prototype.changeOperate = function( file ){
		var thiz = this,tid = thiz.id;
		//判断是否需要展示开始、暂停按钮
		var pause = thiz.opts.pause || false;
		if(!pause)return thiz;
		var $t = $('#'+tid);
		var id = file.id;
		var $file = $t.find('#'+id);
		$file.find('.operate').html('<i class="'+(config.extpre+' '+ext[13])+'" title="'+byy.lang.upload.pauseFile+'"></i>');
		return thiz;
	};
	Uploader.prototype.emptyOperate = function( file ){
		var thiz = this,tid = thiz.id;
		var $t = $('#'+tid);
		var id = file.id;
		var $file = $t.find('#'+id);
		$file.find('.operate').html('');
		return thiz;
	};
	//暂停
	Uploader.prototype.stopFile = function(id){
		var thiz = this,tid = thiz.id,opts = thiz.opts;
		var $t = $('#'+tid);
		var $file = $t.find('#'+id);
		var $ope = $file.find('.operate');
		$ope.html('<i class="'+(config.extpre+' '+ext[12])+'" title="'+byy.lang.upload.startFile+'"></i>');
		var webupload = thiz.webUpload;
		webupload.stop(id);
		if(opts.onStop){
			var fileObj = webupload.getFile(id);
			opts.onStop(fileObj);
		}
		return thiz;
	};
	//启动
	Uploader.prototype.startFile = function(id){
		var thiz = this,tid = thiz.id,opts = thiz.opts;
		var $t = $('#'+tid);
		var $file = $t.find('#'+id);
		var $ope = $file.find('.operate');
		$ope.html('<i class="'+(config.extpre+' '+ext[13])+'" title="'+byy.lang.upload.pauseFile+'"></i>');
		var webupload = thiz.webUpload;
		webupload.upload(id);
		if(opts.onStart){
			var fileObj = webupload.getFile(id);	
			opts.onStart(fileObj);
		}
		return thiz;
	};
	
	//格式化文件大小
	Uploader.prototype.formatSize = function( size, pointLength, units ) {
        var unit;
        units = units || [ 'B', 'KB', 'M', 'G', 'TB' ];

        while ( (unit = units.shift()) && size > 1024 ) {
            size = size / 1024;
        }

        return (unit === 'B' ? size : size.toFixed( pointLength || 2 )) +
                unit;
    };
	//增加监听事件
	Uploader.prototype.listen = function(){
		var thiz = this,webUpload = thiz.webUpload,opts = thiz.opts,tid = thiz.id;
		var dialog = opts.dialog;
		$('body').on('click','#'+tid+' .'+ext[10],function(){
			//将该文件从队列中移除
			var $this = $(this),$file = $this.parent().parent(),id = $file.attr('id');
			thiz.deleteFile(id);
		});
		
		$('body').on('click','#'+tid+' .'+ext[13],function(){
			//将该文件从队列中移除
			var $this = $(this),$file = $this.parent().parent(),id = $file.attr('id');
			thiz.stopFile(id);
		});
		
		$('body').on('click','#'+tid+' .'+ext[12],function(){
			//将该文件从队列中移除
			var $this = $(this),$file = $this.parent().parent(),id = $file.attr('id');
			thiz.startFile(id);
		});
		
		/*加入队列前*/
		webUpload.on('beforeFileQueued',function(file){
			if(file.size === 0){
				webUpload.trigger('error','F_EMPTY_FILE',file);
				return false;
			}
			if(opts.onBefore){
				return opts.onBefore(file);
			}
			return true;
		});
		/*当有单个文件加入队列触发*/
		webUpload.on('fileQueued',function( file ){
			logInfo('文件'+file.name+'加入队列');
			if(opts.onSelect){
				var rt = opts.onSelect(file);
				if(rt === false){
					return false;
				}
			}
			if(dialog){//多个的话，生成UI
				thiz.createUI();
				thiz.addFileUI(file);
			}
			//如果需要校验md5
			if(opts.md5){
				//如果是单个的文件上传且还需要校验，则增加提示
				logInfo('开始校验文件MD5值');
				webUpload.md5File( file )
				.progress (function( percent ){
					if(!dialog && opts.onMd5Progress){
						opts.onMd5Progress( percent );
					}else{
						percent = (percent * 100 ).toFixed(2);
						var msg = byy.formatStr(byy.lang.upload.scan,percent+'%');
						thiz.updateStatus(file,msg);
					}
				})
				.then (function( val ){
					if(!dialog && opts.onMd5){
						opts.onMd5( val );
					}
					logInfo('获得文件MD5值 ('+val+')');
					$.ajax({
						url : opts.checkMd5 || ready.checkMd5,
						type : 'POST',
						data : {fileMd5 : val},
						success : function( res ){
							logInfo('获得查询结果('+res+')');
							var resobj = byy.json(res);
							if(typeof resobj == 'string'){
								//失败。
							}else{
								var success = resobj.success,
									msg = resobj.msg;
								if(!!!webUpload.getFile(file.id)){
									return;//没有从队列中找到文件，认为是中途取消，所以取消上传；
								}
								if(success){//查询到信息,判断是否全部上传，如果没有，则获得分片记录
									var fileInfo = resobj.file,
									issuccess = fileInfo.issuccess == 'true' || fileInfo.issuccess == true ? true : false,
									chunks = fileInfo.chunks;
									if(issuccess){
										//停止上传，调用回调函数
										logInfo('服务器已存在该文件，停止上传');
										webUpload.skipFile(file);
										if(dialog){
											thiz.updateStatus(file,byy.lang.upload.secondUpload,true);
											thiz.successFile(file);
											thiz.updateTitle();
											thiz.hideWin();
										}else{
											//单文件或者单图片上传的话，如果极速成功，则重置
											webUpload.reset();
										}
										if(opts.onSuccess){
											file.md5 = val;
											opts.onSuccess(file,{info:[fileInfo],msg:byy.lang.upload.secondUpload});
										}
										if(opts.onComplete){
											file.md5 = val;
											opts.onComplete(file);
										}
									}else{//继续上传
										logInfo('服务器已存在该文件，但是不完整，继续上传');
										file.md5 = val;
										file.hasPart = chunks.split(',');
										if(opts.auto){
											webUpload.upload(file);
										}else{
											//创建开始图标
											thiz.stopFile(file.id);
										}
									}
								}else{//数据库没有存储的相关MD5，直接上传
									logInfo('服务器不存在该文件，上传');
									file.md5 = val;
									if(opts.auto){
										webUpload.upload(file);
									}else{
										//创建开始图标
										thiz.stopFile(file.id);
									}
								}
							}
						},
						//失败
						error : function(){
							thiz.updateError(file);
						}
					});
				});
			}else{
				//不进行MD5上传，判断是否自动上传
				if(opts.auto){
					webUpload.upload(file);
				}else if(dialog && !opts.auto){
					webUpload.upload(file);
					thiz.stopFile(file.id);
				}else{
					webUpload.upload(file);
				}
			}
		});
		
		webUpload.on('uploadBeforeSend',function( block , data){
			var file = block.file;
			var md5 = file.md5;
			for(var key in opts.formData){
				if(!data[key]){
					data[key] = opts.formData[key];
				}
			}
			data.fileMd5 = md5 || "";
			thiz.changeOperate(file);
		});
		webUpload.on('uploadSuccess',function( file, response){
			!dialog ? webUpload.reset() : '';
			logInfo('文件上传成功');
			if(opts.onSuccess){
				opts.onSuccess(file,response);
			}
			if(dialog){
				thiz.successFile(file);
				thiz.updateStatus(file,byy.lang.upload.uploadSuc,true);
				thiz.updateTitle();
			}
		});
		
		webUpload.on('error',function( type ){
			var errorsMap = {
				"Q_EXCEED_NUM_LIMIT" : byy.lang.upload.Q_EXCEED_NUM_LIMIT,
				"Q_EXCEED_SIZE_LIMIT" : byy.lang.upload.Q_EXCEED_SIZE_LIMIT,
				"F_EXCEED_SIZE" : byy.formatStr(byy.lang.upload.F_EXCEED_SIZE,thiz.formatSize(thiz.opts.fileSingleSizeLimit || thiz.opts.size)),
				"Q_TYPE_DENIED" : byy.lang.upload.Q_TYPE_DENIED,
				"F_DUPLICATE" : byy.lang.upload.F_DUPLICATE,
				"F_EMPTY_FILE" : byy.lang.upload.F_EMPTY_FILE
			};
			$('#'+tid).parent().show();
			thiz.updateTitle();
			if(opts.onError){
				opts.onError(type,errorsMap[type]);
			}else{
				byy.win.msg(errorsMap[type]);
			}
		});
		
		webUpload.on('uploadComplete',function(file){
			if(dialog){
				thiz.hideWin();	
			}
			if(opts.onComplete){
				opts.onComplete(file);
			}
		});
		
		webUpload.on('uploadError',function( file,response ){
			
		});
		var speedTime = new Date().getTime();
		var lastPercent = 0;
		var getSpeed = function(percent ,total ){
			var now = new Date().getTime();
			var mix = ( now - speedTime ) / 1000;//S
			var mixP = percent - lastPercent;
			var kbs = mixP * total;//共上传多少KB
			var speed = (kbs||0) / (mix||0);
			speed = thiz.formatSize(speed);
			lastPercent = percent;
			speedTime = now;
			return speed;
		};
		webUpload.on('uploadProgress',function( file ,percent ){
			logInfo('上传进度:'+percent.toFixed(2)*100);
			//根据进度和时间计算实时上传速度
			// var speed = getSpeed(percent,file.size);
			var np = (percent * 100).toFixed(2);
			thiz.updateStatus(file,'<span style="font-size:12px;">'+(byy.formatStr(byy.lang.upload.progress,np+'%'))+'</span>');
			thiz.updateProgress(file,percent);
			if(opts.onProgress){
				opts.onProgress(file,percent.toFixed(2)*100);
			}
			//如果np >= 100，则重新更新状态
			if(np >= 100){
				thiz.updateStatus(file,'<span style="font-size:12px;">'+(byy.lang.upload.afterUpload)+'</span>');
				thiz.emptyOperate(file);
			}
		});
		
		webUpload.on('uploadAccept',function( obj, ret ){
			if(ret.success === false){
				thiz.updateError(obj.file);
				if(opts.onError){
					opts.onError('server',ret.msg);
				}else if(!byy.isNull(ret.msg)){
					byy.win.msg(ret.msg);
				}
			}
		});
		return thiz;
	};

	/**
	 *  创建隐藏的picker容器，用来模拟点击
	 **/
	Uploader.prototype.createPicker = function(){
		var thiz = this,guid = thiz.guid();
        var div = document.createElement('div');
        div.id = guid;
        div.innerHTML = byy.lang.upload.btnText;
        document.body.appendChild(div);
        thiz.id = guid;
        return thiz;
	};
	/*选择文件函数*/
	Uploader.prototype.selectFile = function(){
		var id = this.id;
		var file = $('#'+id).find('input[type="file"]')[0];
		file.click();
		return thiz;
	};
	//销毁当前文件队列，重置
	Uploader.prototype.resetQueue = function(){
		var thiz = this,webuploader = thiz.webUpload;
		webuploader.reset();
		return thiz;
	};
	/*创建webuploader实例*/
	Uploader.prototype.create = function( ){
		var thiz = this,opts = thiz.opts;
		//创建之前先注册chunkregister
		logInfo('创建WEBUPLOADER实例');
		if(opts.md5){
			logInfo('注册Before-send事件');
			webuploader.Uploader.register({
			    'before-send': 'checkchunk'
			}, {
			    checkchunk: function( block ) {
			        var file = block.file;
			        var deferred = $.Deferred();
			        var partList = file.hasPart||[];
			        var partNum = block.chunk;
			        var haspart = false;
			        if(partList.length > 0){
			        	for(var i=0;i<partList.length;i++){
			        		var temp = partList[i];
			        		temp = parseInt(temp,10);
			        		if(temp === partNum){
			        			haspart = true;
			        			break;
			        		}
			        	}
			        }
					if(haspart){
						logInfo('分片'+partNum+'已跳过..');
						deferred.reject();
					}else{
						logInfo('分片'+partNum+'正在上传..')
						deferred.resolve();
					}
			        return deferred.promise();
			    }
			});
		}
		//创建
		thiz.webUpload = webuploader.create({
			swf : ready.swfpath,
			server : opts.server,
			fileNumLimit : opts.count,
			fileSizeLimit : opts.fileSizeLimit,
			fileSingleSizeLimit : opts.fileSingleSizeLimit || opts.size,
			duplicate : opts.duplicate == true ? true : false,
			//只要开启md5就需要阻止上传，在根据传递的auto判断实际情况
			auto : opts.md5 == true ? false :  opts.auto,//根据实际的判断进行自动上传
			pick : {
				id : opts.selector,
				multiple : opts.count == null || opts.count == undefined ? true : (opts.count > 1  ? true : false)
			},
			accept : opts.accept,
			timeout : 0,
			thumb : opts.thumb || false,
			compress : opts.compress || false,
			prepareNextFile : true,
			chunked : opts.md5 || false,
			chunkSize : opts.chunkSize,
			chunkRetry : opts.chunkRetry || 3,
			threads : opts.threads || 3,
			formData : opts.formData || {},
			fileVal : opts.fileVal || 'file',
			method : 'POST'
			
			
		});
		thiz.listen();
		return thiz;
	};

	//简单图片上传- 单张图片上传
	Uploader.prototype.simpleImage = function( opts ){
		var thiz = this;
		var selfCfg = {
			count : 1,
			accept : config.imageAccept,
			auto : true,
			dialog : false,
			md5 : false,
			progress : false,
			compress : false,
			formData : opts.formData || {},
			fileVal : 'file'
		};
		var newopt = byy.extend(thiz.getCfg(),selfCfg);
		opts = byy.extend(newopt,opts);
		thiz.opts = opts;
		//开始上传。
		thiz.create();
		return thiz;
	};
	//简单文件上传
	Uploader.prototype.simpleFile = function( opts ){
		var thiz = this;
		var selfCfg = {
			count : 1,
			trunked : false,
			accept : config.fileAccept,
			auto : true,
			dialog : false,
			md5 : false,
			progress : false,
			compress : false,
			formData : opts.formData || {},
			fileVal : 'file'
			
			
		};
		var newopt = byy.extend(thiz.getCfg(),selfCfg);
		opts = byy.extend(newopt,opts);
		thiz.opts = opts;
		//开始上传。
		thiz.create();
		return thiz;
	};
	//多图上传
	Uploader.prototype.multiImage = function( opts ){
		var thiz = this;
		var selfCfg = {
			accept : config.imageAccept,
			auto : true,
			md5 : false,
			dialog : true,
			hideDialog : false,
			progress : false,
			compress : false,
			formData : opts.formData || {},
			fileVal : 'file'
		};
		var newopt = byy.extend(thiz.getCfg(),selfCfg);
		opts = byy.extend(newopt,opts);
		thiz.opts = opts;
		//开始上传。
		thiz.create();
		return thiz;
	};
	//多文件上传
	Uploader.prototype.multiFile = function( opts ){
		var thiz = this;
		var selfCfg = {
			accept : config.fileAccept,
			auto : true,
			dialog : true,
			hideDialog : false,
			md5 : false,
			progress : false,
			compress : false,
			formData : opts.formData || {},
			fileVal : 'file'
		};
		var newopt = byy.extend(thiz.getCfg(),selfCfg);
		opts = byy.extend(newopt,opts);
		thiz.opts = opts;
		//开始上传。
		thiz.create();
		return thiz;
	};

	//提供外部接口
	byy.define(function( exports ){
		exports('uploader',Uploader);
	});
});