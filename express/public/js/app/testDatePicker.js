function testDatePickerInit(){
	$("#dp1").datepicker();
	
//	$("#dp2").multiDatesPicker({
//		dateFormat: "yy-mm-dd"
//	});

	$("#dp3").datepick({
		dateFormat: "yyyy-mm-dd",
		multiSelect:100
	});
	
	$("#dateOutput").popover({
	    trigger: "hover",
	    content: function(){
	        return $("#dateOutput").val();
	    }
	});
    $("#btn1").datepick({
        dateFormat: "yyyy/mm/dd",
        minDate: new Date(),
        multiSelect: 100,
        multiSeparator: " ",
        altField: $("#dateOutput"),
        onSelect: function(){
            $("#dateOutput").html($("#dateOutput").val());
        }
    });
}
