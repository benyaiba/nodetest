// add two custom sort functino
jQuery.fn.dataTableExt.oSort['custom-asc']  = function(x,y) {
    if(x.indexOf("W") == 0){
      return -1;
    }else{
      return 1;
    }
};
 
jQuery.fn.dataTableExt.oSort['custom-desc'] = function(x,y) {
    if(x.indexOf("O") == 0){
      return -1;
    }else{
      return 1;
    }
};

function testDatatableInit(){
  $("#table1").dataTable({
    bLengthChange: false,
    iDisplayLength: 5,
    bsort: false,
    aaSorting: [[2, "desc"],[1,"asc"]],
    aoColumns: [
      null,
      {"sType": "custom"},
      {"sType": "custom"},
      null,
      null
    ]
  });
}