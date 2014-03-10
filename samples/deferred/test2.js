var Deferred = require("Deferred");
var when = Deferred.when;


function doIt(){
  var dfd = new Deferred();
  setTimeout(function(){
    dfd.resolve("and");
    return 1;
  },1000);
  return dfd.promise();
}

//var ret = null;
when(doIt()).done(function(n){
  console.log("done ...", n, arguments);
});
//ret = doIt();