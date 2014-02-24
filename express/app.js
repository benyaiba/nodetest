var express = require("express");
var path = require("path");

var app = express();

app.use(express.logger());
app.use(express.static(__dirname, "/public"));

app.get("/user/:name", function(req, res){
	var name = req.params.name;
	var passwordInfo = require(__dirname + "/data/pass/" + name);
	res.json(passwordInfo);
});

app.listen(3000);
console.log("start at 3000 ...");