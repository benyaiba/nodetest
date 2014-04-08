var async = require('async');
var Deferred = require("Deferred");
var db = require("mongoskin").db('mongodb://localhost:27017/monolith');

function insertRecords(){
  var dfd = new Deferred();
  // first, last, age
  // first [zhao,qian, sun, li] + [1-9]
  // last [111 - 999]
  // age [10-30]
  
  var firstArr = ["zhao", "qian", "sun", "li"];
  var lastArr = [];
  for(var i = 111; i< 999; i++){
    lastArr.push(i);
  }
  async.eachSeries(lastArr, function(last, next){
    var firstIndex = parseInt(Math.random() * 4, 10);
    var first = firstArr[firstIndex];
    var age = 0;
    while(age < 10){
      age = parseInt(Math.random() * 30, 10) + 1;
    }
    var personObj = {
      first: first,
      last:last,
      age: age
    };
    db.collection("person").insert(personObj, function(err, result){
      if(err) throw err;
      if(result){
        console.log("insert one .");
        next();
      }
    });
  }, function(err){
    dfd.resolve();
  });
  return dfd.promise();
}

insertRecords().done(function(){
  db.collection("person").count(function(err, result){
    console.log("total:" + result);
  });
});

