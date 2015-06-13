var harJsonMail = require("./har_mail.json");
var harJsonOrder = require("./har_order.json");
var iconv = require('iconv-lite');
var fs = require("fs");

var charset = "Shift_JIS";

function getMailRequests() {
    var entries = harJsonMail.log.entries;
    var urlReg = /https?:\/\/aksale.*?cgi/;
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

function getOrderRequests() {
    var entries = harJsonOrder.log.entries;
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

function getRequestsFromHar() {
    var requests = getMailRequests().concat(getOrderRequests());
    requests = JSON.parse(decodeUrl(JSON.stringify(requests)));
    requests = limitRequestParams(requests);
    return requests;
}

function limitRequestParams(requests){
    var retrunRequests = [];
    var req = null;
    var i = 0;
    requests.forEach(function(requestItem){
        req = new Object();
        req.index = i;
        // method
        req.method = requestItem.method;
        // url
        req.url = requestItem.url;
        // header
        var headers = requestItem.headers;
        headers = deleteContentLengthFromHeader(headers);
        req.headers = headers;
        // postData
        req.postData = requestItem.postData;
        
        retrunRequests.push(req);
        i++;
    });
    return retrunRequests;
}

function deleteContentLengthFromHeader(headers){
    var contentLengthIndex = null;
    for(var i =0;i< headers.length ;i++){
        var header = headers[i];
        if(header.name=="Content-Length"){
            contentLengthIndex =  i;
            break;
        }
    }
    if(contentLengthIndex){
        headers.splice(contentLengthIndex, contentLengthIndex + 1);
    }
    return headers;
}

function decodeUrl(str) {
    str = str.replace(/%([a-zA-Z0-9]{2})/g, function(_, code) {
        return String.fromCharCode(parseInt(code, 16));
    });
    var buff = new Buffer(str, 'binary');
    var result = iconv.decode(buff, charset);
    return result;
}

function outputValidHars(requests) {
    fs.createWriteStream("har_v.json").write(JSON.stringify(requests, null, 4));
}

var requests = getRequestsFromHar();
outputValidHars(requests);
