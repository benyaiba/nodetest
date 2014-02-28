$(function() {
  console.log("ready ...");
  // init datatable
  initDataTable();
  // init newBtn for bootstrap dialog
  $("#newBtn").on("click", function(){
    $("#testDialog").modal("show");
    $("#testDialog .modal-footer .btn").off("click").on("click", function(){
      $("#testDialog").modal("hide");
    });
  });
  // init group button
  $(".btn-group").delegate("a", "click", function(){
    console.log($(this).html());
  });
  // init test link
  $("#testLink").off("click").on("click", function(){
    console.log("test link clicked !");
  });
  $("#testLink2").off("click").on("click", function(){
    return false;
  });
  // init dialog
  $("#td").dialog({autoOpen: false, buttons: [{"text": "close", click: function(){$(this).dialog("close")}}]});
  $("#openDialogBtn").on("click", function(){
    $("#td").dialog("open");
  });
  // init datepicker
  $("#picker").datepicker();
});

function initDataTable() {
  $("#example").dataTable({
    "bPaginate": false
      ,
    "aoColumns": [{
      "sTitle": "Site",
      "mData": "site"
    },
    {
      "sTitle": "Id",
      "mData": "id"
    },
    {
      "sTitle": "Password",
      "mData": "password"
    }]
  });
  initAjax();

}

function initAjax(){
  $.ajax({
    url: "/user/zhao_hongsheng",
    type: "GET",
    dataType: "json",
    success: function(json) {
      console.log("success...", json);
      var dtObj = $("#example").dataTable();
      dtObj.fnClearTable();
      dtObj.fnAddData(json);
    },
    error: function(xhr, status) {
      console.log("error", arguments);
    },
    complete: function(xhr, status) {
      console.log("complete ...");
    }
  });
}
