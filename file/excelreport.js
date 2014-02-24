var excelParser = require('excel-parser');
var Deferred = require("Deferred");

var kbn = ["正常","準正常","異常"];
var result = {};
var allCount = 0;

function resultToString(result){
	var ret = "";
	for(var i=0;i< kbn.length; i++){
		var value = result[kbn[i]];
		ret += (value == undefined ? 0 : value) + ","
	}
	return ret;
}

function addToKbn(lineArr) {
	for (var i = 0; i < lineArr.length; i++) {
		var kbnIndex = kbn.indexOf(lineArr[i]);
		if (kbnIndex != -1) {
			allCount++;
			if (result[kbn[kbnIndex]] == undefined) {
				result[kbn[kbnIndex]] = 1;
			} else {
				result[kbn[kbnIndex]] = result[kbn[kbnIndex]] + 1;
				break;
			}
		}
	}
}

function getExcelReport(path) {
	var dfd = new Deferred();
	result = {};
	allCount = 0;
	excelParser.parse({
		inFile: path,
		worksheet: 1,
		skipEmpty: true
	},
	function(err, records) {
		if (err) console.error(err);
		records.forEach(function(item) {
			if (item.length != 1 && /\d+/.test(item[0])) {
				addToKbn(item);
			}
		});
		console.log(path, ",",resultToString(result), allCount);
		dfd.resolve();
	});
	return dfd.promise();
}

// for test
//var Path = __dirname + "/mads/aaa.xlsx";
//getExcelReport(Path);

exports.getExcelReport = getExcelReport;