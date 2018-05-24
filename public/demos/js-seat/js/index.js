'use strict';

var classSeatTable = function(param){

    //校验横竖
    if(!param.xaxis || !param.yaxis){
        alert('请传递横排数量和竖排数量');
        return;
    }else if(parseInt(param.xaxis,10)<=0 || parseInt(param.yaxis,10) <=0 ){
        alert('横排竖排数量应大于0');
        return;
    }
    this.x = param.xaxis,this.y = param.yaxis;

};
classSeatTable.prototype.initTable = function(selector){
    var thiz = this;
    var $parent = $(selector);
    for(var i=0;i<thiz.y;i++){
        var $temp = thiz.createRow(i);
        $parent.append($temp);
    }
    thiz.beautyTable();
};
classSeatTable.prototype.createRow = function(num){
    var thiz = this;
    var $row = $('<div class="class-seat-content"></div>'),
    $num = $('<div class="seat-num"></div>');
    
    $row.append($num.text(num+1));
    for(var i=0;i<thiz.x;i++){
        var $seat = $('<div class="seat"></div>');
        $row.append($seat);
    }
    return $row;
};

classSeatTable.prototype.beautyTable = function(){
    //最小宽度为980px,每个桌子为100px,序号为30px
    var x = this.x;
    var w = x * 100 +30;
    console.log(w);
    if(w > 980){
        $('.class-seat-content').css('width',(w+x)+'px');
    }else{
        //减法
        var m = (980-w-30)/x;
        console.log(m);
        $('.seat').css('margin-right',(m-1)+'px');
    }
};

$(document).ready(function(){

    var cst = new classSeatTable({
        xaxis : 8,
        yaxis : 8
    });
    cst.initTable('.class-seat-wrap');

    // //绑定拖拽事件
    // var $container = $('.class-seat-wrap'),
    // $item = $('.seat');
    // var hasDrag = false;
    // $('body').delegate('.student-name','mousedown',function(ev){
    //     ev.preventDefault();
    //     var $obj = $(this);
    //     $obj.addClass('ondrag');
    //     //开启拖拽
    //     hasDrag = true;

    //     $('body').delegate('','mousemove',function(ev1){
    //         if(hasDrag){
    //             console.log(ev1.clientY);

    //             $('body').append($obj.addClass('move'));
    //             $obj.css({
    //                 left : (ev1.pageX-30)+'px',
    //                 top : (ev1.pageY-10)+'px'
    //             });
    //         }
    //     });
    // });

    // $('.studentlist').delegate('.student-name','mouseup',function(ev){
    //     ev.preventDefault();
    //     var $obj = $(this);
    //     $obj.removeClass('ondrag');
    //     //关闭拖拽i
    //     hasDrag = false;
    // });
    $.fn.drop.defaults.type = 'self';
    $('.student-name').drop({
            handle: this,
            drag: this,
            //item : $('.seat'),
            itemSelector : $('.seat'),
            containment: $('.class-seat-wrap'),
            ondragenter: function() {
                console.log(3);
                $(this).addClass('over');
            },
            ondragleave: function() {
                $(this).removeClass('over');
            },
            ondrop : function(ev,target,source,cloneObj){
                // var target = dropObj.$dropTarget;//鼠标移入目标
                // var source = dropObj.$element;  //鼠标抓取目标
                //进行交换或者插入
                //console.log(target);
                if(target.find('.seat-name').length > 0){
                    //alert(3);
                    //交换，或者直接拒绝。
                    var targetSid = target.find('.seat-name').attr('studentId'),targetSname= target.find('.seat-name').attr('studentName'),
                    sourseSid = source.attr('studentId'),sourseSname = source.attr('studentName');
                    target.find('.seat-name').attr('studentId',sourseSid);
                    target.find('.seat-name').attr('studentName',sourseSname);
                    target.find('.seat-name').html(sourseSname);
                    // source.remove();
                    // var source2 = $('<span class="student-name" studentId="'+targetSid+'" studentName="'+targetSname+'">'+targetSname+'</span>');
                    source.attr('studentId',targetSid);
                    source.attr('studentName',targetSname);
                    source.html(targetSname);
                    // $('.studentlist').append(source2);
                    $('body').find('.clone').remove();
                }else{
                    var studentId = source.attr('studentId'),studentName = source.attr('studentName');
                    source.addClass('seat-name').removeClass('student-name');
                    // target.append('<span class="seat-name" studentId="'+studentId+'" studentName="'+studentName+'">'+studentName+'</span>');
                    target.append(source);
                    // source.remove();
                    $('body').find('.clone').remove();
                }
                target.removeClass('over');
                return false;
            }
        });
        $('.seat-name').drop({
            handle: this,
            drag: this,
            //item : $('.seat'),
            itemSelector : $('.seat'),
            containment: $('.class-seat-wrap'),
            ondragenter: function() {
                $(this).addClass('over');
            },
            ondragleave: function() {
                $(this).removeClass('over');
            },
            ondrop : function(ev,target,source){
                if(target.find('.seat-name').length > 0){

                    var targetSid = target.find('.seat-name').attr('studentId'),targetSname= target.find('.seat-name').attr('studentName'),

                    sourseSid = source.attr('studentId'),sourseSname = source.attr('studentName');

                    target.find('.seat-name').attr('studentId',sourseSid);
                    target.find('.seat-name').attr('studentName',sourseSname);
                    target.find('.seat-name').html(sourseSname);
                    // source.remove();
                    // var source2 = $('<span class="student-name" studentId="'+targetSid+'" studentName="'+targetSname+'">'+targetSname+'</span>');
                    source.attr('studentId',targetSid);
                    source.attr('studentName',targetSname);
                    source.html(targetSname);
                    // $('.studentlist').append(source2);
                    $('body').find('.clone').remove();
                }else{
                    var studentId = source.attr('studentId'),studentName = source.attr('studentName');
                    target.append('<span class="seat-name" studentId="'+studentId+'" studentName="'+studentName+'">'+studentName+'</span>');
                    source.remove();
                    $('body').find('.clone').remove();
                }
                target.removeClass('over');
                return false;
            }
        });

});