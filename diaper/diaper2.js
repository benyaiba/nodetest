var request = require('request');
var harJson = require("./har.json");

//console.log(harJson);
//console.log(harJson.log.entries);
function getRequestsFromHar(){
    var entries = harJson.log.entries;
    var urlReg = /https:\/\/advs.*?cgi(?!&)/;
    var requests = [];
    entries.forEach(function(entry){
        var request = entry.request;
        var url = request.url;
//        console.log(url, urlReg.test(url));
        if(urlReg.test(url)){
            requests.push(request);
        }
    });
//    requests.forEach(function(r){
//        console.log(r.url);
//    });
}

getRequestsFromHar();