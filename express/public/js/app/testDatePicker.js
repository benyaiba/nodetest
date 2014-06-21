function testDatePickerInit(){
	$("#dp1").datepicker();
	
//	$("#dp2").multiDatesPicker({
//		dateFormat: "yy-mm-dd"
//	});

	$("#dp3").datepick({
		dateFormat: "yyyy-mm-dd",
		multiSelect:100
	});
    $("#btn1").datepick({
        dateFormat: "yyyy-mm-dd",
        multiSelect: 100,
        multiSeparator: " ",
        altField: $("#dateOutput"),
        onSelect: function(){
//            $("#btn1").val("select ...");
            $("#dateOutput").html($("#dateOutput").val());
        }
    });
}
