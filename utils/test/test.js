var fs = require("fs");
var walk = require("walk");
var path = require("path");
var async = require("async");

var fpath = path.join(__dirname, "tfiles");

function getResultArr(callback) {

    var resultArr = [];
    walker = walk.walk(fpath, {});
    walker.on("file", function(root, fileStat, next) {
        if (fileStat.name.match(new RegExp("Impl"))) {
            resultArr.push([ fileStat.size, fileStat.name ]);
        }
        next();
    });

    walker.on("end", function(err) {
        console.log("file walk all done");
        callback(err, resultArr);
    });
}

function sort(resultArr, callback){
    resultArr.sort(function(a,b){
        var aint = parseInt(a[0],10);
        var bint = parseInt(b[0],10);
        return aint - bint;
    });
    callback(null,resultArr);
}

function output(resultArr, callback){
    resultArr.forEach(function(item){
        console.log(item);
    });
    callback(null, resultArr);
}

function writeFile(resultArr, callback){
    var p = path.join(fpath, "result111.txt");
    var content = "";
    resultArr.forEach(function(item){
        content += item[0];
        content += " ";
        content += item[1];
        content += "\r\n";
    })
    fs.writeFile(p, content, function(err){
        callback(err);
    });
}

async.waterfall([getResultArr, sort,  output], function(err){
    if(err){
        console.log("error !!", err);
    }else{
        console.log("all done......");
    }
});