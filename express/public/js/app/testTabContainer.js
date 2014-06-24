function testTabContainerInit(){
  console.log("... in tab container init");
  // tab show
  $('#myTab a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
  });
  
  // tab shown
  $('#myTab a').on('shown', function (e) {
    console.log(e.target);
    console.log(e.relatedTarget);
  });
}