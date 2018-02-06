/******
 * 下拉框扩展
 * @author wangjian
 * @created on 2017年4月26日 
 * @version 1.0
 * @version 1.0.1 增加国际化处理
 * @version 1.1 赋值功能，多选模式选择后不关闭，getValues获取值, 宽度匹配select宽度
 ******/


var selectextend = function (opts) {
  return new selectextend.fn.init(opts);
};

selectextend.val = function (selector) {
  var thiz = $(selector).data('self');
  if (thiz) {
    thiz.val([].slice.call(arguments, 1));
  } else {
    error('错误, 请检查selector是否正确!')
  }
}

selectextend.fn = selectextend.prototype = {
  init: function (opts) {
    if (typeof opts === 'string') {
      this.opts = { selector: opts };
    } else {
      this.opts = opts;
    }
    this.callback();
    return this;
  }
};

var cls = ['byy-select-search-field', 'byy-select-result', 'byy-select-item', 'byy-select-item-ul', 'byy-select-span', 'byy-select-tab', 'close', 'byy-select-dropdown'];
var langtxt = {
  noresult: byy.lang.selectextend.noresult,
  maxmsg: byy.lang.selectextend.maxmsg,
  search: byy.lang.selectextend.search
};
selectextend.fn.init.prototype = selectextend.fn;

//分为两种形式-：1.js控制DOM实现，2.自己组织DOM

/*检查opts是否合格*/
selectextend.fn.checkOpts = function () {
  var thiz = this, opts = thiz.opts;
  if (opts.selector) {
    opts.$ele = $(opts.selector);
  } else {
    byy.error('selectextend must has selector!');
    return false;
  }
  return true;
};

selectextend.fn.val = function () {
  var thiz = this;
  var data = [].slice.call(arguments);
  if (data.length > 0) {
    if (data.length == 1) {
      if ($.isArray(data[0])) {
        data = data[0];
      } else if (typeof data[0] === 'string') {
        data = data[0].split(',');
      }
    }
    if (thiz.opts.multi) {
      var changeArr = [];
      data.forEach(function (v) {
        if (thiz.mapIdAndVal[v] && (!thiz.opts.optionLimits || changeArr.length < thiz.opts.optionLimits)) {
          changeArr.push({ id: thiz.mapIdAndVal[v].id, value: v, text: thiz.mapIdAndVal[v].name });
        }
      });
      if (changeArr.length > 0) {
        $('#' + thiz.containerId).text('');
        for(var key in thiz.optIds){
          thiz.optIds[key] = 0;
        }
        changeArr.forEach(function (v) {
          thiz.optIds[v.id] = 1;
          $('#' + thiz.containerId).append('<span class="byy-btn small ' + cls[5] + '" data-value="' + (v.value || '') + '" aria-target="' + v.id + '" title="' + v.text + '" >' + v.text + '<span class="' + cls[5] + '-' + cls[6] + ' by-icon byy-tab-close">&#x1006;</span></span>');
        })
        thiz.multiCount = changeArr.length;
      }
    } else {
      if (thiz.mapIdAndVal[data[0]]) {
        for(var key in thiz.optIds){
          thiz.optIds[key] = 0;
        }
        thiz.optIds[thiz.mapIdAndVal[data[0]].id] = 1;
        $('#' + thiz.containerId).attr('title',thiz.mapIdAndVal[data[0]].name);
        $('#' + thiz.containerId).text(thiz.mapIdAndVal[data[0]].name);
        $('#' + thiz.containerId).attr('data-value', data[0]);
      }
    }
  }
}

selectextend.fn.generateId = function (pre, sub) {
  return pre + '-' +
    String.fromCharCode(97 + parseInt(Math.random() * 26)) +
    String.fromCharCode(97 + parseInt(Math.random() * 26)) +
    (Math.random() * 10).toFixed(0) +
    String.fromCharCode(97 + parseInt(Math.random() * 26)) +
    '-' + sub
}

selectextend.fn.position = function (ele) {
  if (this.containerId) {
    var bottom = $('#' + this.containerId).offset().top + $('#' + this.containerId).outerHeight();
    var left = $('#' + this.containerId).offset().left;
    ele.offset({ top: bottom, left: left - 1 });
    ele.width($('#' + this.containerId).outerWidth() + 2);
    ele.css('position', 'absolute');
    return ele;
  } else {
    throw new Error('can not find container!')
  }
}

selectextend.fn.renderOpt = function (ele) {
  var thiz = this;
  thiz.optIds = {};
  thiz.mapIdAndVal = {};
  var rA = function (i, v) {
    switch (v.nodeName) {
      case 'OPTGROUP': {
        return '<li class="' + cls[3] + '"><strong>' + v.label + '</strong><ul>' + [].slice.call($(v.children).map(rA)).join('') + '</ul></li>';
      }
      case 'OPTION': {
        var id = thiz.generateId('select', v.value);
        while (id in thiz.optIds) {
          id = thiz.generateId('select', v.value);
        }
        thiz.optIds[id] = 0;
        thiz.mapIdAndVal[v.value] = { id: id, name: v.text };
        return '<li class="' + cls[2] + '" id="' + id + '" title="' + v.text + '" data-value="' + v.value + '" >' + v.text + '</li>';
      }
    }
  };
  return ele.children().map(rA);
}
selectextend.fn.data = function () {
  if (this.opts.multi) {
    var arr = $('#' + this.containerId).find('.' + cls[5]).map(function (i, v) {
      var obj = {};
      obj.id = $(v).attr('data-value');
      obj.name = $(v).attr('title');
      return obj;
    })
    return $.makeArray(arr);
  } else {
    var obj = {};
    obj.id = $('#' + this.containerId).attr('data-value');
    obj.name = $('#' + this.containerId).attr('title');
    return obj;
  }
}

selectextend.fn.readData = function (data, flag) {
  if (flag) {
    this.optIds = {};
    this.mapIdAndVal = {};
  }
  var newArr = [];
  if (typeof data === 'string') {
    data = byy.json(data);
  }
  if (data instanceof Array) {
    for (var i = 0; i < data.length; i++) {
      var obj = data[i];
      if (flag) {
        var id = this.generateId('select', obj.id);
        while (id in this.optIds) {
          id = this.generateId('select', obj.id);
        }
        this.optIds[id] = 0;
        this.mapIdAndVal[obj.id] = { id: id, name: obj.name };
      }
      newArr.push('<li class="' + cls[2] + '" data-value="' + obj.id + '" title="' + obj.name + '" ' + (flag ? 'id="' + id + '"' : '') + ' >' + obj.name + '</li>');
    }
  }
  return newArr;
}

selectextend.fn.render = function (data) {
  if (this.opts.remote) {
    this.arr = ['<li class="' + cls[4] + '">' + (langtxt.search) + '</li>']
    var option = $(this.opts.selector).find('option:first');
    if (!this.opts.placeholder) {
      if (option.length > 0) {
        $('#' + this.containerId).html('<span class="select-placeholder">' + byy.trim(option.text()) + '</span>');
      } else {
        $('#' + this.containerId).html('<span class="select-placeholder">' + (langtxt.search) + '</span>');
      }
    }
  } else {
    if (this.opts.multi) {
      $('#' + this.containerId).find('.' + cls[5]).remove();
      if (this.opts.placeholder) {
        $('#' + this.containerId).find('.select-placeholder').show();
      }
    } else {
      $('#' + this.containerId).html(this.opts.placeholder ? '<span class="select-placeholder">' + this.opts.placeholder + '</span>' : '');
    }
    if (this.opts.data && !data) {
      data = this.opts.data;
    }
    if (!data) {
      this.arr = [].slice.call(this.renderOpt($(this.opts.selector)));
    } else {
      var arr = this.readData(data, true);
      this.arr = arr;
    }
  }
  var dropdown = '<span class="' + cls[7] + ' byy-anim-upbit byy-anim" aria-namespace="' + this.containerId + '">' +
    '  <span class="byy-select-search">' +
    '    <input type="text" class="' + cls[0] + '">' +
    '  </span>' +
    '  <ul class="' + cls[1] + '">';
  dropdown += this.arr.join('');
  dropdown += '  </ul>';
  dropdown += '</span>';
  this.dropdown = dropdown;

  //非多人/有placeholder情况下，默认选中第一个
  if (!this.opts.multi && this.arr.length > 0 && !this.opts.placeholder && !this.opts.remote) {
    var $first = $(this.arr[0]);
    if ($first.hasClass(cls[3])) {
      $first = $first.find('.' + cls[2] + ':first');
    }
    $('#' + this.containerId).attr('title', $first.attr('title'));
    $('#' + this.containerId).text($first.text());
    $('#' + this.containerId).attr('data-value', $first.attr('data-value'));
    $(this.opts.selector).data('value', $first.attr('data-value'));
    this.optIds[$first.attr('id')] = 1;
  }
  if (this.opts.multi) {
    this.multiCount = 0;
  }
}
/*事件绑定*/
selectextend.fn.callback = function () {
  //事件绑定。
  //1.点击addon
  var thiz = this,
    opts = thiz.opts,
    selector = opts.selector,
    $c = $(selector),
    multi = opts.multi || false,
    placeholder = opts.placeholder || '';
  opts.optionLimits = parseInt(opts.optionLimits);
  thiz.disabled = false;
  $c.data('self', thiz);
  if ($c.attr('multi') === 'true') {
    opts.multi = true;
  } else if (opts.multi) {
    $c.attr('multi', 'true');
  }
  $c.addClass('byy-select-extend');
  if ($c.attr('placeholder')) {
    placeholder = opts.placeholder = $c.attr('placeholder');
  }
  thiz.optIds = {};
  thiz.containerId = thiz.generateId('select', 'container');
  //edited by lixun on 2017年5月24日 10:03:48,增加20像素的宽度与其他输入框保持相同
  var w = !!$c.width() ? 'style="width:' + ($c.width() + 20) + 'px"' : '';
  var $container = $(
    '<span class="byy-select-container">' +
    '  <span class="byy-select-selection ' + (opts.multi ? 'multi-selection' : '') + '" tabindex=0 ' + w + ' >' +
    '<span class="byy-select-selection-render" id=' + thiz.containerId + ' ><span class="select-placeholder" >' + placeholder + '</span></span>' +
    (opts.multi ? '' : '<span class="span-triangle"></span>') +
    '</span>' +
    '  <span class="byy-select-dropdown-wrap"></span>' +
    '</span>'
  );
  $c.after($container);
  this.render();

  // 点击展示区域
  $c.next().on('focus', '.byy-select-selection', function (ev) {
    if ($('.' + cls[7] + '').length > 0) {
      var drop_containerId = $('.' + cls[7] + '').attr('aria-namespace');
      handleEventMap(drop_containerId, false);
      $('.' + cls[7] + '').remove();
    }
    if (thiz.disabled) {
      return;
    }
    var ele = thiz.position($(thiz.dropdown));
    if (thiz.opts.optionLimits && thiz.multiCount >= thiz.opts.optionLimits) {
      ele.find('.' + cls[1] + '').html('<li class="' + cls[4] + '">' + (byy.formatStr(langtxt.maxmsg, thiz.opts.optionLimits)) + '</li>')
    } else {
      ele.find('.' + cls[2]).each(function (i, v) {
        var id = $(v).attr('id');
        if (thiz.optIds[id] === 1) {
          $(v).attr('aria-selected', true);
        } else {
          $(v).attr('aria-selected', false);
        }
      })
    }
    $('body').append(ele);
    ele.find('.byy-select-search .' + cls[0] + '').focus();
    $('#' + thiz.containerId).parent().addClass('byy-triangle-down');
    handleEventMap(thiz.containerId, true);
    byy.stope(ev);
  });

  function handleEventMap(namespace, handle) {
    if (handle) {
      // 下拉框选项选中
      $('body').on('mousedown.' + namespace, '.' + cls[7] + ' .' + cls[2], function (ev) {
        if (ev.which === 1) {
          var text = byy.trim($(this).text());
          var value = $(this).attr('data-value');
          var id = $(this).attr('id');
          if (!opts.multi) {
            $('#' + thiz.containerId).attr('title',text);
            $('#' + thiz.containerId).text(text);
            $('#' + thiz.containerId).attr('data-value', value);
            if (thiz.optIds[id] !== 1) {
              thiz.optIds[$('.' + cls[7] + ' .' + cls[2] + '[aria-selected="true"]').attr('id')] = 0;
              thiz.optIds[id] = 1;
            }
            $('body').trigger('mousedown.selectextend');
          } else {
            var selected = $(this).attr('aria-selected');
            if (selected === 'true') {
              $(this).attr('aria-selected', '');
              thiz.optIds[id] && (thiz.optIds[id] = 0);
              $('#' + thiz.containerId).find('span[aria-target="' + id + '"]').remove();
              if ($('#' + thiz.containerId).find('.' + cls[5]).length === 0) {
                $('#' + thiz.containerId).find('.select-placeholder').show();
              }
            } else {
              if (thiz.multiCount === thiz.opts.optionLimits) {
                if (byy.win) {
                  byy.win.msg(byy.formatStr(langtxt.maxmsg, thiz.opts.optionLimits), { icon: 2 });
                } else {
                  alert(byy.formatStr(langtxt.maxmsg, thiz.opts.optionLimits));
                }
              } else {
                thiz.optIds[id] = 1;
                $(this).attr('aria-selected', 'true');
                $('#' + thiz.containerId).append('<span class="byy-btn small ' + cls[5] + '" data-value="' + (value || '') + '" aria-target="' + id + '" title="' + text + '" >' + text + '<span class="' + cls[5] + '-' + cls[6] + ' by-icon byy-tab-close">&#x1006;</span></span>');
                if ($('#' + thiz.containerId).find('.' + cls[5]).length > 0) {
                  $('#' + thiz.containerId).find('.select-placeholder').hide();
                }
              }
            }
          }
          $('#' + thiz.containerId).trigger('change.byy-select');
        }
        byy.stope(ev);
      })
      // 下拉框搜索栏输入
      $('body').on('keyup.' + namespace, '.' + cls[7] + ' .' + cls[0] + '', function (ev) {
        if (!thiz.opts.optionLimits || thiz.multiCount < thiz.opts.optionLimits) {
          var t = ev.target, $t = $(t);
          var newArr = [];
          if (!opts.remote) {
            var arr = thiz.arr;
            for (var i = 0; i < arr.length; i++) {
              var $node = $(arr[i]);
              if ($node.hasClass(cls[3])) {
                $node.find('.byy-select-item').each(function (i, v) {
                  if ($(v).attr('title').indexOf($t.val()) === -1) {
                    $(v).remove();
                  } else {
                    if (thiz.opts.multi) {
                      var id = $(v).attr('id');
                      if (thiz.optIds[id] === 1) {
                        $(v).attr('aria-selected', 'true');
                      }
                    }
                  }
                });
                if ($node.find('.' + cls[2]).length > 0) {
                  newArr.push($node);
                }
              } else if ($node.hasClass('' + cls[2])) {
                if ($node.attr('title').indexOf($t.val()) > -1) {
                  if (thiz.opts.multi) {
                    var id = $node.attr('id');
                    if (thiz.optIds[id] === 1) {
                      $node.attr('aria-selected', 'true');
                    }
                  }
                  newArr.push($node);
                }
              }
            }
            $('body .' + cls[7] + ' .' + cls[1] + '').html(newArr.length > 0 ? newArr : '<li class="' + cls[4] + '">' + (langtxt.noresult) + '</li>');
          } else {
            opts.remote($t.val(), function (res) {
              newArr = thiz.readData(res);
              $('body .' + cls[7] + ' .' + cls[1] + '').html(newArr.length > 0 ? newArr : '<li class="' + cls[4] + '">' + (langtxt.noresult) + '</li>');
            })
          }
        }
      })
      $('body').on('mousedown.selectextend', function (ev) {
        var t = ev.currentTarget || ev.srcElement, $t = $(t);
        if (thiz.opts.multi && $(t).hasClass('byy-select-item')) {

        } else if ($(t).closest('.byy-select-search').length > 0 || $(t).closest('.byy-select-container').length > 0 || $(t).hasClass(cls[4])) {

        } else {
          handleEventMap(thiz.containerId, false);
          $('.' + cls[7] + '').remove();
          $('#' + thiz.containerId).parent().removeClass('byy-triangle-down');
        }
        byy.stope(ev);
      })
    } else {
      $('body').off('mousedown.' + namespace, '.' + cls[7] + ' .' + cls[2]);
      $('body').off('keyup.' + namespace, '.' + cls[7] + ' .' + cls[0]);
      $('body').off('mousedown.selectextend');
    }
  }

  $('#' + thiz.containerId).on('mousedown', '.' + cls[5] + ' .' + cls[5] + '-' + cls[6], function () {
    var $t = $(this), $p = $t.parent();
    var id = $p.attr('aria-target');
    thiz.optIds[id] && (thiz.optIds[id] = 0);
    $p.remove();
    if ($('#' + thiz.containerId).find('.' + cls[5]).length === 0) {
      $('#' + thiz.containerId).find('.select-placeholder').show();
    }
    $('#' + thiz.containerId).trigger('change.byy-select');
  })

  $('#' + thiz.containerId).on('change.byy-select', function (ev) {
    if (!thiz.opts.multi) {
      var value = $('#' + thiz.containerId).attr('data-value');
      $(thiz.opts.selector).data('value', value);
      thiz.opts.onChange && (thiz.opts.onChange(value))
    } else {
      var resArr = $('#' + thiz.containerId).find('.' + cls[5]).map(function (i, v) {
        return $(v).attr('data-value');
      }).get();
      $(thiz.opts.selector).data('value', resArr);
      thiz.opts.onChange && (thiz.opts.onChange(resArr));
      thiz.multiCount = resArr.length;
    }
  });

  (function bindAttrEvent() {
    var MutationObserver = window.MutationObserver
      || window.WebKitMutationObserver
      || window.MozMutationObserver;
    if (MutationObserver) {
      var dom = $c[0];
      var option = {
        'attributes': true,
        'attributeOldValue': true,
        'attributeFilter': ['select-disabled']
      };
      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (v) {
          var flag = $(v.target).attr('select-disabled');
          if (flag === 'true') {
            thiz.disabled = true;
          } else if (flag === 'false') {
            thiz.disabled = false;
          }
        });
        $('#' + thiz.containerId).trigger('disabled.byy-select');
      });
      observer.observe(dom, option);
    } else if (document.addEventListener) {
      $(thiz.opts.selector)[0].addEventListener('DOMAttrModified', function (ev) {
        if (ev.attrName === 'select-disabled') {
          if (ev.newValue === 'true') {
            thiz.disabled = true;
          } else {
            thiz.disabled = false;
          }
          $('#' + thiz.containerId).trigger('disabled.byy-select');
        }
        byy.stope(ev);
      });
    } else if (document.attachEvent) {
      $(thiz.opts.selector)[0].attachEvent('onpropertychange', function (ev) {
        if (ev.propertyName === 'select-disabled') {
          thiz.disabled = (ev.srcElement['select-disabled'] === 'true') ? true : false;
          $('#' + thiz.containerId).trigger('disabled.byy-select');
        }
        byy.stope(ev);
      })
    }
  })();

  $('#' + thiz.containerId).on('disabled.byy-select', function () {
    if (thiz.disabled) {
      $(this).addClass('byy-select-disabled');
    } else {
      $(this).removeClass('byy-select-disabled');
    }
  })
};

byy.define(function (exports) {
  exports('selectextend', selectextend);
});