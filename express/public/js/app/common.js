currentPage = "";

function loadPage(pageName){
  var destroyMethodName = currentPage + "Destroy";
  var path = "/public/html/" + pageName + ".html";
  var initMethodName = pageName + "Init";
  
  // destroy the old page first;
  var destroyFn = window[destroyMethodName];
  if(destroyFn) destroyFn();
  
  // load the new page
  $.ajax({
    url: path,
    type: "GET",
    dataType: "html",
    success: function(htmlContent){
      $("#content").html(htmlContent);
      if(window[initMethodName]){
        window[initMethodName]();
      };
      currentPage = pageName;
    },
    error: function(err){
      console.log(err);
    },
    complete: function(){
    }
  });
}


