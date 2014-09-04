var mysync = require("mysync");
var Deferred = require("Deferred");

var name = "zhaohs";

function f1(str){
    var dfd = new Deferred();
    setTimeout(function(){
        {
            console.log("111 " + str);
            dfd.resolve("a");
        }
    },2000);
    return dfd.promise();
}
function f2(str){
    var dfd = new Deferred();
    setTimeout(function(){
        {
            console.log("222 " + str + " " + name);
            dfd.resolve("b");
        }
    },1000);
    return dfd.promise();
}
function f3(str){
    var dfd = new Deferred();
    setTimeout(function(){
        {
            console.log("333 " + str);
            dfd.resolve("c");
        }
    },500);
    return dfd.promise();
}

mysync.syncRun(f1, f2, f3);