(function() {

    $(function() {
        init();
    });

    function init() {
        initGroupSelect();
        initDfInfo();
        initOrderForm();
        initDfDatatable();
    }

    function initDfInfo(){
        var groupId = getGroupId();
        $.ajax({
            method: "GET",
            url: "/api/df_info/select/" + groupId,
            dataType: "jsonp",
            timeout: 3000
        }).done(function(result){
            if(!result || !result[0]){
                $("#endTimeDiv").html("无限制");
                $("#dfInfoDiv").html("无");
                return;
            }
            var dfInfo = result[0];
            // support html
            var endTime = dfInfo.end_time;
            if(!endTime){
                endTime = "无限制";
            }
            var dish = dfInfo.dish;
            if(!dish){
                dish = "无";
            }
            $("#endTimeDiv").html(endTime);
            $("#dfInfoDiv").html(dish);
        }).fail(function(){
            showErrorMsg();
        });
    }

    function initGroupSelect(){
        $("ul.nav > li").on("click", function(){
            $("ul.nav > li").removeClass("active");
            $(this).addClass("active");
            $.cookie("groupId", getGroupId(), {expires: 365});
            initDfInfo();
            initDfDatatable();
        });

        var cookieSelect = $.cookie("groupId");
        if(cookieSelect){
            $("ul.nav > li").removeClass("active");
            $("ul.nav > li[groupId="+cookieSelect+"]").addClass("active");
        }
    }

    function initOrderForm() {
        $("#orderBtn").on("click", function() {
            $("#orderPop").modal("show");
        });
        $("#orderCancel").on("click", function(){
            $("#orderPop").modal("hide");
        });

        $("#orderConfirm1, #orderConfirm2").on("click", function(){
            $("#orderPop").modal("hide");
            _doOrder();
        });
    }

    function _doOrder(){
        $.ajax({
            method: "POST",
            url: "/api/df_order/insert",
            data: $("form.order").serialize() + "&group_id=" + getGroupId(),
            timeout: 3000,
        }).done(function(result) {
            if(result.error){
                showErrorMsg(result.error);
            }else{
                initDfDatatable();
            }
        }).fail(function() {
            showErrorMsg();
        });
    }

    function initDfDatatable() {

        $.ajax({
            method: "GET",
            url: "/api/df_order/select/" + getGroupId(),
            dataType: "jsonp",
            timeout: 3000
        }).done(function(result) {
            console.log("get order list success ", result);
            initTable(result);
            initDataTableEvent();
        }).fail(function() {
            showErrorMsg();
        });

    }

    function initTable(dataSet) {

        var oTable = $('#dfTable').dataTable({
            "bDestroy": true,
            "bFilter": false,
            "bPaginate": false,
            "aaData": dataSet,
            "aoColumns": [ {
                "mData": "id",
                "sClass": "right",
                "sTitle": "ID",
                "sWidth": "50px"
            }, {
                "mData": "name",
                "sTitle": "订餐人"
            }, {
                "mData": "content",
                "sTitle": "订餐内容"

            }, {
                "mData": "id",
                "sClass": "center",
                "bSortable": false,
                "sWidth": "60px",
                "mRender": function(value, type, row){
                    var $delBtn = $("<input type='button' class='btn' name='del' value='删除' />");
                    return $delBtn[0].outerHTML;
                }
            } ]
        });
        return oTable;
    }

    function initDataTableEvent() {

        $("#deleteCancel").off("click").on("click", function(){
            $("#deletePop").modal("hide");
        });
        $("#deleteConfirm").off("click").on("click", function(){
            $("#deletePop").modal("hide");
            _doOrderDelete();
        });

        var oTable = $("#dfTable").dataTable();
        oTable.$("tr").on("click", "input", function(e) {
            var $tr = $(this).closest("tr");
            var rowData = oTable.fnGetData($tr.get(0));
            var id = rowData.id;
            $("#oderDeleteId").val(id);
            $("#deletePop").modal("show");
        });
    }

    function _doOrderDelete(){
        var id = $("#oderDeleteId").val();
        $.ajax({
            method: "POST",
            url: "/api/df_order/delete",
            data: $.param({
                "id": id,
                "group_id": getGroupId()
            }),
            timeout: 3000
        }).done(function(result) {
            if (result.error) {
                showErrorMsg(result.error);
            } else {
                initDfDatatable();
            }
        }).fail(function() {
            showErrorMsg();
        });
    }

    function getGroupId(){
        return $("ul.nav > li.active").attr("groupId");
    }

    function showErrorMsg(msg){
        msg = msg || "系统异常。。。";
        $("#errorDiv").text(msg);
        $("#errorDiv").fadeIn(300).delay(2000).fadeOut(500);
    }

})();
