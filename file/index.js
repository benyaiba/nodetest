var fs = require("fs");
var walk = require("walk");
var path = require("path")

function addZero(i){
	var len = (i + "").length;
	while(len < 3){
		i = "0" + i;
		len++;
	}
	return i;
}

var PATH = "./testfiles"
var walker = walk.walk(PATH, {});

var i = 1;
walker.on("file", function(root, fstat, next){
	var oldName = fstat.name;
	var newName = addZero(i) + "_" + oldName
	var fullPathOld = path.join(root, oldName);
	var fullPathNew = path.join(root, newName);
	console.log(fullPathOld, fullPathNew);
	fs.rename(fullPathOld, fullPathNew);
	i++;
	next();
});