var request = require('request');
var harJson = require("./har.json");
var iconv = require('iconv-lite');
var fs = require("fs");
var harrequest = require("./harrequest");

var charset = "Shift_JIS";

function getRequestsFromHar() {
    var entries = harJson.log.entries;
    var urlReg = /https:\/\/advs.*?reg\?id=/;
    var urlReg2 = /https:\/\/advs.*?cgi(?!&)/;
    var requests = [];
    entries.forEach(function(entry) {
        var request = entry.request;
        var url = request.url;
        if (urlReg.test(url) || urlReg2.test(url)) {
            requests.push(request);
        }
    });
    return requests;
}

function outputValidHars(requests){
    fs.createWriteStream("v_har.json").write(JSON.stringify(requests, null, 4));
}

var requests = getRequestsFromHar();
outputValidHars(requests);

var r = requests[0];
console.log(r.url);

harrequest(r, function(response){
    var cookieArr = response.headers["set-cookie"];
    var cookie = null;
    cookieArr.forEach(function(cookieItem){
        if(cookieItem.indexOf("sess") != -1){
            cookie = cookieItem;
        }
    });
    var regExp = new RegExp("sess=(.*?);");
    var result = regExp.exec(cookie);
    var sess = result[1];
    console.log(sess);
},function(response){
//    console.log(response);
}, charset);