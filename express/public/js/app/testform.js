//form submit:
//  application/x-www-form-urlencoded
//  name=zhaohs&age=30
//  name[]=zhaohs1&name[]=zhaohs2&name[]=zhaohs3
//  name[0]=zhaohs1&name[1]=zhaohs2&name[2]=zhaohs3
//  student[name]=zhaohs&student[age]=30
//  student[0][name]=zhaohs&student[0][age]=30
//ajax submit:
//  use json format

function testformInit(){
  $("#btn1").on("click", function(evt){
    $("#result1").html($("#form1").serialize());
    doAjax(null, $("#form1").serialize());
    return false;
  });
  
  $("#btn2").on("click", function(evt){
    $("#result2").html($("#form2").serialize());
    doAjax(null, $("#form2").serialize());
    return false;
  });
  
  $("#btn3").on("click", function(evt){
    $("#result3").html($("#form3").serialize());
    doAjax(null, $("#form3").serialize());
    return false;
  });
  
  $("#btn4").on("click", function(evt){
    $("#result4").html($("#form4").serialize());
    doAjax(null, $("#form4").serialize());
    return false;
  });
  $("#btn5").on("click", function(evt){
    $("#result5").html($("#form5").serialize());
    doAjax(null, $("#form5").serialize());
    return false;
  });
  
  // file upload "onchange"
  $("#uf").on("change", function(evt){
    var f = evt.target.files[0];
    var fr = new FileReader();
    fr.onload = function(evt){
      $("<img src='' style='width:300px;height:200px'/>")
        .attr("src", evt.target.result)
        .appendTo($("#result6"));
    };
    fr.readAsDataURL(f)
  });
  // send file to server
  $("#btn6").on("click", function(){
    var d = new FormData($("#form6").get(0));
    d.append("age",30);
    d.append("uploadFile", $("#uf").get(0).files[0]);
    $.ajax({
      url:"/imgUpload",
      method: "POST",
      data: d,
      processData : false,
      contentType: false,
      dataType: "json",
      success: function(result){
//        var fr = new FileReader();
//        fr.onload = function(evt){
//          var url = evt.target.result;
//          $("<img src='' style='width:300px;height:200px'/>")
//            .attr("src", "" + evt.target.result)
//            .appendTo($("#result6"));
//        };
//        console.log(new Blob(result.result));
//        fr.readAsDataURL(new Blob(result.result));

          $("<img src='' style='width:300px;height:200px'/>")
            .attr("src", "data:image/jpeg;base64," + result.result)
            .appendTo($("#result6"));
      }
    });
    return false;
  });
}

function doAjax(url, data){
  if(url == null){
    url = "/user2";
  }
  $.ajax({
    url: url,
    data: data,
    method: "POST"
  });
}