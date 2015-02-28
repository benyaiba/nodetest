var http = require("http");
var cheerio = require('cheerio');
var querystring = require('querystring');
var async = require("async");

Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


/* PRODUCT */
//var HOST_IP = "192.168.196.211";
//var PORT = 80;
//var USER_NAME = "zhao_hongsheng";
//var PASS = "zhao_hongsheng";

/* TEST */
var HOST_IP = "192.168.196.203";
var PORT = 8304;
var USER_NAME = "yanglf1";
var PASS = "1";

function getLoginPage(next) {
//    console.log("-- get login page --");

    var options = {
            hostname: HOST_IP,
            port: PORT,
            path: "/Users/login",
            method: "GET"
    };

    var req = http.request(options, function(res) {
        // debugResponse(res);

        // get php code from header
        var headerStr = JSON.stringify(res.headers);
        var phpCode = getStrByReg(headerStr, "CAKEPHP=.*?(?=;)") || "";

        // get token from html body
        var htmlContent = "";
        var token = "";
        res.setEncoding("utf8");
        res.on("data", function(chunk) {
            htmlContent = chunk;
        });
        res.on("end", function() {
            var $ = cheerio.load(htmlContent);
            token = $("input[name='data[_Token][key]']").val();
            next(null, phpCode, token);
        });
    });
    req.end();
}

function login(phpCode, token, next) {
//    console.log("-- login --");
//    console.log(phpCode);

    var postData = querystring.stringify({
        "data[_Token][key]": token,
        "data[Account][name]": USER_NAME,
        "data[Account][password]": PASS,
        "data[Account][recall]": "0",
    });

    var options = {
        hostname: HOST_IP,
        port: PORT,
        path: "/Users/login",
        method: "POST",
        headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "ja,en;q=0.8,en-US;q=0.6,zh-CN;q=0.4,zh;q=0.2,ko;q=0.2",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Length": postData.length,
            "Content-Type": "application/x-www-form-urlencoded",
            "Cookie": phpCode,
            "Host": HOST_IP,
            "Origin": "http://" + HOST_IP,
            "Pragma": "no-cache",
            "Referer": "http://" + HOST_IP + "/Users/login",
            "User-Agent": "Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36"
        }
    };

    var req = http.request(options, function(res) {
//        debugResponse(res);

        // get php code from header
        var headerStr = JSON.stringify(res.headers);
        var phpCode = getStrByReg(headerStr, "CAKEPHP=.*?(?=;)") || "";

        res.setEncoding("utf8");
        res.on("data", function(){
        });
        res.on("end", function() {
            next(null, phpCode, token);
        });
    });

    req.write(postData);
    req.end();
}

function getCardPage(phpCode, token, next) {
//    console.log("-- getCardPage --");
//    console.log(phpCode);

    var options = {
        hostname: HOST_IP,
        port: PORT,
        path: "/AttendanceManagement/personalAttendanceSearch",
        method: "GET",
        headers: {
            "Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Encoding":"gzip, deflate, sdch",
            "Accept-Language":"ja,en;q=0.8,en-US;q=0.6,zh-CN;q=0.4,zh;q=0.2,ko;q=0.2",
            "Cache-Control":"no-cache",
            "Connection":"keep-alive",
            "Cookie":phpCode,
            "Host":HOST_IP,
            "Pragma":"no-cache",
            "Referer":"http://"+ HOST_IP+ "/",
            "User-Agent":"Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36"
        }
    };

    var req = http.request(options, function(res) {
//        debugResponse(res);

        // get php code from header
        var headerStr = JSON.stringify(res.headers);
        var phpCode = getStrByReg(headerStr, "CAKEPHP=.*?(?=;)") || "";

        res.setEncoding("utf8");
        var htmlContent = "";
        res.on("data", function(chunk) {
            htmlContent = chunk;
        });
        res.on("end", function() {
            var $ = cheerio.load(htmlContent);
            var records = $(".Bug_table tr");
            checkCard(records, $);
            next(null, phpCode, token);
        });
    });

    req.end();
}

function checkCard(trs, $){

    for(var i=0;i< trs.length; i++){
        var trItem = trs[i];
        var userName = trim($("td:nth-child(1)", trItem).text());
        var date = trim($("td:nth-child(2)", trItem).text());
        var begin = trim($("td:nth-child(3)", trItem).text());
        var end = trim($("td:nth-child(4)", trItem).text());
        var otBegin = trim($("td:nth-child(5)", trItem).text());
        var otEnd = trim($("td:nth-child(6)", trItem).text());

        var yesterday = getYesterday().Format("yyyy-MM-dd");
        if(date != yesterday){
            continue;
        }else{

        }
    }
}

function isInRange(date, start, end){
    var sh = start.split(":")[0];
    var sm = start.split(":")[1];
    var eh = end.split(":")[0];
    var em = end.split(":")[1];

    var startDate = getYesterday();
    startDate.setHours(parseInt(sh, 10));
    startDate.setMinutes(parseInt(sm, 10));
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);

    var endDate = getYesterday();
    endDate.setHours(parseInt(eh, 10));
    endDate.setMinutes(parseInt(em, 10));
    endDate.setSeconds(0);
    endDate.setMilliseconds(0);

    if(date.getTime() > endDate.getTime()){
        return false;
    }
    if(date.getTime() < startDate.getTime()){
        return false;
    }
    return true;

}

function getYesterday(){
    var today = new Date();
    var yTime = today.getTime() - 24 * 60 * 60 * 1000;
    return new Date(yTime);
}

function trim(str){
    if(!str){
        return "";
    }
    return str.replace(new RegExp("\\r\\n|\\n|\\s","g"),"");
}

function debugResponse(res) {
    console.log("---- debug begin ---");
    console.log("STATUS: " + res.statusCode);
    console.log("HEADERS: " + JSON.stringify(res.headers));
    res.on("data", function(chunk) {
        console.log(chunk);
    });
    res.on("end", function() {
        console.log("---- debug end ---");
    });
}

function getStrByReg(str, reg) {
    var regExp = new RegExp(reg,"g");
    var result = str.match(regExp);
    if (result != null) {
        return result[result.length-1];
    } else {
        return null;
    }
}

async.waterfall([ getLoginPage, login, getCardPage ], function(err) {
    if (err) {
        console.log("err -- ", err);
    } else {
        console.log("done ...");
    }
});
