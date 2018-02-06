/***
 * 功能修改记录:
 * 1. 增加配置参数 frameName ,如果打开的是frame 且配置了frameName ，则frame的name 为frameName
 * 2. 增加函数 closeFrameByName 关闭窗口
 * 3. 增加参数 tipsAuto 用于在tips层展示的时候取消自动判断位置的操作。
 * 4. 修复右下角的位置，左移20px
 * 5. 更新layer 3.0
***/
;!(function(factory){
  byy.require(['lang','jquery'],function(){
    factory(window);
  })
})(function(window, undefined){
"use strict";

var isByy = window.byy && byy.define, $, win, ready = {
  getPath: function(){
    var js = document.scripts, script = js[js.length - 1], jsPath = script.src;
    if(script.getAttribute('merge')) return;
    return jsPath.substring(0, jsPath.lastIndexOf("/") + 1);
  }(),

  config: {}, end: {}, minIndex: 0, minLeft: [],
  btn: [byy.lang.win.ok, byy.lang.win.cancel],

  //五种原始层模式
  type: ['dialog', 'page', 'iframe', 'loading', 'tips']
};


//默认内置方法。
var byywin = {
  v: '3.0.0',
  ie: function(){ //ie版本
    var agent = navigator.userAgent.toLowerCase();
    return (!!window.ActiveXObject || "ActiveXObject" in window) ? (
      (agent.match(/msie\s(\d+)/) || [])[1] || '11' //由于ie11并没有msie的标识
    ) : false;
  }(),
  index: (window.byywin && window.byywin.v) ? 100000 : 0,
  path: ready.getPath,
  config: function(options, fn){
    options = options || {};
    byywin.cache = ready.config = $.extend({}, ready.config, options);
    byywin.path = ready.config.path || byywin.path;
    typeof options.extend === 'string' && (options.extend = [options.extend]);
    
    if(ready.config.path) byywin.ready();
    
    if(!options.extend) return this;
    
    isByy 
      ? byy.addcss('modules/byywin/' + options.extend)
    : byywin.link('skin/' + options.extend);
    
    return this;
  },
  
  //载入CSS配件
  link: function(href, fn, cssname){
    
    //未设置路径，则不主动加载css
    if(!byywin.path) return;
    
    var head = $('head')[0], link = document.createElement('link');
    if(typeof fn === 'string') cssname = fn;
    var app = (cssname || href).replace(/\.|\//g, '');
    var id = 'byycss-'+app, timeout = 0;
    
    link.rel = 'stylesheet';
    link.href = byywin.path + href;
    link.id = id;
    
    if(!$('#'+ id)[0]){
      head.appendChild(link);
    }
    
    if(typeof fn !== 'function') return;
    
    //轮询css是否加载完毕
    (function poll() {
      if(++timeout > 8 * 1000 / 100){
        return window.console && console.error('byywin.css: Invalid');
      };
      parseInt($('#'+id).css('width')) === 1989 ? fn() : setTimeout(poll, 100);
    }());
  },
  
  ready: function(callback){
    var cssname = 'skinbyywincss', ver = '1110';
    isByy ? byy.addcss('modules/byywin/default/byywin.css?v='+byywin.v+ver, callback, cssname)
    : byywin.link('skin/default/byywin.css?v='+byywin.v+ver, callback, cssname);
    return this;
  },
  
  //各种快捷引用
  alert: function(content, options, yes){
    var type = typeof options === 'function';
    if(type) yes = options;
    return byywin.open($.extend({
      content: content,
      yes: yes
    }, type ? {} : options));
  }, 
  
  confirm: function(content, options, yes, cancel){ 
    var type = typeof options === 'function';
    if(type){
      cancel = yes;
      yes = options;
    }
    return byywin.open($.extend({
      content: content,
      btn: ready.btn,
      yes: yes,
      btn2: cancel
    }, type ? {} : options));
  },
  
  msg: function(content, options, end){ //最常用提示层
    var type = typeof options === 'function', rskin = ready.config.skin;
    var skin = (rskin ? rskin + ' ' + rskin + '-msg' : '')||'byy-byywin-msg';
    var anim = doms.anim.length - 1;
    if(type) end = options;
    return byywin.open($.extend({
      content: content,
      time: 3000,
      shade: false,
      skin: skin,
      title: false,
      closeBtn: false,
      btn: false,
      resize: false,
      end: end
    }, (type && !ready.config.skin) ? {
      skin: skin + ' byy-byywin-hui',
      anim: anim
    } : function(){
       options = options || {};
       if(options.icon === -1 || options.icon === undefined && !ready.config.skin){
         options.skin = skin + ' ' + (options.skin||'byy-byywin-hui');
       }
       return options;
    }()));  
  },
  
  load: function(icon, options){
    return byywin.open($.extend({
      type: 3,
      icon: icon || 0,
      resize: false,
      shade: 0.01
    }, options));
  }, 
  
  tips: function(content, follow, options){
    return byywin.open($.extend({
      type: 4,
      content: [content, follow],
      closeBtn: false,
      time: 3000,
      shade: false,
      resize: false,
      fixed: false,
      maxWidth: 210
    }, options));
  }
};

var Class = function(setings){  
  var that = this;
  that.index = ++byywin.index;
  that.config = $.extend({}, that.config, ready.config, setings);
  document.body ? that.creat() : setTimeout(function(){
    that.creat();
  }, 30);
};

Class.pt = Class.prototype;

//缓存常用字符
var doms = ['byy-byywin', '.byy-byywin-title', '.byy-byywin-main', '.byy-byywin-dialog', 'byy-byywin-iframe', 'byy-byywin-content', 'byy-byywin-btn', 'byy-byywin-close'];
doms.anim = ['byywin-anim-00', 'byywin-anim-01', 'byywin-anim-02', 'byywin-anim-03', 'byywin-anim-04', 'byywin-anim-05', 'byywin-anim-06'];

//默认配置
Class.pt.config = {
  type: 0,
  shade: 0.3,
  fixed: true,
  move: doms[1],
  title: byy.lang.win.info,
  offset: 'auto',
  area: 'auto',
  closeBtn: 1,
  time: 0, //0表示不自动关闭
  zIndex: 19891204, 
  maxWidth: 360,
  anim: 0,
  isOutAnim : true,
  icon: -1,
  moveType: 1,
  resize: true,
  scrollbar: true, //是否允许浏览器滚动条
  tips: 2
};

//容器
Class.pt.vessel = function(conType, callback){
  var that = this, times = that.index, config = that.config;
  var zIndex = config.zIndex + times, titype = typeof config.title === 'object';
  var ismax = config.maxmin && (config.type === 1 || config.type === 2);
  var titleHTML = (config.title ? '<div class="byy-byywin-title" style="'+ (titype ? config.title[1] : '') +'">' 
    + (titype ? config.title[0] : config.title) 
  + '</div>' : '');
  
  config.zIndex = zIndex;
  callback([
    //遮罩
    config.shade ? ('<div class="byy-byywin-shade" id="byy-byywin-shade'+ times +'" times="'+ times +'" style="'+ ('z-index:'+ (zIndex-1) +'; background-color:'+ (config.shade[1]||'#000') +'; opacity:'+ (config.shade[0]||config.shade) +'; filter:alpha(opacity='+ (config.shade[0]*100||config.shade*100) +');') +'"></div>') : '',
    
    //主体
    '<div class="'+ doms[0] + (' byy-byywin-'+ready.type[config.type]) + (((config.type == 0 || config.type == 2) && !config.shade) ? ' byy-byywin-border' : '') + ' ' + (config.skin||'') +'" id="'+ doms[0] + times +'" type="'+ ready.type[config.type] +'" times="'+ times +'" showtime="'+ config.time +'" conType="'+ (conType ? 'object' : 'string') +'" style="z-index: '+ zIndex +'; width:'+ config.area[0] + ';height:' + config.area[1] + (config.fixed ? '' : ';position:absolute;') +'">'
      + (conType && config.type != 2 ? '' : titleHTML)
      + '<div id="'+ (config.id||'') +'" class="byy-byywin-content'+ ((config.type == 0 && config.icon !== -1) ? ' byy-byywin-padding' :'') + (config.type == 3 ? ' byy-byywin-loading'+config.icon : '') +'">'
        + (config.type == 0 && config.icon !== -1 ? '<i class="byy-byywin-ico byy-byywin-ico'+ config.icon +'"></i>' : '')
        + (config.type == 1 && conType ? '' : (config.content||''))
      + '</div>'
      + '<span class="byy-byywin-setwin">'+ function(){
        var closebtn = ismax ? '<a class="byy-byywin-min" href="javascript:;"><cite></cite></a><a class="byy-byywin-ico byy-byywin-max" href="javascript:;"></a>' : '';
        config.closeBtn && (closebtn += '<a class="byy-byywin-ico '+ doms[7] +' '+ doms[7] + (config.title ? config.closeBtn : (config.type == 4 ? '1' : '2')) +'" href="javascript:;"></a>');
        return closebtn;
      }() + '</span>'
      + (config.btn ? function(){
        var button = '';
        typeof config.btn === 'string' && (config.btn = [config.btn]);
        for(var i = 0, len = config.btn.length; i < len; i++){
          button += '<a class="'+ doms[6] +''+ i +'">'+ config.btn[i] +'</a>'
        }
        return '<div class="'+ doms[6] +' byy-byywin-btn-'+ (config.btnAlign||'') +'">'+ button +'</div>'
      }() : '')
      + (config.resize ? '<span class="byy-byywin-resize"></span>' : '')
    + '</div>'
  ], titleHTML, $('<div class="byy-byywin-move"></div>'));
  return that;
};

//创建骨架
Class.pt.creat = function(){
  var that = this
  ,config = that.config
  ,times = that.index, nodeIndex
  ,content = config.content
  ,conType = typeof content === 'object'
  ,body = $('body');
  
  if(config.id && $('#'+config.id)[0])  return;

  if(typeof config.area === 'string'){
    config.area = config.area === 'auto' ? ['', ''] : [config.area, ''];
  }
  
  //anim兼容旧版shift
  if(config.shift){
    config.anim = config.shift;
  }
  
  if(byywin.ie == 6){
    config.fixed = false;
  }
  
  switch(config.type){
    case 0:
      config.btn = ('btn' in config) ? config.btn : ready.btn[0];
      byywin.closeAll('dialog');
    break;
    case 2:
      var content = config.content = conType ? config.content : [config.content||'http://www.boyuyun.com', 'auto'];
      config.content = '<iframe scrolling="'+ (config.content[1]||'auto') +'" allowtransparency="true" id="'+ doms[4] +''+ times +'" name="'+(config.frameName ||  (doms[4] +''+ times )) +'" onload="this.className=\'\';" class="'+(config.noloading===true ? '' : 'byy-byywin-load')+'" frameborder="0" src="' + config.content[0] + '"></iframe>';
    break;
    case 3:
      delete config.title;
      delete config.closeBtn;
      config.icon === -1 && (config.icon === 0);
      byywin.closeAll('loading');
    break;
    case 4:
      conType || (config.content = [config.content, 'body']);
      config.follow = config.content[1];
      config.content = config.content[0] + '<i class="byy-byywin-TipsG"></i>';
      delete config.title;
      config.tips = typeof config.tips === 'object' ? config.tips : [config.tips, true];
      config.tipsMore || byywin.closeAll('tips');
    break;
  }
  
  //建立容器
  that.vessel(conType, function(html, titleHTML, moveElem){
    body.append(html[0]);
    conType ? (function(){
      (config.type == 2 || config.type == 4) ? (function(){
        $('body').append(html[1]);
      })() : (function(){
        if(!content.parents('.'+doms[0])[0]){
          content.data('display', content.css('display')).show().addClass('byy-byywin-wrap').wrap(html[1]);
          $('#'+ doms[0] + times).find('.'+doms[5]).before(titleHTML);
        }
      })();
    })() : body.append(html[1]);
    $('.byy-byywin-move')[0] || body.append(ready.moveElem = moveElem);
    that.byywino = $('#'+ doms[0] + times);
    config.scrollbar || doms.html.css('overflow', 'hidden').attr('byywin-full', times);
  }).auto(times);

   //遮罩
  $('#byy-byywin-shade'+ that.index).css({
    'background-color': config.shade[1] || '#000'
    ,'opacity': config.shade[0]||config.shade
  });

  config.type == 2 && byywin.ie == 6 && that.byywino.find('iframe').attr('src', content[0]);

  //坐标自适应浏览器窗口尺寸
  config.type == 4 ? that.tips() : that.offset();
  if(config.fixed){
    win.on('resize', function(){
      that.offset();
      (/^\d+%$/.test(config.area[0]) || /^\d+%$/.test(config.area[1])) && that.auto(times);
      config.type == 4 && that.tips();
    });
  }
  
  config.time <= 0 || setTimeout(function(){
    byywin.close(that.index)
  }, config.time);
  that.move().callback();
  
  //为兼容jQuery3.0的css动画影响元素尺寸计算
  if(doms.anim[config.anim]){
    var animClass = 'byywin-anim '+ doms.anim[config.anim];
    that.byywino.addClass(animClass).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
      $(this).removeClass(animClass);
    });
  };

  //记录关闭动画
  if(config.isOutAnim){
    that.byywino.data('isOutAnim', true);
  }

};

//自适应
Class.pt.auto = function(index){
  var that = this, config = that.config, byywino = $('#'+ doms[0] + index);
  if(config.area[0] === '' && config.maxWidth > 0){
    //为了修复IE7下一个让人难以理解的bug
    if(byywin.ie && byywin.ie < 8 && config.btn){
      byywino.width(byywino.innerWidth());
    }
    byywino.outerWidth() > config.maxWidth && byywino.width(config.maxWidth);
  }
  var area = [byywino.innerWidth(), byywino.innerHeight()],
      titHeight = byywino.find(doms[1]).outerHeight() || 0,
      btnHeight = byywino.find('.'+doms[6]).outerHeight() || 0,
      setHeight = function(elem){
        elem = byywino.find(elem);
        elem.height(area[1] - titHeight - btnHeight - 2*(parseFloat(elem.css('padding-bottom'))|0));
      };

  switch(config.type){
    case 2: 
      setHeight('iframe');
    break;
    default:
      if(config.area[1] === ''){
        if(config.maxHeight > 0 && byywino.outerHeight() > config.maxHeight){
          area[1] = config.maxHeight;
          setHeight('.'+doms[5]);
        } else if(config.fixed && area[1] >= win.height()){
          area[1] = win.height();
          setHeight('.'+doms[5]);
        }
      } else {
        setHeight('.'+doms[5]);
      }
    break;
  }
  return that;
};

//计算坐标
Class.pt.offset = function(){
  var that = this, config = that.config, byywino = that.byywino;
  var area = [byywino.outerWidth(), byywino.outerHeight()];
  var type = typeof config.offset === 'object';
  that.offsetTop = (win.height() - area[1])/2;
  that.offsetLeft = (win.width() - area[0])/2;
  
  if(type){
    that.offsetTop = config.offset[0];
    that.offsetLeft = config.offset[1]||that.offsetLeft;
  } else if(config.offset !== 'auto'){
    
    if(config.offset === 't'){ //上
      that.offsetTop = 0;
    } else if(config.offset === 'r'){ //右
      that.offsetLeft = win.width() - area[0];
    } else if(config.offset === 'b'){ //下
      that.offsetTop = win.height() - area[1];
    } else if(config.offset === 'l'){ //左
      that.offsetLeft = 0;
    } else if(config.offset === 'lt'){ //左上角
      that.offsetTop = 0;
      that.offsetLeft = 0;
    } else if(config.offset === 'lb'){ //左下角
      that.offsetTop = win.height() - area[1];
      that.offsetLeft = 0;
    } else if(config.offset === 'rt'){ //右上角
      that.offsetTop = 0;
      that.offsetLeft = win.width() - area[0];
    } else if(config.offset === 'rb'){ //右下角
      that.offsetTop = win.height() - area[1];
      that.offsetLeft = win.width() - area[0] - 20;//去除滚动条可能被隐藏的可能，直接左移20px,edited by lixun on 2017年9月1日 10:18:41
    } else {
      that.offsetTop = config.offset;
    }
    
  }
 
  if(!config.fixed){
    that.offsetTop = /%$/.test(that.offsetTop) ? 
      win.height()*parseFloat(that.offsetTop)/100
    : parseFloat(that.offsetTop);
    that.offsetLeft = /%$/.test(that.offsetLeft) ? 
      win.width()*parseFloat(that.offsetLeft)/100
    : parseFloat(that.offsetLeft);
    that.offsetTop += win.scrollTop();
    that.offsetLeft += win.scrollLeft();
  }
  
  if(byywino.attr('minLeft')){
    that.offsetTop = win.height() - (byywino.find(doms[1]).outerHeight() || 0);
    that.offsetLeft = byywino.css('left');
  }

  byywino.css({top: that.offsetTop, left: that.offsetLeft});
};

//Tips
Class.pt.tips = function(){
  var that = this, config = that.config, byywino = that.byywino;
  var layArea = [byywino.outerWidth(), byywino.outerHeight()], follow = $(config.follow);
  if(!follow[0]) follow = $('body');
  var goal = {
    width: follow.outerWidth(),
    height: follow.outerHeight(),
    top: follow.offset().top,
    left: follow.offset().left
  }, tipsG = byywino.find('.byy-byywin-TipsG');
  
  var guide = config.tips[0];
  config.tips[1] || tipsG.remove();
  
  goal.autoLeft = function(){
    if(goal.left + layArea[0] - win.width() > 0){
      goal.tipLeft = goal.left + goal.width - layArea[0];
      tipsG.css({right: 12, left: 'auto'});
    } else {
      goal.tipLeft = goal.left;
    };
  };
  
  //辨别tips的方位
  goal.where = [function(){ //上        
    goal.autoLeft();
    goal.tipTop = goal.top - layArea[1] - 10;
    tipsG.removeClass('byy-byywin-TipsB').addClass('byy-byywin-TipsT').css('border-right-color', config.tips[1]);
  }, function(){ //右
    goal.tipLeft = goal.left + goal.width + 10;
    goal.tipTop = goal.top;
    tipsG.removeClass('byy-byywin-TipsL').addClass('byy-byywin-TipsR').css('border-bottom-color', config.tips[1]); 
  }, function(){ //下
    goal.autoLeft();
    goal.tipTop = goal.top + goal.height + 10;
    tipsG.removeClass('byy-byywin-TipsT').addClass('byy-byywin-TipsB').css('border-right-color', config.tips[1]);
  }, function(){ //左
    goal.tipLeft = goal.left - layArea[0] - 10;
    goal.tipTop = goal.top;
    tipsG.removeClass('byy-byywin-TipsR').addClass('byy-byywin-TipsL').css('border-bottom-color', config.tips[1]);
  }];
  goal.where[guide-1]();
  
  /* 8*2为小三角形占据的空间 */
  if(guide === 1){
    if(config.tipsAuto === null || config.tipsAuto === undefined || config.tipsAuto === true){
      goal.top - (win.scrollTop() + layArea[1] + 8*2) < 0 && goal.where[2]();  
    }/*else{
      byywino.find('.'+doms[5]).css({width : layArea[0]});
    }*/
  } else if(guide === 2){
    if(config.tipsAuto === null || config.tipsAuto === undefined || config.tipsAuto === true){
      win.width() - (goal.left + goal.width + layArea[0] + 8*2) > 0 || goal.where[3]()
    }/*else{
      byywino.find('.'+doms[5]).css({width : layArea[0]});
    }*/
  } else if(guide === 3){
    if(config.tipsAuto === null || config.tipsAuto === undefined || config.tipsAuto === true){
      (goal.top - win.scrollTop() + goal.height + layArea[1] + 8*2) - win.height() > 0 && goal.where[0]();
    }/*else{
      byywino.find('.'+doms[5]).css({width : layArea[0]});
    }*/
  } else if(guide === 4){
    if(config.tipsAuto === null || config.tipsAuto === undefined || config.tipsAuto === true){
      layArea[0] + 8*2 - goal.left > 0 && goal.where[1]()
    }/*else{
      byywino.find('.'+doms[5]).css({width : layArea[0]});
    }*/
  }

  byywino.find('.'+doms[5]).css({
    'background-color': config.tips[1], 
    'padding-right': (config.closeBtn ? '30px' : '')
  });
  byywino.css({
    left: goal.tipLeft - (config.fixed ? win.scrollLeft() : 0), 
    top: goal.tipTop  - (config.fixed ? win.scrollTop() : 0)
  });
}

//拖拽层
Class.pt.move = function(){
  var that = this
  ,config = that.config
  ,_DOC = $(document)
  ,byywino = that.byywino
  ,moveElem = byywino.find(config.move)
  ,resizeElem = byywino.find('.byy-byywin-resize')
  ,dict = {};
  
  if(config.move){
    moveElem.css('cursor', 'move');
  }

  moveElem.on('mousedown', function(e){
    e.preventDefault();
    if(config.move){
      dict.moveStart = true;
      dict.offset = [
        e.clientX - parseFloat(byywino.css('left'))
        ,e.clientY - parseFloat(byywino.css('top'))
      ];
      ready.moveElem.css('cursor', 'move').show();
    }
  });
  
  resizeElem.on('mousedown', function(e){
    e.preventDefault();
    dict.resizeStart = true;
    dict.offset = [e.clientX, e.clientY];
    dict.area = [
      byywino.outerWidth()
      ,byywino.outerHeight()
    ];
    ready.moveElem.css('cursor', 'se-resize').show();
  });
  
  _DOC.on('mousemove', function(e){

    //拖拽移动
    if(dict.moveStart){
      var X = e.clientX - dict.offset[0]
      ,Y = e.clientY - dict.offset[1]
      ,fixed = byywino.css('position') === 'fixed';
      
      e.preventDefault();
      
      dict.stX = fixed ? 0 : win.scrollLeft();
      dict.stY = fixed ? 0 : win.scrollTop();

      //控制元素不被拖出窗口外
      if(!config.moveOut){
        var setRig = win.width() - byywino.outerWidth() + dict.stX
        ,setBot = win.height() - byywino.outerHeight() + dict.stY;  
        X < dict.stX && (X = dict.stX);
        X > setRig && (X = setRig); 
        Y < dict.stY && (Y = dict.stY);
        Y > setBot && (Y = setBot);
      }
      
      byywino.css({
        left: X
        ,top: Y
      });
    }
    
    //Resize
    if(config.resize && dict.resizeStart){
      var X = e.clientX - dict.offset[0]
      ,Y = e.clientY - dict.offset[1];
      
      e.preventDefault();
      
      byywin.style(that.index, {
        width: dict.area[0] + X
        ,height: dict.area[1] + Y
      })
      dict.isResize = true;
      config.resizing && config.resizing(byywino);
    }
  }).on('mouseup', function(e){
    if(dict.moveStart){
      delete dict.moveStart;
      ready.moveElem.hide();
      config.moveEnd && config.moveEnd();
    }
    if(dict.resizeStart){
      delete dict.resizeStart;
      ready.moveElem.hide();
    }
  });
  
  return that;
};

Class.pt.callback = function(){
  var that = this, byywino = that.byywino, config = that.config;
  that.openbyywin();
  if(config.success){
    if(config.type == 2){
      byywino.find('iframe').on('load', function(){
        config.success(byywino, that.index);
      });
    } else {
      config.success(byywino, that.index);
    }
  }
  byywin.ie == 6 && that.IE6(byywino);
  
  //按钮
  byywino.find('.'+ doms[6]).children('a').on('click', function(){
    var index = $(this).index();
    if(index === 0){
      if(config.yes){
        config.yes(that.index, byywino)
      } else if(config['btn1']){
        config['btn1'](that.index, byywino)
      } else {
        byywin.close(that.index);
      }
    } else {
      var close = config['btn'+(index+1)] && config['btn'+(index+1)](that.index, byywino);
      close === false || byywin.close(that.index);
    }
  });
  
  //取消
  function cancel(){
    var close = config.cancel && config.cancel(that.index, byywino);
    close === false || byywin.close(that.index);
  }
  
  //右上角关闭回调
  byywino.find('.'+ doms[7]).on('click', cancel);
  
  //点遮罩关闭
  if(config.shadeClose){
    $('#byy-byywin-shade'+ that.index).on('click', function(){
      byywin.close(that.index);
    });
  } 
  
  //最小化
  byywino.find('.byy-byywin-min').on('click', function(){
    var min = config.min && config.min(byywino);
    min === false || byywin.min(that.index, config); 
  });
  
  //全屏/还原
  byywino.find('.byy-byywin-max').on('click', function(){
    if($(this).hasClass('byy-byywin-maxmin')){
      byywin.restore(that.index);
      config.restore && config.restore(byywino);
    } else {
      byywin.full(that.index, config);
      setTimeout(function(){
        config.full && config.full(byywino);
      }, 100);
    }
  });

  config.end && (ready.end[that.index] = config.end);
};

//for ie6 恢复select
ready.reselect = function(){
  $.each($('select'), function(index , value){
    var sthis = $(this);
    if(!sthis.parents('.'+doms[0])[0]){
      (sthis.attr('byywin') == 1 && $('.'+doms[0]).length < 1) && sthis.removeAttr('byywin').show(); 
    }
    sthis = null;
  });
}; 

Class.pt.IE6 = function(byywino){
  //隐藏select
  $('select').each(function(index , value){
    var sthis = $(this);
    if(!sthis.parents('.'+doms[0])[0]){
      sthis.css('display') === 'none' || sthis.attr({'byywin' : '1'}).hide();
    }
    sthis = null;
  });
};

//需依赖原型的对外方法
Class.pt.openbyywin = function(){
  var that = this;
  
  //置顶当前窗口
  byywin.zIndex = that.config.zIndex;
  byywin.setTop = function(byywino){
    var setZindex = function(){
      byywin.zIndex++;
      byywino.css('z-index', byywin.zIndex + 1);
    };
    byywin.zIndex = parseInt(byywino[0].style.zIndex);
    byywino.on('mousedown', setZindex);
    return byywin.zIndex;
  };
};

ready.record = function(byywino){
  var area = [
    byywino.width(),
    byywino.height(),
    byywino.position().top, 
    byywino.position().left + parseFloat(byywino.css('margin-left'))
  ];
  byywino.find('.byy-byywin-max').addClass('byy-byywin-maxmin');
  byywino.attr({area: area});
};

ready.rescollbar = function(index){
  if(doms.html.attr('byywin-full') == index){
    if(doms.html[0].style.removeProperty){
      doms.html[0].style.removeProperty('overflow');
    } else {
      doms.html[0].style.removeAttribute('overflow');
    }
    doms.html.removeAttr('byywin-full');
  }
};

/** 内置成员 */

window.byywin = byywin;

//获取子iframe的DOM
byywin.getChildFrame = function(selector, index){
  index = index || $('.'+doms[4]).attr('times');
  return $('#'+ doms[0] + index).find('iframe').contents().find(selector);  
};

//得到当前iframe层的索引，子iframe时使用
byywin.getFrameIndex = function(name){
  return $('#'+ name).parents('.'+doms[4]).attr('times');
};
//根据frameName 关闭当前的窗口
byywin.closeFrameByName = function(name){
  var $frame = byy.findFrameByName(name);
  var index = $frame.parents('.'+doms[4]).attr('times');
  byywin.close(index);
};

//iframe层自适应宽高
byywin.iframeAuto = function(index){
  if(!index) return;
  var heg = byywin.getChildFrame('html', index).outerHeight();
  var byywino = $('#'+ doms[0] + index);
  var titHeight = byywino.find(doms[1]).outerHeight() || 0;
  var btnHeight = byywino.find('.'+doms[6]).outerHeight() || 0;
  byywino.css({height: heg + titHeight + btnHeight});
  byywino.find('iframe').css({height: heg});
};

//重置iframe url
byywin.iframeSrc = function(index, url){
  $('#'+ doms[0] + index).find('iframe').attr('src', url);
};

//设定层的样式
byywin.style = function(index, options, limit){
  var byywino = $('#'+ doms[0] + index)
  ,contElem = byywino.find('.byy-byywin-content')
  ,type = byywino.attr('type')
  ,titHeight = byywino.find(doms[1]).outerHeight() || 0
  ,btnHeight = byywino.find('.'+doms[6]).outerHeight() || 0
  ,minLeft = byywino.attr('minLeft');
  
  if(type === ready.type[3] || type === ready.type[4]){
    return;
  }
  
  if(!limit){
    if(parseFloat(options.width) <= 260){
      options.width = 260;
    };
    
    if(parseFloat(options.height) - titHeight - btnHeight <= 64){
      options.height = 64 + titHeight + btnHeight;
    };
  }
  
  byywino.css(options);
  btnHeight = byywino.find('.'+doms[6]).outerHeight();
  
  if(type === ready.type[2]){
    byywino.find('iframe').css({
      height: parseFloat(options.height) - titHeight - btnHeight
    });
  } else {
    contElem.css({
      height: parseFloat(options.height) - titHeight - btnHeight
      - parseFloat(contElem.css('padding-top'))
      - parseFloat(contElem.css('padding-bottom'))
    })
  }
};

//最小化
byywin.min = function(index, options){
  var byywino = $('#'+ doms[0] + index)
  ,titHeight = byywino.find(doms[1]).outerHeight() || 0
  //,left = byywino.attr('minLeft') || (181*ready.minIndex)+'px'
  //edited by lixun on 2017年4月13日 11:37:11,增加右下角位置
  ,left = byywino.attr('minLeft') || (options.offset && options.offset.indexOf('r') > -1 ? (win.width() - 181*(ready.minIndex+1)) : 181*ready.minIndex) + 'px'
  ,position = byywino.css('position');
  
  ready.record(byywino);
  
  if(ready.minLeft[0]){
    left = ready.minLeft[0];
    ready.minLeft.shift();
  }
  
  byywino.attr('position', position);
  
  byywin.style(index, {
    width: 180
    ,height: titHeight
    ,left: left
    ,top: win.height() - titHeight
    ,position: 'fixed'
    ,overflow: 'hidden'
  }, true);

  byywino.find('.byy-byywin-min').hide();
  byywino.attr('type') === 'page' && byywino.find(doms[4]).hide();
  ready.rescollbar(index);
  
  if(!byywino.attr('minLeft')){
    ready.minIndex++;
  }
  byywino.attr('minLeft', left);
};

//还原
byywin.restore = function(index){
  var byywino = $('#'+ doms[0] + index), area = byywino.attr('area').split(',');
  var type = byywino.attr('type');
  byywin.style(index, {
    width: parseFloat(area[0]), 
    height: parseFloat(area[1]), 
    top: parseFloat(area[2]), 
    left: parseFloat(area[3]),
    position: byywino.attr('position'),
    overflow: 'visible'
  }, true);
  byywino.find('.byy-byywin-max').removeClass('byy-byywin-maxmin');
  byywino.find('.byy-byywin-min').show();
  byywino.attr('type') === 'page' && byywino.find(doms[4]).show();
  ready.rescollbar(index);
};

//全屏
byywin.full = function(index){
  var byywino = $('#'+ doms[0] + index), timer;
  ready.record(byywino);
  if(!doms.html.attr('byywin-full')){
    doms.html.css('overflow','hidden').attr('byywin-full', index);
  }
  clearTimeout(timer);
  timer = setTimeout(function(){
    var isfix = byywino.css('position') === 'fixed';
    byywin.style(index, {
      top: isfix ? 0 : win.scrollTop(),
      left: isfix ? 0 : win.scrollLeft(),
      width: win.width(),
      height: win.height()
    }, true);
    byywino.find('.byy-byywin-min').hide();
  }, 100);
};

//改变title
byywin.title = function(name, index){
  var title = $('#'+ doms[0] + (index||byywin.index)).find(doms[1]);
  title.html(name);
};

//关闭byywin总方法
byywin.close = function(index){
  var byywino = $('#'+ doms[0] + index), type = byywino.attr('type'), closeAnim = 'byywin-anim-close';
  if(!byywino[0]) return;
  var WRAP = 'byy-byywin-wrap', remove = function(){
    if(type === ready.type[1] && byywino.attr('conType') === 'object'){
      byywino.children(':not(.'+ doms[5] +')').remove();
      var wrap = byywino.find('.'+WRAP);
      for(var i = 0; i < 2; i++){
        wrap.unwrap();
      }
      wrap.css('display', wrap.data('display')).removeClass(WRAP);
    } else {
      //低版本IE 回收 iframe
      if(type === ready.type[2]){
        try {
          var iframe = $('#'+doms[4]+index)[0];
          iframe.contentWindow.document.write('');
          iframe.contentWindow.close();
          byywino.find('.'+doms[5])[0].removeChild(iframe);
        } catch(e){}
      }
      byywino[0].innerHTML = '';
      byywino.remove();
    }
    typeof ready.end[index] === 'function' && ready.end[index]();
    delete ready.end[index];
  };
  
  if(byywino.data('isOutAnim')){
    byywino.addClass('byywin-anim '+ closeAnim);
  }
  
  
  $('#byy-byywin-moves, #byy-byywin-shade' + index).remove();
  byywin.ie == 6 && ready.reselect();
  ready.rescollbar(index); 
  if(byywino.attr('minLeft')){
    ready.minIndex--;
    ready.minLeft.push(byywino.attr('minLeft'));
  }
  if((byywin.ie && byywin.ie < 10) || !byywino.data('isOutAnim')){
    remove()
  } else {
    setTimeout(function(){
      remove();
    }, 200);
  }
  
};

//关闭所有层
byywin.closeAll = function(type){
  $.each($('.'+doms[0]), function(){
    var othis = $(this);
    var is = type ? (othis.attr('type') === type) : 1;
    is && byywin.close(othis.attr('times'));
    is = null;
  });
};

/** 

  拓展模块，byy开始合并在一起

 */

var cache = byywin.cache||{}, skin = function(type){
  return (cache.skin ? (' ' + cache.skin + ' ' + cache.skin + '-'+type) : '');
}; 
 
//仿系统prompt
byywin.prompt = function(options, yes){
  var style = '';
  options = options || {};
  
  if(typeof options === 'function') yes = options;
  
  if(options.area){
    var area = options.area;
    style = 'style="width: '+ area[0] +'; height: '+ area[1] + ';"';
    delete options.area;
  }
  var prompt, content = options.formType == 2 ? '<textarea class="byy-byywin-input"' + style +' placeholder="'+(options.placeholder || '')+'">' + (options.value||'') +'</textarea>' : function(){
    return '<input type="'+ (options.formType == 1 ? 'password' : 'text') +'" placeholder="'+(options.placeholder || '')+'" class="byy-byywin-input" value="'+ (options.value||'') +'">';
  }();

  var success = options.success;
  delete options.success;

  return byywin.open($.extend({
    type: 1
    ,btn: [byy.lang.win.ok,byy.lang.win.cancel]
    ,content: content
    ,skin: 'byy-byywin-prompt' + skin('prompt')
    ,maxWidth: win.width()
    ,success: function(byywino){
      prompt = byywino.find('.byy-byywin-input');
      prompt.focus();
      typeof success === 'function' && success(byywino);
    }
    ,resize: false
    ,yes: function(index){
      var value = prompt.val();
      if(!options.noNeedCheck){
        if(value === ''){
          prompt.focus();
        } else if(value.length > (options.maxlength||500)) {
          byywin.tips(byy.formatStr(byy.lang.win.maxlength,(options.maxlength || 500)), prompt, {tips: 1});
        } else {
          yes && yes(value, index, prompt);
        }
      }else{
        yes && yes(value, index, prompt);
      }
    }
  }, options));
};

//tab层
byywin.tab = function(options){
  options = options || {};
  var tab = options.tab || {},
      THIS = 'byy-byywin-tabnow',
      success = options.success;
  delete options.success;

  return byywin.open($.extend({
    type: 1,
    skin: 'byy-byywin-tab' + skin('tab'),
    resize: false,
    title: function(){
      var len = tab.length, ii = 1, str = '';
      if(len > 0){
        str = '<span class="byy-byywin-tabnow">'+ tab[0].title +'</span>';
        for(; ii < len; ii++){
          str += '<span>'+ tab[ii].title +'</span>';
        }
      }
      return str;
    }(),
    content: '<ul class="byy-byywin-tabmain">'+ function(){
      var len = tab.length, ii = 1, str = '';
      if(len > 0){
        str = '<li class="byy-byywin-tabli xubox_tab_byywin">'+ (tab[0].content || 'no content') +'</li>';
        for(; ii < len; ii++){
          str += '<li class="byy-byywin-tabli">'+ (tab[ii].content || 'no  content') +'</li>';
        }
      }
      return str;
    }() +'</ul>',
    success: function(byywino){
      var btn = byywino.find('.byy-byywin-title').children();
      var main = byywino.find('.byy-byywin-tabmain').children();
      btn.on('mousedown', function(e){
        e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
        var othis = $(this), index = othis.index();
        othis.addClass(THIS).siblings().removeClass(THIS);
        main.eq(index).show().siblings().hide();
        typeof options.change === 'function' && options.change(index);
      });
      typeof success === 'function' && success(byywino);
    }
  }, options));
};

//相册层
byywin.photos = function(options, loop, key){
  var dict = {};
  options = options || {};
  if(!options.photos) return;
  var type = options.photos.constructor === Object;
  var photos = type ? options.photos : {}, data = photos.data || [];
  var start = photos.start || 0;
  dict.imgIndex = (start|0) + 1;
  
  options.img = options.img || 'img';

  var success = options.success;
  delete options.success;

  if(!type){ //页面直接获取
    var parent = $(options.photos), pushData = function(){
      data = [];
      parent.find(options.img).each(function(index){
        var othis = $(this);
        othis.attr('byywin-index', index);
        data.push({
          alt: othis.attr('alt'),
          pid: othis.attr('byywin-pid'),
          src: othis.attr('byywin-src') || othis.attr('src'),
          thumb: othis.attr('src')
        });
      })
    };
    
    pushData();
    
    if (data.length === 0) return;
    
    loop || parent.on('click', options.img, function(){
      var othis = $(this), index = othis.attr('byywin-index'); 
      byywin.photos($.extend(options, {
        photos: {
          start: index,
          data: data,
          tab: options.tab
        },
        full: options.full
      }), true);
      pushData();
    })
    
    //不直接弹出
    if(!loop) return;
    
  } else if (data.length === 0){
    return byywin.msg(byy.lang.win.nopic);
  }
  
  //上一张
  dict.imgprev = function(key){
    dict.imgIndex--;
    if(dict.imgIndex < 1){
      dict.imgIndex = data.length;
    }
    dict.tabimg(key);
  };
  
  //下一张
  dict.imgnext = function(key,errorMsg){
    dict.imgIndex++;
    if(dict.imgIndex > data.length){
      dict.imgIndex = 1;
      if (errorMsg) {return};
    }
    dict.tabimg(key)
  };
  
  //方向键
  dict.keyup = function(event){
    if(!dict.end){
      var code = event.keyCode;
      event.preventDefault();
      if(code === 37){
        dict.imgprev(true);
      } else if(code === 39) {
        dict.imgnext(true);
      } else if(code === 27) {
        byywin.close(dict.index);
      }
    }
  }
  
  //切换
  dict.tabimg = function(key){
    if(data.length <= 1) return;
    photos.start = dict.imgIndex - 1;
    byywin.close(dict.index);
    return byywin.photos(options, true, key);
    setTimeout(function(){
      byywin.photos(options,true,key);
    });
  }
  
  //一些动作
  dict.event = function(){
    dict.bigimg.hover(function(){
      dict.imgsee.show();
    }, function(){
      dict.imgsee.hide();
    });
    
    dict.bigimg.find('.byy-byywin-imgprev').on('click', function(event){
      event.preventDefault();
      dict.imgprev();
    });  
    
    dict.bigimg.find('.byy-byywin-imgnext').on('click', function(event){     
      event.preventDefault();
      dict.imgnext();
    });
    
    $(document).on('keyup', dict.keyup);
  };
  
  //图片预加载
  function loadImage(url, callback, error) {   
    var img = new Image();
    img.src = url; 
    if(img.complete){
      return callback(img);
    }
    img.onload = function(){
      img.onload = null;
      callback(img);
    };
    img.onerror = function(e){
      img.onerror = null;
      error(e);
    };  
  };
  
  dict.loadi = byywin.load(1, {
    shade: 'shade' in options ? false : 0.9,
    scrollbar: false
  });
  loadImage(data[start].src, function(img){
    byywin.close(dict.loadi);
    dict.index = byywin.open($.extend({
      type: 1,
      id: 'byy-byywin-photos',
      area: function(){
        var imgarea = [img.width, img.height];
        var winarea = [$(window).width() - 100, $(window).height() - 100];
        
        //如果 实际图片的宽或者高比 屏幕大（那么进行缩放）
        if(!options.full && (imgarea[0]>winarea[0]||imgarea[1]>winarea[1])){
          var wh = [imgarea[0]/winarea[0],imgarea[1]/winarea[1]];//取宽度缩放比例、高度缩放比例
          if(wh[0] > wh[1]){//取缩放比例最大的进行缩放
            imgarea[0] = imgarea[0]/wh[0];
            imgarea[1] = imgarea[1]/wh[0];
          } else if(wh[0] < wh[1]){
            imgarea[0] = imgarea[0]/wh[1];
            imgarea[1] = imgarea[1]/wh[1];
          }
        }
        
        return [imgarea[0]+'px', imgarea[1]+'px']; 
      }(),
      title: false,
      shade: 0.9,
      shadeClose: true,
      closeBtn: false,
      move: '.byy-byywin-phimg img',
      moveType: 1,
      scrollbar: false,
      moveOut: true,
      // anim: Math.random()*5|0,
      isOutAnim : false,
      skin: 'byy-byywin-photos' + skin('photos'),
      content: '<div class="byy-byywin-phimg">'
        +'<img src="'+ data[start].src +'" alt="'+ (data[start].alt||'') +'" byywin-pid="'+ data[start].pid +'">'
        +'<div class="byy-byywin-imgsee">'
          +(data.length > 1 ? '<span class="byy-byywin-imguide"><a href="javascript:;" class="byy-byywin-iconext byy-byywin-imgprev"></a><a href="javascript:;" class="byy-byywin-iconext byy-byywin-imgnext"></a></span>' : '')
          +'<div class="byy-byywin-imgbar" style="display:'+ (key ? 'block' : '') +'"><span class="byy-byywin-imgtit"><a href="javascript:;">'+ (data[start].alt||'') +'</a><em>'+ dict.imgIndex +'/'+ data.length +'</em></span></div>'
        +'</div>'
      +'</div>',
      success: function(byywino, index){
        dict.bigimg = byywino.find('.byy-byywin-phimg');
        dict.imgsee = byywino.find('.byy-byywin-imguide,.byy-byywin-imgbar');
        dict.event(byywino);
        options.tab && options.tab(data[start], byywino);
        typeof success === 'function' && success(byywino);
      }, end: function(){
        dict.end = true;
        $(document).off('keyup', dict.keyup);
      }
    }, options));
  }, function(){
    byywin.close(dict.loadi);
    byywin.msg(byy.lang.win.picerror, {
      time: 30000, 
      btn: [byy.lang.win.picnext, byy.lang.win.picover], 
      yes: function(){
        data.length > 1 && dict.imgnext(true,true);
      }
    });
  });
};

//主入口
ready.run = function(_$){
  $ = _$;
  win = $(window);
  doms.html = $('html');
  byywin.open = function(deliver){
    var o = new Class(deliver);
    return o.index;
  };
};

//加载方式
window.byy && byy.define ? (
  byywin.ready()
  ,byy.define(['jquery','lang'], function(exports){ //byy加载
    byywin.path = byy.cache.dir;
    ready.run(byy.jquery || window.jQuery);

    //暴露模块
    window.byywin = byywin;
    exports('win', byywin);
  })
) : (
  typeof define === 'function' ? define(['jquery'], function(){ //requirejs加载
    ready.run(window.jQuery);
    return byywin;
  }) : function(){ //普通script标签加载
    ready.run(window.jQuery);
    byywin.ready();
  }()
);

});