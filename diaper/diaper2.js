var request = require('request');
var harJson = require("./har.json");

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

request({
    har: r
}, function(err, response, body) {
    if (err) {
        cosole.log("err:", err);
    }else{
        if(body.indexOf("エラー") != -1){
            console.log("e ....");
        }else{
            console.log("s ...");
        }
    }
});