$(function() {
	console.log("ready ...");
	initDataTable();
	$("#newBtn").on("click", function(){
		$("#testDialog").modal("show");
		$("#testDialog .modal-footer .btn").off("click").on("click", function(){
			$("#testDialog").modal("hide");
		});
	});
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