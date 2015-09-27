var walk = require("walk");
var fs = require("fs");
var path = require("path");

var s1= "http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js";
var d1 = "http://code.jquery.com/jquery-1.9.1.min.js";

var s2 = "http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.0/jquery-ui.min.js";
var d2 = "http://code.jquery.com/ui/1.10.0/jquery-ui.min.js";

var s3 = "http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.0/themes/smoothness/jquery-ui.css";
var d3 = "http://code.jquery.com/ui/1.10.0/themes/smoothness/jquery-ui.css"

var PATH = "C:\\Users\\Lenovo\\Downloads\\dist\\examples";
var walker = walk.walk(PATH, {
    followLinks : false
});
walker.on("file", fileHandler);
function fileHandler(root, fileStat, next) {
    var fullPath = path.join(root, fileStat.name);
    fs.readFile(fullPath, function(err, data) {

        data = data.toString().replace(new RegExp(s1, "g"), d1);
        data = data.replace(new RegExp(s2, "g"), d2);
        data = data.replace(new RegExp(s3, "g"), d3);

        fs.writeFile(fullPath, data, function() {
            next();
        })
    });
}
walker.on("end", function(){
    console.log("end");
});
