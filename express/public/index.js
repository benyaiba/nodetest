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
  // init my plugin test
  $("#pluginTest").colorIt({color:"green"}).showLinkHref2(function(){
  	  console.log("-- callback in showLinkHref2 --");
  	  console.log(this, $(this));
  });
  // init test form dialog
  initTestDialog();
});

function initTestDialog(){
  $("#formDialogBtn").on("click", function(){
    $("#formDialog").modal("show");
    $("#formDialog .modal-footer .colseBtn").off("click").on("click", function(){
      $("#formDialog").modal("hide");
    });
    $("#formDialog .modal-footer .submitBtn").off("click").on("click", function(){
      $("#testForm").submit();
    });
    $("#testForm").on("submit", function(){
      console.log("-p-11111111", new FormData($("#testForm")[0]));
      console.log("-p-2222", $("#testForm").serialize());
      console.log("-p-3333", $("#testForm").serializeArray());
      var fd = new FormData($("#testForm")[0]);
      fd.append("myname", "zhaohs");
      $.ajax({
        url: "/user",
        //data: $("#testForm").serialize(),
        data: fd,
        //data: $("#testForm").serializeArray(),
        //data: JSON.stringify([{"userName": "zhaohs", "userAge":30}]),
        processData: false,
        contentType: false,
        //contentType: "application/json",
        method: "POST",
        success : function(result){
          console.log("ajax success",result.result);
        },
        error: function(){
          console.log("ajax error");
        }
      });
      return false;
    });
    // init file upload
    $("#tfile").on("change", function(){
      var files = this.files;
      console.log(files.length);
      
      var fr = new FileReader();
      fr.onload = function(e){
        var result = e.target.result;
        console.log("++ on load ...", e.target.result);
        $("#imgPreview").html("").append("<img src=\"" + result + "\" style='height:200px'/>");
      }
      fr.onprogress = function(){
        console.log("++ progress", arguments);
      }
      fr.readAsDataURL(files[0]);
    });
  });
}

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
