var express = require("express");
var path = require("path");

var app = express();

app.use(express.logger());
app.use(express.static(__dirname, "/public"));
app.use(express.bodyParser());

app.get("/user/:name", function(req, res){
	var name = req.params.name;
	var passwordInfo = require(__dirname + "/data/pass/" + name);
	res.json(passwordInfo);
});

app.post("/user", function(req, res){
	var name = req.body.userName;
	var age = req.body.userAge;
  var user = req.body.user;
  console.log(req.body);
  console.log("name ", name, "age", age , "-- user",user, "-- json", req.body);
  res.json({result: "good!"});
});

app.post("/user2", function(req, res){
  console.log("---- ", req.body);
});

app.listen(3000);
console.log("start at 3000 ...");