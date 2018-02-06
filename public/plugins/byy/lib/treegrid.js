/*
 * jQuery treegrid Plugin 0.3.0
 * https://github.com/maxazan/jquery-treegrid
 *
 * Copyright 2013, Pomazan Max
 * Licensed under the MIT licenses.
 */

 //暴露接口

byy.define(['jquery','cookie','page'],function( exports ){

    (function($) {
        var nodeCount = 0;
        //从数据中获取跟结点
        var getRootNodesFromData = function (data,isTreedData,parentCol,sortCol,rootValue) {
            var result = [];
            $.each(data, function (index, item) {
                if (isTreedData || !item[parentCol] || item[parentCol] == rootValue) {
                    result.push(item);
                }
            });
            if (sortCol) {
                result.sort(function (a, b) {
                    return a[sortCol] - b[sortCol];
                });
            }
            return result;

        }
        //从数据中获取子节点
        var getListChildNodesFromData = function (data, parentNode,idCol,parentCol,sortCol) {
            var unsort = [];
            $.each(data, function (i, item) {
                if (item[parentCol] == parentNode[idCol]) {
                    unsort.push(item);
                }
            });
            if (unsort == null || unsort.length < 1)
                return;

            if (sortCol) {
                unsort.sort(function (a, b) {
                    return a[sortCol] - b[sortCol];
                });
            }
            return unsort;
        }
        //标准数据获得子节点
        var getTreeChildNodesFromdata = function (parentNode,childCol,sortCol) {
            if (childCol) {
                var childNodes = parentNode[childCol];
                if (sortCol)
                    childNodes.sort(function (a, b) {
                        return a[sortCol] - b[sortCol];
                    });
                return childNodes;
            }
            return null;
        }

        var treegridIndex = 0;
        var methods = {
            /**
             * Initialize tree
             *
             * @param {Object} options
             * @returns {Object[]}
             */
            initTree: function(options) {
                var settings = $.extend({}, this.treegrid.defaults, options);
                return this.each(function() {
                    var $this = $(this);
                    var checkName = byy.guid()+(treegridIndex++);//用于禁止重名和复选、单选name
                    settings.checkName = checkName;
                    $this.treegrid('setTreeContainer', $(this));
                    $this.treegrid('setSettings', settings);
                    //1.加载数据
                    $this.treegrid('loadData',settings);


                    // settings.getRootNodes.apply(this, [$(this)]).treegrid('initNode', settings);
                    // $this.treegrid('getRootNodes').treegrid('render');
                    //默认展开状态
                    if (!settings.expandAll) {
                        $this.treegrid('collapseAll');
                    }
                });
            },
            //tr 加载子节点,isreload == true ,则覆盖渲染
            loadChildNodes : function( isreload ){
                var $this = $(this);
                var trItem = $this.data('obj');
                
                var beforeFn = $this.treegrid('getSetting','onBefore');
                if(typeof beforeFn === 'function' && !beforeFn.apply($this)){
                    //如果返回false，则停止继续加载
                    return;
                }

                var url = $this.treegrid('getSetting','url'),
                    type = $this.treegrid('getSetting','type'),
                    data = $this.treegrid('getSetting','ajaxParams'),
                    parentColumn = $this.treegrid('getSetting','parentColumn'),
                    idColumn = $this.treegrid('getSetting','idColumn');
                data[parentColumn] = trItem[idColumn];
                $.ajax({
                    url : url,
                    type : type,
                    data : data,
                    success : function(res){
                        var data = res.rows || res.list || res;
                        window.treegridIsLoading = false;
                        if(isreload === true){
                            window.treegridIsLoading = true;
                            var childs = $this.treegrid('getAllChildNodes');
                            childs.forEach(function( item ){
                                item.remove();
                            });
                        }

                        $this.treegrid('renderChild',data);
                        //渲染完毕后，重新加载事件等
                        var $tree = $this.closest('table');
                        var settings = $tree.data('settings');
                        settings.getRootNodes.apply(this, [$tree]).treegrid('initNode', settings);
                        $tree.treegrid('getRootNodes').treegrid('render');
                        //当前节点展开
                        var expander = $this.treegrid('getSetting', 'getExpander').apply($this);
                        var iconName = $this.treegrid('getSetting','iconName');
                        if(expander && !iconName){
                            expander.removeClass($this.treegrid('getSetting', 'expanderCollapsedClass'));
                            expander.addClass($this.treegrid('getSetting', 'expanderExpandedClass'));
                        }
                        trItem['sync'] = true;
                        $(this).data('obj',trItem);
                        $this.treegrid('cascade');//级联选中或取消
                        byy.initUI();
                        //渲染分页数据 
                        //UNDO
                        //调用加载成功函数
                        if (typeof($this.treegrid('getSetting', 'onSuccess')) === "function") {
                            $this.treegrid('getSetting', 'onSuccess').apply($this,[res]);
                        }
                        window.treegridIsLoading = false;
                        delete window.treegridIsLoading;
                    },
                    error : function(req,txt){
                        if (typeof($this.treegrid('getSetting', 'onError')) === "function") {
                            $this.treegrid('getSetting', 'onError').apply($this,[req,status,error]);
                        }
                    }
                });
            },
            //加载子级节点
            renderChild : function( data ){
                var $this = $(this);
                var isTreedData = $this.treegrid('getSetting', 'treedData');
                var parentCol = $this.treegrid('getSetting', 'parentColumn');
                var sortCol = $this.treegrid('getSetting', 'sortColumn');
                var cols = $this.treegrid('getSetting', 'columns');
                var checkOrRadio = $this.treegrid('getSetting','checkOrRadio');
                var idCol = $this.treegrid('getSetting', 'idColumn');
                var treeColumn = $this.treegrid('getSetting','treeColumn');
                var rootValue = $this.treegrid('getSetting','rootValue');
                var checkName = $this.treegrid('getSetting','checkName');
                var checkColumn = $this.treegrid('getSetting','checkedColumn');
                var rootNodes = getRootNodesFromData(data, isTreedData, parentCol, sortCol,rootValue);
                var parentIndex = $this.treegrid('getNodeId');
                var $beforeTr = $this.next('tr'),$tbody = $this.closest('table').find('tbody');
                if (rootNodes && rootNodes.length > 0) {
                    $.each(rootNodes, function (i, item) {
                        var tr = $('<tr></tr>');
                        tr.data('obj',item);
                        tr.addClass('treegrid-' + (++nodeCount));
                        tr.addClass('treegrid-parent-' + parentIndex);
                        var hasDefaultCheck = item[checkColumn] == 'true' || item[checkColumn] == true ? true : false;
                        $.each(cols, function (index, column) {
                            var td = $('<td></td>');
                            if(column['width']){
                                var noww = column['width']+'';
                                var cw = noww.indexOf('px')>-1 ? noww : ( noww.indexOf('%')>-1 ? noww : noww+'px');
                                td.css('width',cw);
                            }
                            if(column['align']){
                                td.css('text-align',column['align']);
                            }
                            if(column['style']){
                                td.attr('style',style);
                            }
                            //add formatter
                            var showTxt = item[column.field] == null || item[column.field] == undefined || item[column.field] == 'null' ? '-' : item[column.field];
                            if(column['formatter']){
                                showTxt = column['formatter'](showTxt,item,i);
                            }
                            if(index == treeColumn){
                                if(checkOrRadio !== false){
                                    td.append(( checkOrRadio == 'check' ? '<span class="list-check-span"><input type="checkbox" title=" " byy-skin="primary" name="'+checkName+'" value="'+(item[idCol])+'" '+(hasDefaultCheck ? 'checked' : '')+' class="byy-form-checkbox"/></span>'+showTxt : '<span class="list-check-span"><input type="radio" name="'+checkName+'" value="'+(item[idCol])+'" class="byy-form-radio" title=" "/></span>'+showTxt)+'');
                                }else{
                                    td.html(showTxt);        
                                }
                            }else{
                                td.html(showTxt);        
                            }
                            tr.append(td);
                        });
                        //看有没有下一个，body
                        $beforeTr.length >0 ? $beforeTr.before(tr) : $tbody.append(tr);
                        $this.treegrid('renderChildList', data, item, nodeCount, cols, idCol, parentCol, sortCol,checkOrRadio,treeColumn,tr);
                    });
                }
                byy.initUI();
                return $this;
            },
            //异步加载渲染子节点
            renderChildList : function(data, parentData, parentIndex, columns, idColumn, parentColumn, sortColumn,checkOrRadio,treeColumn,ptr){
                var $this = $(this);
                var checkName = $this.treegrid('getSetting','checkName');
                var checkColumn = $this.treegrid('getSetting','checkedColumn');
                var $beforeTr = ptr.next('tr'),$tbody = $this.closest('table').find('tbody');
                var nodes = getListChildNodesFromData(data, parentData, idColumn, parentColumn, sortColumn);
                if (nodes && nodes.length > 0) {
                    $.each(nodes, function (i, item) {
                        var tr = $('<tr></tr>');
                        tr.data('obj',item);
                        var hasDefaultCheck = item[checkColumn] == 'true' || item[checkColumn] == true ? true : false;
                        var nowParentIndex = ++nodeCount;
                        tr.addClass('treegrid-' + nowParentIndex);
                        tr.addClass('treegrid-parent-' + parentIndex);
                        $.each(columns, function (index, column) {
                            var td = $('<td></td>');
                            if(column['width']){
                                var noww = column['width']+'';
                                var cw = noww.indexOf('px')>-1 ? noww : ( noww.indexOf('%')>-1 ? noww : noww+'px');
                                td.css('width',cw);
                            }
                            if(column['align']){
                                td.css('text-align',column['align']);
                            }
                            if(column['style']){
                                td.attr('style',style);
                            }
                            //add formatter
                            var showTxt = item[column.field] == null || item[column.field] == undefined || item[column.field] == 'null' ? '-' : item[column.field];
                            if(column['formatter']){
                                showTxt = column['formatter'](showTxt,item,i);
                            }
                            if(index == treeColumn){
                                if(checkOrRadio !== false){
                                    td.append(''+( checkOrRadio == 'check' ? '<span class="list-check-span"><input type="checkbox" byy-skin="primary" title=" " name="'+checkName+'" '+(hasDefaultCheck ? 'checked' : '')+' value="'+(item[idColumn])+'" class="byy-form-checkbox"/></span>'+showTxt : '<span class="list-check-span"><input type="radio" name="'+checkName+'" value="'+(item[idColumn])+'" class="byy-form-radio" title=" " /></span> '+showTxt)+'');
                                }else{
                                    td.html(showTxt);        
                                }
                            }else{
                                td.html(showTxt);        
                            }
                            tr.append(td);
                        });
                        //看有没有下一个，body
                        $beforeTr.length >0 ? $beforeTr.before(tr) : $tbody.append(tr);
                        $this.treegrid('renderChildList', data, item, nowParentIndex, columns, idColumn, parentColumn, sortColumn,checkOrRadio,treeColumn,tr);
                    });
                }
            },
            //加载数据，settings 是配置，pageparams 是分页参数
            loadData : function(settings,pageparams){
                var $this = $(this);
                var beforeFn = $this.treegrid('getSetting','onBefore');
                if(typeof beforeFn === 'function' && !beforeFn.apply($this)){
                    //如果返回false，则停止继续加载
                    return;
                }
                var pagination = $this.treegrid('getSetting','pagination');
                if(pagination){
                    var pagesize = $this.treegrid('getSetting','pagesize');
                    if(pageparams){
                        settings.ajaxParams = byy.extend(settings.ajaxParams,{rows : pageparams.pagesize,page : pageparams.curr});
                    }else{
                        settings.ajaxParams = byy.extend(settings.ajaxParams,{rows : pagesize,page : 1});
                    }
                }
                
                $.ajax({
                    url : settings.url,
                    type : settings.type,
                    data : settings.ajaxParams,
                    dataType : 'JSON',
                    success : function( res ){
                        res = byy.json(res);
                        var data = res.rows || res.list || res;
                        $this.treegrid('renderTable',data);
                        $this.treegrid('pagination',res.total || 0,pageparams);
                        settings.getRootNodes.apply(this, [$this]).treegrid('initNode', settings);
                        $this.treegrid('getRootNodes').treegrid('render');
                        byy.initUI();
                        //渲染分页数据 
                        //UNDO
                        //调用加载成功函数
                        if (typeof($this.treegrid('getSetting', 'onSuccess')) === "function") {
                            $this.treegrid('getSetting', 'onSuccess').apply($this,[res]);
                        }
                    },
                    error : function(req,txt){
                        if (typeof($this.treegrid('getSetting', 'onError')) === "function") {
                            $this.treegrid('getSetting', 'onError').apply($this,[req,txt]);
                        }
                    }
                });
            },
            //展示分页数据
            pagination : function( total,prevparams ){
                var $this = $(this);
                var settings = $this.data('settings');
                var pagination = $this.treegrid('getSetting','pagination');
                if(pagination){
                    var selector = $this.treegrid('getSetting','pageSelector');
                    var pagesize = $this.treegrid('getSetting','pagesize');
                    byy.page({
                        selector : selector,
                        total : total,
                        always : true,
                        curr : prevparams ? prevparams.curr : 1,
                        pagesize : prevparams ? prevparams.pagesize : pagesize,
                        callback : function( pageparam ){
                            //点击分页调用loadData，重新进行渲染
                            $this.treegrid('loadData',settings,pageparam);
                        }
                    });
                }
            },
            //渲染表格，进行生成
            renderTable : function(data){
                var $this = $(this);
                if($this.treegrid('getSetting','striped')){
                    $this.attr('byy-even','even');
                }
                var skin = ['','row','line','nob'];
                var border = $this.treegrid('getSetting','border');
                $this.attr('byy-skin',skin[byy.isNull(border) ? 0 : (border > 3 ? 0 : border)]);
                var isBody = $this.treegrid('getSetting','isBody');
                if(isBody === true){
                    $this.find()
                    $this.treegrid('renderBody',data);
                }else{
                    $this.html('');
                    $this.treegrid('renderHead');
                    $this.treegrid('renderBody',data);
                }
                $this.treegrid('initSelfEvents');
                return $this;
            },
            //添加一些自定义事件
            initSelfEvents : function(){
                $this = $(this);
                $this.off('click','tr').on('click','tr',function(ev){
                    var $tr = $(this);
                    var $clickEl = $(ev.target || ev.srcElement);
                    if($clickEl.hasClass('treegrid-expander')){
                        return;
                    }
                    //如果是treegrid-expander 则不监听事件
                    methods.clickRow.apply($tr);
                });
                return $this;
            },
            //刷新父节点,根据ID，重新刷新子节点，如果没有节点，则重新加载。
            reload : function( id ){
                var $this = $(this);
                var settings = $(this).data('settings');
                var $tr = $this.treegrid('getNodeByDataId',id);
                if($tr == null || $tr.length == 0){
                    console && console.log && console.log('没有找到该节点，请检查ID：'+id);
                    //重新刷新当前数据
                    $this.treegrid('loadData',settings);
                }else{
                    $tr.treegrid('loadChildNodes',true);
                }
            },
            //根据数据ID获得对应的tr
            getNodeByDataId : function( id ){
                var $this = $(this);
                var $tree = $this.closest('table');
                var settings = $tree.data('settings');
                var idColumn = $this.treegrid('getSetting','idColumn');
                return settings.getNodeByDataId.apply($tree,[id,$tree,idColumn]);
            },
            //选中行，仅限当前页面
            clickRow : function(){
                var $tr = $(this);
                if($tr.hasClass('treegridExt-header')){
                    return;
                }
                var single = $tr.treegrid('getSetting','single');
                var checkOrRadio = $tr.treegrid('getSetting','checkOrRadio');//单选还是复选
                var checkName = $tr.treegrid('getSetting','checkName');
                var hasSel = $tr.hasClass('selected');
                if(single === true){//单选，则取消其他选择
                    $tr.closest('table').find('tr.selected').removeClass('selected');
                    $tr.closest('table').find('[name="'+checkName+'"]').prop('checked',false);
                }
                hasSel ? $tr.removeClass('selected') : $tr.addClass('selected');
                $tr.find('[name="'+checkName+'"]').prop('checked',!hasSel);
                byy($tr.closest('table')).initUI();
                //callback oncheck
                if(typeof $tr.treegrid('getSetting','onCheck') === 'function'){
                    var item = $tr.data('obj');
                    $tr.treegrid('getSetting','onCheck').apply($tr,[item,!hasSel]);
                }
                //callback
                if(typeof $tr.treegrid('getSetting','onClick') === 'function'){
                    var item = $tr.data('obj');
                    $tr.treegrid('getSetting','onClick').apply($tr,[item]);
                }
                $tr.treegrid('cascade');
                return $tr;
            },
            cascade : function(){//this == tr
                //1.当前必须是复选框
                //2.选中后需要同时选中行selected
                //3.
                var $this = $(this);
                var checkOrRadio = $this.treegrid('getSetting','checkOrRadio');//单选还是复选
                if(checkOrRadio === 'check'){//复选框
                    var checkName = $this.treegrid('getSetting','checkName');//checkName
                    var isChecked = $this.find('input[name="'+checkName+'"]').prop('checked');//是否选中
                    var $tree = $this.closest('table');
                    var cascadeCheck = $this.treegrid('getSetting','cascadeCheck');//选中级联
                    var cascadeCancel = $this.treegrid('getSetting','cascadeCancel');//取消级联
                    if(!cascadeCheck){return $this;}//不级联
                    var needCheck = [],needJudge = isChecked ? cascadeCheck : cascadeCancel;
                    if(needJudge === 'up' || needJudge == 'all' ){//向上级联，需要获得该节点的所有父节点，直到最后
                        var $parentNodes = $this.treegrid('getAllParentNodes');
                        needCheck = needCheck.concat($parentNodes);
                    }
                    if(needJudge === 'down' || needJudge === 'all'){//向下级联，需要获得该节点的所有子节点
                        var childNodes = $this.treegrid('getAllChildNodes');
                        needCheck = needCheck.concat(childNodes);
                    }
                    if(needCheck.length > 0){
                        needCheck.forEach(function( item ){
                            isChecked ? item.addClass('selected') : item.removeClass('selected');
                            item.find('input[name="'+checkName+'"]').prop('checked',isChecked);
                            if(typeof item.treegrid('getSetting','onCheck') === 'function'){
                                var itemData = item.data('obj');
                                item.treegrid('getSetting','onCheck').apply(item,[itemData,isChecked]);
                            }
                        });
                    }
                    byy($tree).initUI();
                }
            },
            renderHead: function () {
                var $this = $(this);
                //debugger;
                var thead = $('<thead></thead>')
                var thr = $('<tr></tr>');
                thr.addClass('treegridExt-header');
                var checkOrRadio = $this.treegrid('getSetting','checkOrRadio');
                var treeColumn = $this.treegrid('getSetting','treeColumn');
                $.each($this.treegrid('getSetting', 'columns'), function (i, item) {
                    var th = $('<td></td>');
                    if(i == treeColumn){
                        if(checkOrRadio !== false && checkOrRadio == 'check'){
                            th.append('<span class="list-check-span"><input type="checkbox" title=" " byy-skin="primary" value="" name="checkAll" class="byy-form-checkbox"/></span>'+item.title);
                        }else{
                            th.text(item.title);
                        }
                    }else{
                        th.text(item.title);
                    }
                    thr.append(th);
                });
                thr.appendTo(thead);
                return $this.append(thead);
            },
            renderBody: function (data) {
                var $this = $(this);
                var tbody = $('<tbody></tbody>');
                var isTreedData = $this.treegrid('getSetting', 'treedData');
                var parentCol = $this.treegrid('getSetting', 'parentColumn');
                var sortCol = $this.treegrid('getSetting', 'sortColumn');
                var cols = $this.treegrid('getSetting', 'columns');
                var checkOrRadio = $this.treegrid('getSetting','checkOrRadio');
                var idCol = $this.treegrid('getSetting', 'idColumn');
                var treeColumn = $this.treegrid('getSetting','treeColumn');
                var rootValue = $this.treegrid('getSetting','rootValue');
                var checkName = $this.treegrid('getSetting','checkName');
                var checkColumn = $this.treegrid('getSetting','checkedColumn');
                var rootNodes = getRootNodesFromData(data, isTreedData, parentCol, sortCol,rootValue);
                if (rootNodes && rootNodes.length > 0) {
                    $.each(rootNodes, function (i, item) {
                        var tr = $('<tr></tr>');
                        tr.data('obj',item);
                        tr.addClass('treegrid-' + (++nodeCount));
                        var hasDefaultCheck = item[checkColumn] == 'true' || item[checkColumn] == true ? true : false;
                        $.each(cols, function (index, column) {
                            var td = $('<td></td>');
                            //add formatter
                            if(column['width']){
                                var noww = column['width']+'';
                                var cw = noww.indexOf('px')>-1 ? noww : ( noww.indexOf('%')>-1 ? noww : noww+'px');
                                td.css('width',cw);
                            }
                            if(column['align']){
                                td.css('text-align',column['align']);
                            }
                            if(column['style']){
                                td.attr('style',style);
                            }
                            var showTxt = item[column.field] == null || item[column.field] == undefined || item[column.field] == 'null' ? '-' : item[column.field];
                            if(column['formatter']){
                                showTxt = column['formatter'](showTxt,item,i);
                            }
                            if(index == treeColumn){
                                if(checkOrRadio !== false){
                                    td.append(( checkOrRadio == 'check' ? '<span class="list-check-span"><input type="checkbox" title=" " byy-skin="primary" name="'+checkName+'" '+(hasDefaultCheck ? 'checked' : '')+' value="'+(item[idCol])+'" class="byy-form-checkbox"/></span>'+showTxt : '<span class="list-check-span"><input type="radio" name="'+checkName+'" value="'+(item[idCol])+'" class="byy-form-radio" title=" "/></span>'+showTxt)+'');
                                }else{
                                    td.html(showTxt);        
                                }
                            }else{
                                td.html(showTxt);        
                            }
                            tr.append(td);
                        });
                        
                        tbody.append(tr);
                        $this.treegrid('renderListDataTr', data, item, nodeCount, cols, idCol, parentCol, sortCol, tbody,checkOrRadio,treeColumn);
                    });
                }
                byy.initUI();
                return $this.append(tbody);
            },
            //获得当前选中的行
            getSelectedNodes : function(){
                var $this = $(this);
                var trs = $this.find('tbody tr.selected');
                var datas = [];
                if(trs.length>0){
                    trs.each(function( i ){
                        datas.push($(this).data('obj'));
                    });
                }
                return datas;
            },
            renderListDataTr: function (data, parentData, parentIndex, columns, idColumn, parentColumn, sortColumn, tbody,checkOrRadio,treeColumn) {
                var $this = $(this);
                var isTreedData = $this.treegrid('getSetting', 'treedData');
                var checkName = $this.treegrid('getSetting','checkName');
                var checkColumn = $this.treegrid('getSetting','checkedColumn');
                var nodes = [];
                if(isTreedData){
                    var childCol = $this.treegrid('getSetting','childColumn');
                    nodes = getTreeChildNodesFromdata(parentData,childCol,sortColumn);
                }else{
                    nodes = getListChildNodesFromData(data, parentData, idColumn, parentColumn, sortColumn);
                }
                // var nodes = getListChildNodesFromData(data, parentData, idColumn, parentColumn, sortColumn);
                if (nodes && nodes.length > 0) {
                    $.each(nodes, function (i, item) {
                        var tr = $('<tr></tr>');
                        tr.data('obj',item);
                        var hasDefaultCheck = item[checkColumn] == 'true' || item[checkColumn] == true ? true : false;
                        var nowParentIndex = ++nodeCount;
                        tr.addClass('treegrid-' + nowParentIndex);
                        tr.addClass('treegrid-parent-' + parentIndex);
                        $.each(columns, function (index, column) {
                            var td = $('<td></td>');
                            //add formatter
                            if(column['width']){
                                var noww = column['width']+'';
                                var cw = noww.indexOf('px')>-1 ? noww : ( noww.indexOf('%')>-1 ? noww : noww+'px');
                                td.css('width',cw);
                            }
                            if(column['align']){
                                td.css('text-align',column['align']);
                            }
                            if(column['style']){
                                td.attr('style',style);
                            }
                            var showTxt = item[column.field] == null || item[column.field] == undefined || item[column.field] == 'null' ? '-' : item[column.field];
                            if(column['formatter']){
                                showTxt = column['formatter'](showTxt,item,i);
                            }
                            if(index == treeColumn){
                                if(checkOrRadio !== false){
                                    td.append(''+( checkOrRadio == 'check' ? '<span class="list-check-span"><input type="checkbox" byy-skin="primary" title=" " name="'+checkName+'" '+(hasDefaultCheck ? 'checked' : '')+' value="'+(item[idColumn])+'" class="byy-form-checkbox"/></span>'+showTxt : '<span class="list-check-span"><input type="radio" name="'+checkName+'" value="'+(item[idColumn])+'" class="byy-form-radio" title=" " /></span> '+showTxt)+'');
                                }else{
                                    td.html(showTxt);        
                                }
                            }else{
                                td.html(showTxt);        
                            }
                            tr.append(td);
                        });
                        tbody.append(tr);
                        $this.treegrid('renderListDataTr', data, item, nowParentIndex, columns, idColumn, parentColumn, sortColumn, tbody,checkOrRadio,treeColumn);
                    });
                }
            },
            /**
             * Initialize node
             *
             * @param {Object} settings
             * @returns {Object[]}
             */
            initNode: function(settings) {
                return this.each(function() {
                    var $this = $(this);
                    $this.treegrid('setTreeContainer', settings.getTreeGridContainer.apply(this));
                    $this.treegrid('getChildNodes').treegrid('initNode', settings);
                    $this.treegrid('initExpander').treegrid('initIndent').treegrid('initEvents').treegrid('initState').treegrid('initChangeEvent').treegrid("initSettingsEvents");
                });
            },
            initChangeEvent: function() {
                var $this = $(this);
                //Save state on change
                $this.on("change", function() {
                    var $this = $(this);
                    $this.treegrid('render');
                    if ($this.treegrid('getSetting', 'saveState')) {
                        $this.treegrid('saveState');
                    }
                });
                return $this;
            },
            /**
             * Initialize node events
             *
             * @returns {Node}
             */
            initEvents: function() {
                var $this = $(this);
                //Default behavior on collapse
                $this.on("collapse", function() {
                    var $this = $(this);
                    $this.removeClass('treegrid-expanded');
                    $this.addClass('treegrid-collapsed');
                });
                //Default behavior on expand
                $this.on("expand", function() {
                    var $this = $(this);
                    $this.removeClass('treegrid-collapsed');
                    $this.addClass('treegrid-expanded');
                });

                return $this;
            },
            /**
             * Initialize events from settings
             *
             * @returns {Node}
             */
            initSettingsEvents: function() {
                var $this = $(this);
                //Save state on change
                $this.on("change", function() {
                    var $this = $(this);
                    if (typeof($this.treegrid('getSetting', 'onChange')) === "function") {
                        $this.treegrid('getSetting', 'onChange').apply($this);
                    }
                });
                //Default behavior on collapse
                $this.on("collapse", function() {
                    var $this = $(this);
                    if (typeof($this.treegrid('getSetting', 'onCollapse')) === "function") {
                        $this.treegrid('getSetting', 'onCollapse').apply($this);
                    }
                });
                //Default behavior on expand
                $this.on("expand", function() {
                    var $this = $(this);
                    if (typeof($this.treegrid('getSetting', 'onExpand')) === "function") {
                        $this.treegrid('getSetting', 'onExpand').apply($this);
                    }

                });

                return $this;
            },
            /**
             * Initialize expander for node
             *
             * @returns {Node}
             */
            initExpander: function() {
                var $this = $(this);
                var cell = $this.find('td').get($this.treegrid('getSetting', 'treeColumn'));
                var tpl = $this.treegrid('getSetting', 'expanderTemplate');
                var expander = $this.treegrid('getSetting', 'getExpander').apply(this);
                if (expander) {
                    expander.remove();
                }
                $(tpl).prependTo(cell).click(function() {
                    $($(this).closest('tr')).treegrid('toggle');
                });
                return $this;
            },
            /**
             * Initialize indent for node
             *
             * @returns {Node}
             */
            initIndent: function() {
                var $this = $(this);
                $this.find('.treegrid-indent').remove();
                var tpl = $this.treegrid('getSetting', 'indentTemplate');
                var expander = $this.find('.treegrid-expander');
                var depth = $this.treegrid('getDepth');
                for (var i = 0; i < depth; i++) {
                    $(tpl).insertBefore(expander);
                }
                return $this;
            },
            /**
             * Initialise state of node
             *
             * @returns {Node}
             */
            initState: function() {
                var $this = $(this);
                if ($this.treegrid('getSetting', 'saveState') && !$this.treegrid('isFirstInit')) {
                    $this.treegrid('restoreState');
                } else {
                    if ($this.treegrid('getSetting', 'initialState') === "expanded") {
                        $this.treegrid('expand');
                    } else {
                        $this.treegrid('collapse');
                    }
                }
                return $this;
            },
            /**
             * Return true if this tree was never been initialised
             *
             * @returns {Boolean}
             */
            isFirstInit: function() {
                var tree = $(this).treegrid('getTreeContainer');
                if (tree.data('first_init') === undefined) {
                    tree.data('first_init', $.cookie(tree.treegrid('getSetting', 'saveStateName')) === undefined);
                }
                return tree.data('first_init');
            },
            /**
             * Save state of current node
             *
             * @returns {Node}
             */
            saveState: function() {
                var $this = $(this);
                if ($this.treegrid('getSetting', 'saveStateMethod') === 'cookie') {

                    var stateArrayString = $.cookie($this.treegrid('getSetting', 'saveStateName')) || '';
                    var stateArray = (stateArrayString === '' ? [] : stateArrayString.split(','));
                    var nodeId = $this.treegrid('getNodeId');

                    if ($this.treegrid('isExpanded')) {
                        if ($.inArray(nodeId, stateArray) === -1) {
                            stateArray.push(nodeId);
                        }
                    } else if ($this.treegrid('isCollapsed')) {
                        if ($.inArray(nodeId, stateArray) !== -1) {
                            stateArray.splice($.inArray(nodeId, stateArray), 1);
                        }
                    }
                    $.cookie($this.treegrid('getSetting', 'saveStateName'), stateArray.join(','));
                }
                return $this;
            },
            /**
             * Restore state of current node.
             *
             * @returns {Node}
             */
            restoreState: function() {
                var $this = $(this);
                if ($this.treegrid('getSetting', 'saveStateMethod') === 'cookie') {
                    var stateArray = $.cookie($this.treegrid('getSetting', 'saveStateName')).split(',');
                    if ($.inArray($this.treegrid('getNodeId'), stateArray) !== -1) {
                        $this.treegrid('expand');
                    } else {
                        $this.treegrid('collapse');
                    }

                }
                return $this;
            },
            /**
             * Method return setting by name
             *
             * @param {type} name
             * @returns {unresolved}
             */
            getSetting: function(name) {
                if (!$(this).treegrid('getTreeContainer')) {
                    return null;
                }
                return $(this).treegrid('getTreeContainer').data('settings')[name];
            },
            /**
             * Add new settings
             *
             * @param {Object} settings
             */
            setSettings: function(settings) {
                $(this).treegrid('getTreeContainer').data('settings', settings);
            },
            /**
             * Return tree container
             *
             * @returns {HtmlElement}
             */
            getTreeContainer: function() {
                return $(this).data('treegrid');
            },
            /**
             * Set tree container
             *
             * @param {HtmlE;ement} container
             */
            setTreeContainer: function(container) {
                return $(this).data('treegrid', container);
            },
            /**
             * Method return all root nodes of tree.
             *
             * Start init all child nodes from it.
             *
             * @returns {Array}
             */
            getRootNodes: function() {
                return $(this).treegrid('getSetting', 'getRootNodes').apply(this, [$(this).treegrid('getTreeContainer')]);
            },
            /**
             * Method return all nodes of tree.
             *
             * @returns {Array}
             */
            getAllNodes: function() {
                return $(this).treegrid('getSetting', 'getAllNodes').apply(this, [$(this).treegrid('getTreeContainer')]);
            },
            /**
             * Mthod return true if element is Node
             *
             * @returns {String}
             */
            isNode: function() {
                return $(this).treegrid('getNodeId') !== null;
            },
            /**
             * Mthod return id of node
             *
             * @returns {String}
             */
            getNodeId: function() {
                if ($(this).treegrid('getSetting', 'getNodeId') === null) {
                    return null;
                } else {
                    return $(this).treegrid('getSetting', 'getNodeId').apply(this);
                }
            },
            /**
             * Method return parent id of node or null if root node
             *
             * @returns {String}
             */
            getParentNodeId: function() {
                return $(this).treegrid('getSetting', 'getParentNodeId').apply(this);
            },
            /**
             * Method return parent node or null if root node
             *
             * @returns {Object[]}
             */
            getParentNode: function() {
                if ($(this).treegrid('getParentNodeId') === null) {
                    return null;
                } else {
                    return $(this).treegrid('getSetting', 'getNodeById').apply(this, [$(this).treegrid('getParentNodeId'), $(this).treegrid('getTreeContainer')]);
                }
            },
            getAllParentNodes : function(){
                var parentNodes = [];
                var $this = $(this);
                var parentId = $this.treegrid('getParentNodeId');
                if(parentId!= null){
                    var $parentRow = $('.treegrid-'+parentId);
                    parentNodes.push($parentRow);
                    var temp = $parentRow.treegrid('getAllParentNodes');
                    parentNodes = parentNodes.concat(temp);
                }
                return parentNodes;
            },
            /**
             * Method return array of child nodes or null if node is leaf
             *
             * @returns {Object[]}
             */
            getChildNodes: function() {
                return $(this).treegrid('getSetting', 'getChildNodes').apply(this, [$(this).treegrid('getNodeId'), $(this).treegrid('getTreeContainer')]);
            },
            getAllChildNodes : function(){
                var childs = [];
                var cnodes = $(this).treegrid('getSetting', 'getChildNodes').apply(this, [$(this).treegrid('getNodeId'), $(this).treegrid('getTreeContainer')]);
                if(cnodes.length == 0){
                    return childs;
                }else{
                    cnodes.each(function(index,item){
                        childs.push($(item));
                        var t = $(item).treegrid('getAllChildNodes');
                        childs = childs.concat(t);
                    });
                }
                return childs;
            },
            /**
             * Method return depth of tree.
             *
             * This method is needs for calculate indent
             *
             * @returns {Number}
             */
            getDepth: function() {
                if ($(this).treegrid('getParentNode') === null) {
                    return 0;
                }
                return $(this).treegrid('getParentNode').treegrid('getDepth') + 1;
            },
            /**
             * Method return true if node is root
             *
             * @returns {Boolean}
             */
            isRoot: function() {
                return $(this).treegrid('getDepth') === 0;
            },
            /**
             * Method return true if node has no child nodes
             *
             * @returns {Boolean}
             */
            isLeaf: function() {
                return $(this).treegrid('getChildNodes').length === 0;
            },
            /**
             * Method return true if node last in branch
             *
             * @returns {Boolean}
             */
            isLast: function() {
                if ($(this).treegrid('isNode')) {
                    var parentNode = $(this).treegrid('getParentNode');
                    if (parentNode === null) {
                        if ($(this).treegrid('getNodeId') === $(this).treegrid('getRootNodes').last().treegrid('getNodeId')) {
                            return true;
                        }
                    } else {
                        if ($(this).treegrid('getNodeId') === parentNode.treegrid('getChildNodes').last().treegrid('getNodeId')) {
                            return true;
                        }
                    }
                }
                return false;
            },
            /**
             * Method return true if node first in branch
             *
             * @returns {Boolean}
             */
            isFirst: function() {
                if ($(this).treegrid('isNode')) {
                    var parentNode = $(this).treegrid('getParentNode');
                    if (parentNode === null) {
                        if ($(this).treegrid('getNodeId') === $(this).treegrid('getRootNodes').first().treegrid('getNodeId')) {
                            return true;
                        }
                    } else {
                        if ($(this).treegrid('getNodeId') === parentNode.treegrid('getChildNodes').first().treegrid('getNodeId')) {
                            return true;
                        }
                    }
                }
                return false;
            },
            /**
             * Return true if node expanded
             *
             * @returns {Boolean}
             */
            isExpanded: function() {
                return $(this).hasClass('treegrid-expanded');
            },
            /**
             * Return true if node collapsed
             *
             * @returns {Boolean}
             */
            isCollapsed: function() {
                return $(this).hasClass('treegrid-collapsed');
            },
            /**
             * Return true if at least one of parent node is collapsed
             *
             * @returns {Boolean}
             */
            isOneOfParentsCollapsed: function() {
                var $this = $(this);
                if ($this.treegrid('isRoot')) {
                    return false;
                } else {
                    if ($this.treegrid('getParentNode').treegrid('isCollapsed')) {
                        return true;
                    } else {
                        return $this.treegrid('getParentNode').treegrid('isOneOfParentsCollapsed');
                    }
                }
            },
            /**
             * Expand node
             *
             * @returns {Node}
             */
            expand: function() {
                var trItem = $(this).data('obj');
                var isParent = trItem["isParent"],sync = trItem["sync"];
                if ( (!this.treegrid('isLeaf') && !this.treegrid("isExpanded") ) ) {
                    this.trigger("expand");
                    this.trigger("change");
                    return this;
                }
                if(( (isParent == 'true' || isParent == true)&&(!sync) )){
                    //判断第一次
                    var  isFirst = trItem['isFirst'];
                    if(isFirst && (window.treegridIsLoading!== true) ){
                        $(this).treegrid('loadChildNodes');
                    }else{
                        trItem['isFirst'] = true;
                        $(this).data('obj',trItem);
                    }
                }
                return this;
            },
            /**
             * Expand all nodes
             *
             * @returns {Node}
             */
            expandAll: function() {
                var $this = $(this);
                $this.treegrid('getRootNodes').treegrid('expandRecursive');
                return $this;
            },
            /**
             * Expand current node and all child nodes begin from current
             *
             * @returns {Node}
             */
            expandRecursive: function() {
                return $(this).each(function() {
                    var $this = $(this);
                    $this.treegrid('expand');
                    if (!$this.treegrid('isLeaf')) {
                        $this.treegrid('getChildNodes').treegrid('expandRecursive');
                    }
                });
            },
            /**
             * Collapse node
             *
             * @returns {Node}
             */
            collapse: function() {
                return $(this).each(function() {
                    var $this = $(this);
                    if (!$this.treegrid('isLeaf') && !$this.treegrid("isCollapsed")) {
                        $this.trigger("collapse");
                        $this.trigger("change");
                    }
                });
            },
            /**
             * Collapse all nodes
             *
             * @returns {Node}
             */
            collapseAll: function() {
                var $this = $(this);
                $this.treegrid('getRootNodes').treegrid('collapseRecursive');
                return $this;
            },
            /**
             * Collapse current node and all child nodes begin from current
             *
             * @returns {Node}
             */
            collapseRecursive: function() {
                return $(this).each(function() {
                    var $this = $(this);
                    $this.treegrid('collapse');
                    if (!$this.treegrid('isLeaf')) {
                        $this.treegrid('getChildNodes').treegrid('collapseRecursive');
                    }
                });
            },
            /**
             * Expand if collapsed, Collapse if expanded
             *
             * @returns {Node}
             */
            toggle: function() {
                var $this = $(this);
                if ($this.treegrid('isExpanded')) {
                    $this.treegrid('collapse');
                } else {
                    $this.treegrid('expand');
                }
                return $this;
            },
            /**
             * Rendering node
             *
             * @returns {Node}
             */
            render: function() {
                return $(this).each(function() {
                    var $this = $(this);
                    var trItem = $this.data('obj'),
                        isParent = trItem['isParent'];
                    //if parent colapsed we hidden
                    if ($this.treegrid('isOneOfParentsCollapsed')) {
                        $this.hide();
                    } else {
                        $this.show();
                    }
                    if (!$this.treegrid('isLeaf') || (isParent == true || isParent == 'true') ) {
                        $this.treegrid('renderExpander');
                        $this.treegrid('getChildNodes').treegrid('render');
                    }else{
                        var iconName = $this.treegrid('getSetting','iconName');
                        if(iconName){
                            var expander = $this.treegrid('getSetting', 'getExpander').apply(this);
                            if(expander){
                                expander.addClass(trItem[iconName]);
                            }
                        }
                    }
                });
            },
            /**
             * Rendering expander depends on node state
             *
             * @returns {Node}
             */
            renderExpander: function() {
                return $(this).each(function() {
                    var $this = $(this);
                    var expander = $this.treegrid('getSetting', 'getExpander').apply(this);
                    var trItem = $this.data('obj');
                    var iconName = $this.treegrid('getSetting','iconName');
                    if (expander) {
                        //如果有自定义图标，则使用自定义图标
                        if(iconName){
                            expander.addClass(trItem[iconName]);
                        }else{
                            if (!$this.treegrid('isCollapsed')) {
                                expander.removeClass($this.treegrid('getSetting', 'expanderCollapsedClass'));
                                expander.addClass($this.treegrid('getSetting', 'expanderExpandedClass'));
                            } else {
                                expander.removeClass($this.treegrid('getSetting', 'expanderExpandedClass'));
                                expander.addClass($this.treegrid('getSetting', 'expanderCollapsedClass'));
                            }
                            //如果是父节点，且没有加载过数据，则关闭
                            if( (trItem["isParent"] == true ||trItem["isParent"] == 'true') && !trItem["sync"]){
                                expander.removeClass($this.treegrid('getSetting', 'expanderExpandedClass'));
                                expander.addClass($this.treegrid('getSetting', 'expanderCollapsedClass'));
                            }
                        }
                    } else {
                        $this.treegrid('initExpander');
                        $this.treegrid('renderExpander');
                    }
                });
            }
        };
        $.fn.treegrid = function(method) {
            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return methods.initTree.apply(this, arguments);
            } else {
                $.error('Method with name ' + method + ' does not exists for jQuery.treegrid');
            }
        };
        /**
         *  Plugin's default options
         */
        $.fn.treegrid.defaults = {
            initialState: 'expanded',
            saveState: false,
            saveStateMethod: 'cookie',
            saveStateName: 'tree-grid-state',
            expanderTemplate: '<span class="treegrid-expander byyicon"></span>',
            indentTemplate: '<span class="treegrid-indent"></span>',
            expanderExpandedClass: 'icon-folder-open',
            expanderCollapsedClass: 'icon-folder-close',
            treeColumn: 0,
            //added
            idColumn : 'id',                                                //主键名称，默认ID
            rootValue : "",                                                 //rootId value
            treedData: false,                                               //是否树化的数据
            childColumn : 'child',                                          //子级节点名称
            parentColumn : 'parentId',                                      //父级ID
            checkedColumn :'checked',                                       //复选框使用，是否选中，默认checked属性，值为false,true
            sortColumn : null,                                              //排序字段
            ajaxParams : {},                                                //异步请求数据时候的参数
            url : null,                                                     //异步请求的路径
            type : 'POST',                                                  //异步请求的类型
            striped : true,                                                 //是否各行变色
            // iconName : 'iconName', 图标展示                              //如果有iconName,则显示对应的icon图标
            pagination : false,                                             //是否分页,默认不分页
            pageSelector : '.page',                                         //分页的容器
            pagesize : 10,                                                  //分页条数，默认10条
            border:0,                                                       //边框样式，支持0123
            expandAll : true,                                               //是否默认全部展开
            single : false,                                                 //是单选还是多选，默认多选
            columns : [],                                                   //列对应的属性
            checkOrRadio : 'check',                                         //单选还是复选
            isBody : false,                                                 //是否只渲染body
            cascadeCheck : false,                                           //级联选中，false不级联，up 向上级联，down,向下级联，all全部级联
            cascadeCancel : false,                                          //级联取消，false不级联，up 向上级联，down,向下级联，all全部级联

            getExpander: function() {
                return $(this).find('.treegrid-expander');
            },
            getNodeId: function() {
                var template = /treegrid-([A-Za-z0-9_-]+)/;
                if (template.test($(this).attr('class'))) {
                    return template.exec($(this).attr('class'))[1];
                }
                return null;
            },
            getParentNodeId: function() {
                var template = /treegrid-parent-([A-Za-z0-9_-]+)/;
                if (template.test($(this).attr('class'))) {
                    return template.exec($(this).attr('class'))[1];
                }
                return null;
            },
            getNodeByDataId : function( id ,treegridContainer,idColumn){
                var hasInput = treegridContainer.find('.list-check-span').length > 0 ? true : false;
                if(hasInput){
                    var $ipt = treegridContainer.find('input[value="'+id+'"]');
                    var $tr = $ipt.closest('tr');
                    return $tr;
                }else{
                    //每个tr查找id
                    var $dest = null;
                    treegridContainer.find('tr').each(function(){
                        var d = $(this).data('obj');
                        if(d[idColumn] == id){
                            $dest = $(this);
                        }
                    });
                    return $dest;
                }
            },
            getNodeById: function(id, treegridContainer) {
                var templateClass = "treegrid-" + id;
                return treegridContainer.find('tr.' + templateClass);
            },
            getChildNodes: function(id, treegridContainer) {
                var templateClass = "treegrid-parent-" + id;
                return treegridContainer.find('tr.' + templateClass);
            },
            getTreeGridContainer: function() {
                return $(this).closest('table');
            },
            getRootNodes: function(treegridContainer) {
                var result = $.grep(treegridContainer.find('tr'), function(element) {
                    var classNames = $(element).attr('class');
                    var templateClass = /treegrid-([A-Za-z0-9_-]+)/;
                    var templateParentClass = /treegrid-parent-([A-Za-z0-9_-]+)/;
                    return templateClass.test(classNames) && !templateParentClass.test(classNames);
                });
                return $(result);
            },
            getAllNodes: function(treegridContainer) {
                var result = $.grep(treegridContainer.find('tr'), function(element) {
                    var classNames = $(element).attr('class');
                    var templateClass = /treegrid-([A-Za-z0-9_-]+)/;
                    return templateClass.test(classNames);
                });
                return $(result);
            },
            //Events
            onCollapse: null,//没有参数，可以从this中继续执行函数
            onExpand: null,//没有参数，可以从this中继续执行函数
            onChange: null,//没有参数，可以从this中继续执行函数
            onSuccess : null,//数据加载成功,参数function( res ),代表返回值
            onBefore : null,//加载数据前调用,没有参数，返回false中断加载
            onError : null,//加载失败调用，参数function(req,status,err) ,代表xhr,状态，error
            onClick : null,//选中行调用,参数function(item)，代表当前点击的行数据
            onCheck : null//复选框或单选按钮选中或取消时候调用，function( item , checked) item代表行数据，checked 代表选中或取消

        };
    })(window.jQuery || byy.jquery);

    exports('treegrid',{
        version :'1.0.0',
        msg : '暂无扩展函数'
    });
});

