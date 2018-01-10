$(function(){
    var expandMenu = function(liObj){
        var $li = liObj;
        if(null != $li.attr('class') && $li.attr('class').indexOf('active') < 0){
            $('.unit').children('li.active').each(function(index,ele){
                var tempH = $(ele).height();
                $(ele).css('height',tempH).animate({
                    height : 45
                },300,function(){
                    $(ele).removeClass('active');
                });
            });
            $li.addClass('active');
            var h = $li.css('height','auto').height();
            if(h > 0){
                $li.css('height','45px');
                $li.animate({
                    height : h
                },300);
            }
        }
    };
    $('.unit').delegate('.chapter','click',function(event){
        event = event || window.event;
        var t = event.srcElement || event.target,$t = $(t);
        expandMenu($t);
    });
    //expand first li Obj
    var $first = $('.unit').find('.chapter:first-child');
    expandMenu($first);
});
