(function() {
    // var baseUrl = "http://127.0.0.1:3000/api/";

    $(function() {
        init();
    });

    function init() {
        initOrderForm();
        initDfDatatable();
    }

    function initOrderForm() {
        $("#orderBtn").on("click", function() {
            $.ajax({
                method: "POST",
                url: "/api/df_order/insert",
                data: $("form.order").serialize(),
                timeout: 3000,
            }).done(function(result) {
                console.log("insert ok --");
            }).fail(function() {
                console.log("insert failed --");
            })
        });
    }

    function initDfDatatable() {

        $.ajax({
            method: "GET",
            // TODO
            url: "/api/df_order/select/" + "1",
            data: $("form.order").serialize(),
            dataType: "jsonp",
            timeout: 3000
        }).done(function(result) {
            console.log("get order list success ", result);
            initTable(result);
        }).fail(function() {
            console.log("get order list falied .");
        });

    }

    function initTable(dataSet) {
        $('#dfDiv').html('<table cellpadding="0" cellspacing="0" border="0" class="display" id="dfTable"></table>');

        $('#dfTable').dataTable({
            "data": dataSet,
            "aoColumns": [ {
                "mData": "id",
                "title": "ID"
            }, {
                "mData": "name",
                "title": "订餐人"
            }, {
                "mData": "content",
                "title": "订餐内容"

            }, {
                "mData": "id",
                "render": function(value){

                }
            } ]
        });
    }
})();
