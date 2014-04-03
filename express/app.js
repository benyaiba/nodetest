var express = require("express");
var path = require("path");
var fs = require("fs");
var async = require('async');
var Deferred = require("Deferred");
var db = require("mongoskin").db('mongodb://localhost:27017/monolith');

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

app.post("/imgUpload", function(req, res){
  console.log("---- ", req.files);
  console.log("---- ", req.body);
  
  var filePath = path.join("c:", "tmp", "tubiao.jpg");
  fs.readFile(filePath, function(err, data){
    if (err) {
    	console.log("err!!!", err)
    }else{
      res.json({result: data.toString("base64")});
    }
  });
});

app.get("/person", function(req, res){
  db.collection("person").find().toArray(function(err, result){
    if(err) throw err;
    var resultArr = [];
    result.forEach(function(item){
      resultArr.push([item.first, item.last, item.age]);
    });
    var ret = {
      iTotalRecords: result.length,
      iTotalDisplayRecords: 10,
      sEcho: 10,
      aaData: resultArr
    }
    res.json(ret);
  });
});

app.listen(3000);
console.log("start at 3000 ...");