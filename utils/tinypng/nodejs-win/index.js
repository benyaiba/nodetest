// require nodejs modules
var path = require("path");

// require app modules
var converter = require("./converter.js");
var fileIterater = require("./fileIterator");

// commnad line params
var paramPath = process.argv[2] == "false" ? false : process.argv[2];
var overwriteFlg = process.argv[3] == "true" ? true : false;
var recursiveFlg = process.argv[4] == "true" ? true : false;

// convert use path and keys
var key = "dxSMzbAhIIFI4oD3pKWzNuWY9l-eHTwE";
var imagePath = paramPath || "C:\\gitRepository\\blade_manage\\WebContent\\images";

/**
 * main convert method
 */
var doConvert = function(xx, paths) {
	for ( var i = 0; i < paths.length; i++) {
		// prepare convert paths
		var fullPath = paths[i];
		var fileBasename = path.basename(fullPath);
		var inputFilePath = fullPath;
		var outputFilePath = fullPath.replace(fileBasename, fileBasename + ".tiny.png");
		// do convert for each png file
		converter.convertOne(key, inputFilePath, outputFilePath, overwriteFlg);
	}
	console.log("done ... , totle file numbers : " + paths.length);
}

// find all need convert files and do convert in the callback "doConvert"
var filePaths = fileIterater.walk(imagePath, doConvert, recursiveFlg);