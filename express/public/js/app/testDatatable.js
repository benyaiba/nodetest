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
  initDataTable1();
  initDataTable2();
}

// back-end table init
function initDataTable2() {
	$("#table2").dataTable({
		"bProcessing": true,
		"bServerSide": true,
		"bFilter": true,
		// infinity scroll begin
//		"bScrollInfinite": true,
//		"bScrollCollapse": true,
//		"sScrollY": "200px",
		// end
    "sPaginationType": "full_numbers",
		"sAjaxSource": "../person",
		aoColumns: [{
			mData: "first",
			sTitle: "First"
		},
		{
			mData: "last",
			sTitle: "Last"
		},
		{
			mData: "age",
			sTitle: "Age"
		}]
	});
}

// frond-end dataTable
function initDataTable1(){
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