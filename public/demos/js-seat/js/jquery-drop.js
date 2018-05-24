/*!
 * jquery-drop.js
 * @author ydr.me
 * @version 1.0
 * @require http://festatic.aliapp.com/js/jquery-drag/latest/jquery-drag.min.js
 * 2014年7月9日16:45:54
 */



/**
 * 拖拽释放，常用于拖拽插入、排序等等
 *
 * v1.0
 * 2014年7月9日16:45:57
 * 构造
 *
 */


(function(win, udf) {
    'use strict';

    // 保存实例化对象的data键
    var datakey = 'jquery-drop',
        // jquery对象 或 Yquery对象
        $ = win.$,
        // 默认参数
        defaults = {
            // 释放类型
            // insert: 插入，默认
            // append: 追加
            // prepend: 前加
            // exchange: 交换
            // replace: 替换
            type: 'insert',

            // 目标容器对象，可以是选择器、DOM元素或yquery对象
            containment: null,

            // 目标容器内的项目对象，用于判断指定释放位置
            // 必须是选择器字符串，通常为 class
            itemSelector: '.item',

            // 动画时间，单位ms
            duration: 345,

            // 可被拖拽到目标容器内，源模板被占比例
            // 例，已有超过10%的面积被拖拽到目标容器内时，此时释放可以被置放在目标容器内
            dropRatio: 0.1,

            // 占位类
            // 用于开始拖拽时占位
            cloneClass: 'clone',

            // 占位类
            // 用于释放目标占位
            dropClass: 'drop',

            // 拖拽到目标内回调
            // this: containment element
            // arg0: event
            ondragover: $.noop,

            // 进入可被释放区域
            // 即：与目标的交叉面积超过dropRatio比例时
            // type为exchange、replace时，目标为item，其他时候为containment
            // this: containment element
            // arg0: event
            ondragenter: $.noop,

            // 离开可被释放区域
            // 即：与目标的交叉面积不到dropRatio比例时
            // type为exchange、replace时，目标为item，其他时候为containment
            // this: target element
            // arg0: event
            ondragleave: $.noop,

            // 拖拽离开目标内回调
            // this: target element
            // arg0: event
            ondragout: $.noop,

            // 松开并放置目标后回调
            // this: containment element
            // arg0: event
            ondrop: $.noop
        },
        placeholderTypes = ['insert', 'append', 'prepend'];


    if (!$.fn.drag) throw ('require http://festatic.aliapp.com/js/jquery-drag/latest/jquery-drag.min.js');
    $.extend(defaults, $.fn.drag.defaults);

    // 原型方法，驼峰形式
    $.fn.drop = function(settings) {

        // 当前第1个参数为字符串
        var run = $.type(settings) === 'string',
            // 获取运行方法时的其他参数
            args = [].slice.call(arguments, 1),
            // 复制默认配置
            options = $.extend({}, defaults),
            // 运行实例化方法的元素
            $element,
            // 实例化对象
            instance;

        // 运行实例化方法，第1个字符不能是“_”
        // 下划线开始的方法皆为私有方法
        if (run && run[0] !== '_') {
            if (!this.length) return;

            // 只取集合中的第1个元素
            $element = $(this[0]);

            // 获取保存的实例化对象
            instance = $element.data(datakey);

            // 若未保存实例化对象，则先保存实例化对象
            if (!instance) $element.data(datakey, instance = new Constructor($element[0], options)._init());

            // 防止与静态方法重合，只运行原型上的方法
            // 返回原型方法结果，否则返回undefined
            return Constructor.prototype[settings] ? Constructor.prototype[settings].apply(instance, args) : udf;
        }
        // instantiation options
        else if (!run) {
            // 合并参数
            options = $.extend(options, settings);
        }

        return this.each(function() {
            var element = this,
                instance = $(element).data(datakey);

            // 如果没有保存实例
            if (!instance) {
                // 保存实例
                $(element).data(datakey, instance = new Constructor(element, options)._init());
            }
        });
    };

    // 暴露插件的默认配置
    $.fn.drop.defaults = defaults;



    // 构造函数

    function Constructor(element, options) {
        var the = this;
        the.$element = $(element);
        the.options = options;
    }


    // 原型方法，驼峰写法
    Constructor.prototype = {
        /**
         * 初始化
         * @return this
         * @version 1.0
         * 2014年7月3日19:49:20
         */
        _init: function() {
            var the = this,
                options = the.options,
                $element = the.$element,
                $containment = $(options.containment),
                ondragbefore = options.ondragbefore,
                ondragstart = options.ondragstart,
                ondrag = options.ondrag,
                ondragend = options.ondragend;

            if (!$containment.length) return;
            the.$containment = $containment;



            options.ondragbefore = function() {
                var args = [].slice.call(arguments);
                the._before.apply(the, args);
                ondragbefore.apply(this, args);
            };

            options.ondragstart = function() {
                var args = [].slice.call(arguments);
                the._start.apply(the, args);
                ondragstart.apply(this, args);
            };

            options.ondrag = function() {
                var args = [].slice.call(arguments);
                the._move.apply(the, args);
                ondrag.apply(this, args);
            };

            options.ondragend = function() {
                var args = [].slice.call(arguments);
                the._end.apply(the, args);
                if(options.type !='self'){
                    ondragend.apply(this, args);
                }
                
            };

            $element.drag(options);
            return this;
        },


        /**
         * 拖拽开始前回调
         * @param {Object} e    event
         * @param {Object} that 拖拽实例
         * @return undefined
         * @version 1.0
         * 2014年7月9日22:42:58
         */
        _before: function(e, that) {
            var the = this,
                options = the.options,
                $drag = that.$drag,
                offset = $drag.offset();

            $drag.css('position', 'absolute').offset(offset);
            the.$clone = $('<' + $drag[0].tagName + ' class="' + options.cloneClass + '"/>').insertBefore($drag);
            the.enter = 0;
            the.$dropTarget = null;
            the.$lastDropTarget = null;
            the.dragOffset = null;
        },


        /**
         * 拖拽开始回调
         * @param {Object} e    event
         * @param {Object} that 拖拽实例
         * @return undefined
         * @version 1.0
         * 2014年7月9日22:42:58
         */
        _start: function(e, that) {
            var the = this,
                options = the.options,
                $element = the.$element,
                $drag = that.$drag,
                tagName = $(options.itemSelector, $element)[0].tagName;

            if (~$.inArray(options.type, placeholderTypes)) the.$drop = $('<' + tagName + ' class="' + options.dropClass + '"/>');

            // 源尺寸、位置
            the.dragSize = {
                width: $drag.outerWidth(),
                height: $drag.outerHeight()
            };
        },



        /**
         * 拖拽过程回调
         * @param {Object} e    event
         * @param {Object} that 拖拽实例
         * @return undefined
         * @version 1.0
         * 2014年7月9日22:42:58
         */
        _move: function(e, that) {
            var the = this,
                options = the.options,
                $containment = the.$containment,
                $drop = the.$drop,
                $drag = that.$drag,
                $items = $containment.find(options.itemSelector).not($drag),
                dragOffset = $drag.offset(),
                dragSize = the.dragSize,
                dragCoord = {
                    x0: dragOffset.left,
                    y0: dragOffset.top,
                    x1: dragSize.width + dragOffset.left,
                    y1: dragSize.height + dragOffset.top
                },
                containmentOffset = $containment.offset(),
                containmentCoord = {
                    x0: containmentOffset.left,
                    y0: containmentOffset.top,
                    x1: containmentOffset.left + $containment.outerWidth(),
                    y1: containmentOffset.top + $containment.outerHeight()
                },
                crossArea = the._area(dragCoord, containmentCoord),
                dragArea = dragSize.width * dragSize.height,
                $dropTarget,
                $lastDropTarget = the.$lastDropTarget,
                itemArea,
                nearest;

            the.dragOffset = dragOffset;

            // 有交叉面积，进入目标所在容器
            if (crossArea) {
                options.ondragover.call($containment[0], e);
                the.nearest = nearest = the._nearest($items);

                // 1. 判断是否enter
                switch (options.type) {
                    // 插入
                    case 'insert':
                    case 'append':
                    case 'prepend':
                        $dropTarget = $containment;
                        the.enter = crossArea / dragArea >= options.dropRatio ? 1 : 0;
                        break;

                        // 交换
                    case 'exchange':
                    case 'replace':
                        $dropTarget = $items.eq(nearest.index);
                        itemArea = $dropTarget.outerWidth() * $dropTarget.outerHeight();
                        the.enter = nearest.area / itemArea >= options.dropRatio ? 1 : 0;
                        break;
                    case 'self':
                        $dropTarget = $items.eq(nearest.index);
                        itemArea = $dropTarget.outerWidth() * $dropTarget.outerHeight();
                        the.enter = nearest.area / itemArea >= options.dropRatio ? 1 : 0;
                        break;
                }
                the.$dropTarget = $dropTarget;

                // 2. 占位操作
                if (the.enter) {
                    switch (options.type) {
                        // 插入
                        case 'insert':
                            if (nearest.dir < 0) {
                                $drop.insertBefore($items.eq(nearest.index));
                            } else {
                                $drop.insertAfter($items.eq(nearest.index));
                            }
                            break;

                            // 追加
                        case 'append':
                            $drop.appendTo($containment);
                            break;

                            // 前加
                        case 'prepend':
                            $drop.prependTo($containment);
                            break;
                    }
                    options.ondragenter.call($dropTarget[0], e);

                    // 释放目标发生变化
                    if (!$lastDropTarget || $lastDropTarget[0] !== $dropTarget[0]) {
                        if ($lastDropTarget) options.ondragleave.call($lastDropTarget[0], e);
                        the.$lastDropTarget = $dropTarget;
                    }
                } else options.ondragleave.call($dropTarget[0], e);
            } else {
                if (the.$drop) the.$drop.remove();
                options.ondragout.call($containment[0], e);
            }
        },





        /**
         * 计算交叉面积
         * @private
         * @param  {Object}  coord1 坐标1，包含x0,y0,x1,y1的2个点
         * @param  {Object}  coord2 坐标2，包含x0,y0,x1,y1的2个点
         * @return {Number} 面积值
         * @version 1.0
         * 2014年7月10日10:23:55
         */
        _area: function(coord1, coord2) {
            var deltaX = coord1.x1 - coord1.x0,
                deltaY = coord1.y1 - coord1.y0,
                area = 0;

            if (
                coord1.y1 > coord2.y0 &&
                // 右边以左
                coord1.x0 < coord2.x1 &&
                // 下边以上
                coord1.y0 < coord2.y1 &&
                // 左边以右
                coord1.x1 > coord2.x0
            ) {
                // 上边以上
                if (coord1.y0 < coord2.y0) {
                    deltaY = coord1.y1 - coord2.y0;
                }
                // 下边以下
                else if (coord1.y1 > coord2.y1) {
                    deltaY = coord2.y1 - coord1.y0;
                }

                // 左边以左
                if (coord1.x0 < coord2.x0) {
                    deltaX = coord1.x1 - coord2.x0;
                }
                // 右边以右
                else if (coord1.x1 > coord2.x1) {
                    deltaX = coord2.x1 - coord1.x0;
                }

                area = deltaX * deltaY;
            }

            return area;
        },




        /**
         * 计算最近的位置
         * 两个对象的中心点距离
         * @param  {Object} $items  参考对象
         * @return {Object} 包含最近的距离、最近的索引、所在方向、交叉面积的对象
         * @version 1.1
         * 2014年7月10日12:20:45
         * 2014年7月11日12:06:18
         */
        _nearest: function($items) {
            var the = this,
                dragOffset = the.dragOffset,
                dragSize = the.dragSize,
                dragCoord = {
                    x0: dragOffset.left,
                    y0: dragOffset.top,
                    x1: dragOffset.left + dragSize.width,
                    y1: dragOffset.top + dragSize.height,
                    // 中心点
                    x: dragOffset.left + dragSize.width / 2,
                    y: dragOffset.top + dragSize.height / 2
                },
                // 最小距离
                minDistance,
                // 最小距离索引
                minIndex,
                // 最小距离方向
                minDir,
                area;

            $items.each(function(index) {
                var $item = $(this),
                    offset = $item.offset(),
                    width = $item.outerWidth(),
                    height = $item.outerHeight(),
                    itemCoord = {
                        x0: offset.left,
                        y0: offset.top,
                        x1: offset.left + width,
                        y1: offset.top + height,
                        // 中心点
                        x: offset.left + width / 2,
                        y: offset.top + height / 2
                    },
                    dir = dragCoord.x >= itemCoord.x ? 1 : -1,
                    distance = Math.sqrt(Math.pow(dragCoord.x - itemCoord.x, 2) + Math.pow(dragCoord.y - itemCoord.y, 2));

                if (minDistance === udf || distance <= minDistance) {
                    minDistance = distance;
                    minDir = dir;
                    minIndex = index;
                    area = the._area(dragCoord, itemCoord);
                }
            });

            return {
                // 最近绝对距离
                distance: minDistance,
                // 离最近的索引
                index: minIndex,
                // 所在的方向，
                // 1：右边
                // -1：左边
                dir: minDir,
                // 交叉面积
                area: area
            };
        },





        /**
         * 拖拽结束后回调
         * @param {Object} e    event
         * @param {Object} that 拖拽实例
         * @return undefined
         * @version 1.0
         * 2014年7月9日22:42:58
         */
        _end: function(e, that) {
            var the = this,
                options = the.options,
                nearest = the.nearest,
                $drag = that.$drag,
                $containment = the.$containment,
                $drop = the.$drop,
                $clone = the.$clone,
                $dropTarget = the.$dropTarget,
                $items = $containment.find(options.itemSelector).not($drag),
                dropTargetOffset,
                containment = $containment[0],
                isAppendToEmpty, $temp;
                var dt = $dropTarget;
                var ds = $drag;
            if (the.enter) {
                dropTargetOffset = $dropTarget.offset();
                switch (options.type) {
                    // 插入
                    case 'insert':
                        if ($items.length) {
                            if (nearest.dir < 0) {
                                $drag.insertBefore($items.eq(nearest.index));
                            } else {
                                $drag.insertAfter($items.eq(nearest.index));
                            }
                        } else {
                            isAppendToEmpty = 1;
                            $containment.append($drag);
                        }
                        break;

                        // 后加
                    case 'append':
                        // 前加
                    case 'prepend':
                        $containment[options.type]($drag);
                        break;

                        // 交换
                    case 'exchange':
                        $temp = $('<b style="display:none;"/>').insertAfter($drag);
                        $drag.insertAfter($dropTarget);
                        $dropTarget.insertAfter($temp);
                        $temp.remove();
                        break;

                        // 替换
                    case 'replace':
                        $drag.insertAfter($dropTarget);
                        $dropTarget.remove();
                        $dropTarget = null;
                        break;
                    case 'self':
                        //console.log($drag);
                        // console.log($dropTarget);
                        // console.log($dropTarget);
                        // $drag.insertAfter($dropTarget);
                        // $dropTarget.remove();
                        $dropTarget = null;
                        break;
                }
                if ($drop) {
                    if (isAppendToEmpty) {
                        $drag.css('position', '').offset(the.dragOffset).animate({
                            top: '',
                            left: ''
                        }, options.duration, function() {
                            $drop.remove();
                            $clone.remove();
                        });
                    } else {
                        $drag.offset(the.dragOffset).animate($drop.position(), options.duration, function() {
                            $drag.css({
                                left: '',
                                top: '',
                                position: ''
                            });
                            $drop.remove();
                            $clone.remove();
                        });
                    }
                } else {
                    // 1. 拖拽对象
                    if(options.type != 'self'){
                        $drag.css('position', '').offset(the.dragOffset).animate({
                            top: '',
                            left: ''
                        }, options.duration, function() {
                            if (!$dropTarget) $clone.remove();
                        });

                        //2. 替换对象
                        if ($dropTarget) $dropTarget.css('position', 'absolute').offset(dropTargetOffset).animate($clone.position(), options.duration, function() {
                            $dropTarget.css({
                                left: '',
                                top: '',
                                position: ''
                            });
                            $clone.remove();
                        });
                    }else{
                        $drag.css('position', '').offset(the.dragOffset).animate({
                            top: '',
                            left: ''
                        }, 0, function() {
                            if (!$dropTarget) $clone.remove();
                        });

                        //2. 替换对象
                        if ($dropTarget) $dropTarget.css('position', 'absolute').offset(dropTargetOffset).animate($clone.position(), 0, function() {
                            $dropTarget.css({
                                left: '',
                                top: '',
                                position: ''
                            });
                            $clone.remove();
                        });
                    }
                }
                if(options.type == 'self'){
                    options.ondrop(e,dt,ds,$clone);
                    return false;
                }else{
                    options.ondrop.call(containment, e);
                }
            } else {
                if (the.dragOffset) {
                    if ($drop) $drop.remove();
                    $drag.offset(the.dragOffset).animate($clone.position(), options.duration, function() {
                        $drag.css({
                            left: '',
                            top: '',
                            position: ''
                        });
                        $clone.remove();
                    });
                } else {
                    $drag.css({
                        position: '',
                        top: '',
                        left: ''
                    });
                    $clone.remove();
                }
            }

            options.ondragout.call(containment, e);
            if(options.type == 'self'){

            }else{
                if ($dropTarget) options.ondragleave.call($dropTarget[0], e);    
            }
            
        },


        /**
         * 设置或获取选项
         * @param  {String/Object} key 键或键值对
         * @param  {*}             val 值
         * @return 获取时返回键值，否则返回this
         * @version 1.0
         * 2014年7月3日20:08:16
         */
        options: function(key, val) {
            // get
            if ($.type(key) === 'string' && val === udf) return this.options[key];

            var map = {};
            if ($.type(key) === 'object') map = key;
            else map[key] = val;

            this.options = $.extend(this.options, map);
        }
    };
})(this);
