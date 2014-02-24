var fs = require("fs");
var walk = require("walk");
var path = require("path")

//var PATH = "./testfiles";
var PATH = "D:\\workspace\\digitalSignage.git\\digitalSignage\\src"
var walker = walk.walk(PATH, {});

walker.on("directories", function(root, dirStatsArray, next){
	console.log("---");
	dirStatsArray.forEach(function(s){
		console.log(path.join(root, s.name));
	})
	next();
})