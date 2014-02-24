var fs = require("fs");
var walk = require("walk");
var path = require("path");

var excelReporter = require("./excelreport");

var Path = __dirname + "/mads";
var walker = walk.walk(Path, {});

var i = 0;
walker.on("file", function(root, fstat, next){
	//console.log(root, fstat);
	var extName = path.extname(fstat.name);
	//console.log(fstat.name,extName);

	if([".xls",".xlsx", ".ods"].indexOf(extName) != -1){
		var promise = excelReporter.getExcelReport(path.join(root, fstat.name));
		promise.done(next);
	}else{
		next();
	}
	
})