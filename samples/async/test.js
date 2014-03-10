var async = require("async");

var arr = ['a','b','c'];
async.each(arr, function(item, next){
  setTimeout(function(){
    console.log(" -- ", item, arguments);
    next();
  },2000);

}, function(err){
  console.log(" -- err", err);
});