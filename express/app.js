// to user supervisor, run the following
// npm install supervisor -g

var express = require("express");
var path = require("path");
var fs = require("fs");
var async = require('async');
var Deferred = require("Deferred");
var db = require("mongoskin").db('mongodb://localhost:27017/monolith');
// require get db schema (local package)
var mysqlSchema = require("../api/db_schema.js")

var app = express();

app.use(express.logger());
app.use(express.static(__dirname, "/public"));
app.use(express.bodyParser());

app.get("/api/mysqlschema", function(req, res){
    var jsonpFlg = req.query.callback;
    mysqlSchema.run(function(result){
        var ret = JSON.stringify(result);
        ret = jsonpFlg ? wrapForJsonp(ret) : ret;
        res.send(ret);
    });
});
function wrapForJsonp(jsonStr){
    var jsonpMethodName = "jsonCallback";
    return jsonpMethodName + "(" + jsonStr + ")";
}

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
  console.log("---- begin ----");
  console.log(req.query);
  console.log("----- end -----");

  // sort
  var sortArr = getSortArray(req.query);

  db.collection("person").find({},{sort: sortArr}).toArray(function(err, result){
    if(err) throw err;

    // search
    var searchKey = req.query.sSearch;
    var searchResult = filterBySearch(result, searchKey);

    // pagination
    var offset = parseInt(req.query.iDisplayStart,10);
    var limit = parseInt(req.query.iDisplayLength,10);

    var ret = {
      iTotalRecords: result.length,
      iTotalDisplayRecords: searchResult.length,
      sEcho: parseInt(req.query.sEcho,10),
      aaData: searchResult.slice(offset, offset + limit)
    }
    res.json(ret);
  });
});

function filterBySearch(result, searchKey){
  return result.filter(function(record){
    for(var key in record){
      if(key.indexOf("_") == 0){
        continue;
      }
      if(record[key] != null && (record[key] + "").indexOf(searchKey) != -1){
        return true;
      }
    }
    return false;
  });
}

function getSortArray(params){
  var retArr = [];
  if(params['iSortCol_0']){
    var sortColumnNumber = parseInt(params['iSortingCols'],10);
    for(var i = 0; i< sortColumnNumber; i++){
      var sortColName = params["mDataProp_" + params['iSortCol_' + i]];
      var sortDir = params['sSortDir_' + i];
      retArr.push([sortColName, sortDir]);
    }
  }
  return retArr;
}

app.listen(3000);
console.log("start at 3000 ...");