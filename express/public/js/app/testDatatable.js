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
  initDataTable1c();
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

function initDataTable1a(){
  $("#table1").dataTable({
    bLengthChange: false,
    iDisplayLength: 10,
    bSort: true,
    aoColumns: [
      { "iDataSort": 4 },
      { "asSorting": [ "desc", "asc", "asc" ] },
      { "asSorting": [ "desc" ] },
      {
        "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
          if ( sData == "1.7" ) {
            $(nTd).css('color', 'red')
          }
        }
      },
      null
    ]
  });
}

function initDataTable1b(){
  $("#table1").dataTable({
    bLengthChange: false,
    iDisplayLength: 10,
    bSort: true,
    "aoColumns": [
      { "mData": "engine" },
      { "mData": "browser" },
      {
        "mData": "platform",
        "mRender": "[, ]"
      },
      {
        "mRender": function(data, type, full){
          if(type==="filter" && parseInt(data, 10) > 3){
            return "zhaohs";
          }else if(type=='display' && parseInt(data, 10) > 3){
            return "<b>" + data + "</b>";
          }else{
            return '<a href="'+data+'">Download</a>';
          }
        }
      },
      null
    ]
  });
}

function initDataTable1c(){
  $("#table1").dataTable({
    bLengthChange: false,
    iDisplayLength: 10,
    bAutoWidth: false,
    bSort: true,
    "aoColumns": [
      { "mData": "engine", "sWidth": "20%" },
      { "mData": "browser", "sWidth": "20%" },
      {
        "sClass": "longTd",
        "mData": "platform",
        "mRender": "[, ]",
        "sWidth": "20%"
      },
      {
        "sWidth": "20%",
        "mRender": function(data, type, full){
          if(type==="filter" && parseInt(data, 10) > 3){
            return "zhaohs";
          }else if(type=='display' && parseInt(data, 10) > 3){
            return "<b>" + data + "</b>";
          }else{
            return '<a href="'+data+'">Download</a>';
          }
        }
      },
      {
        "sWidth": "20%"
      }
    ]
  });
  $("#table1").css("table-layout", "fixed");
}