var request = require('request');
var harJson = require("./har.json");
var iconv = require('iconv-lite');
var fs = require("fs");

function getRequestsFromHar() {
    var entries = harJson.log.entries;
    var urlReg = /https:\/\/advs.*?cgi(?!&)/;
    var requests = [];
    entries.forEach(function(entry) {
        var request = entry.request;
        var url = request.url;
        if (urlReg.test(url)) {
            requests.push(request);
        }
    });
    return requests;
}

function test1(har){
    var bufferArr = [];
    request({
        har: har
    }).on("data", function(chunk){
        bufferArr.push(chunk);
    }).on("end", function(){
        var ebody = iconv.decode(Buffer.concat(bufferArr), "Shift_JIS");
        console.log(ebody);
    });
}

function test2(har){
    request({
        har: har
    }).on("error", function(err){
        console.log(err);
    }).pipe(iconv.decodeStream("Shift_JIS", function(err, body){
        console.log(body);
    }));
}

var requests = getRequestsFromHar();
var r = requests[0];
test1(r);
//test2(r);


//request({
//    har: r
//}).pipe(fs.createWriteStream('aa.txt'));

//request({
//    har: r
//})
//.pipe(iconv.decodeStream("Shift_JIS"))
//.pipe(iconv.encodeStream("utf8"))
//.pipe(fs.createWriteStream('aa.txt'));