var request = require('request');
var harJson = require("./har.json");
var iconv = require('iconv-lite');
var fs = require("fs");
var harrequest = require("./harrequest");

var charset = "Shift_JIS";

function getRequestsFromHar() {
    var entries = harJson.log.entries;
    var urlReg = /https:\/\/aksale.advs.*?reg_form\.cgi\?id=/;
    var urlReg2 = /https:\/\/aksale.advs.*?cgi(?!&)/;
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
    fs.createWriteStream("har_v.json").write(JSON.stringify(requests, null, 4));
}

var requests = getRequestsFromHar();
outputValidHars(requests);

