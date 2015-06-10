var request = require('request');
var harJson = require("./har.json");
var iconv = require('iconv-lite');
var fs = require("fs");

// console.log(harJson);
// console.log(harJson.log.entries);
function getRequestsFromHar() {
    var entries = harJson.log.entries;
    var urlReg = /https:\/\/advs.*?cgi(?!&)/;
    var requests = [];
    entries.forEach(function(entry) {
        var request = entry.request;
        var url = request.url;
        // console.log(url, urlReg.test(url));
        if (urlReg.test(url)) {
            requests.push(request);
        }
    });
    // requests.forEach(function(r){
    // console.log(r.url);
    // });
    return requests;
}

var requests = getRequestsFromHar();
var r = requests[0];

var ebody = "";
request({
    har: r
}, function(err, response, body) {
    if (err) {
        cosole.log("err:", err);
    }else{
//        var buf = iconv.decode(body, "Shift_JIS");
//        var rb = iconv.encode(buf, "utf8");
//        console.log(rb);
    }
}).on("data", function(chunk){
    ebody += chunk;
}).on("end", function(){
    ebody = iconv.decode(ebody, "Shift_JIS");
    console.log(ebody);
});

//request({
//    har: r
//}).pipe(fs.createWriteStream('aa.txt'));

//request({
//    har: r
//})
//.pipe(iconv.decodeStream("Shift_JIS"))
//.pipe(iconv.encodeStream("utf8"))
//.pipe(fs.createWriteStream('aa.txt'));