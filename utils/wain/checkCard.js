var http = require("http");
var cheerio = require("cheerio");
var querystring = require("querystring");
var async = require("async");
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");

var users = require("./userlist").users;

var allMessages = [];
var okStatus = true;
var SEND_MAIL_FLAG = true;
var USER_NAME = "zhao_hongsheng";
var PASS = "zhao_hongsheng";

/* PRODUCT */
var HOST_IP = "192.168.196.211";
var PORT = 80;

/* TEST */
// var HOST_IP = "192.168.196.203";
// var PORT = 8304;
function getLoginPage(next) {
    // console.log("-- get login page --");

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
    // console.log("-- login --");
    // console.log(phpCode);

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
        // debugResponse(res);

        // get php code from header
        var headerStr = JSON.stringify(res.headers);
        var phpCode = getStrByReg(headerStr, "CAKEPHP=.*?(?=;)") || "";

        res.setEncoding("utf8");
        res.on("data", function() {
        });
        res.on("end", function() {
            next(null, phpCode, token);
        });
    });

    req.write(postData);
    req.end();
}

function getCardPage(phpCode, token, next) {
    // console.log("-- getCardPage --");
    // console.log(phpCode);

    var options = {
        hostname: HOST_IP,
        port: PORT,
        path: "/AttendanceManagement/personalAttendanceSearch",
        method: "GET",
        headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate, sdch",
            "Accept-Language": "ja,en;q=0.8,en-US;q=0.6,zh-CN;q=0.4,zh;q=0.2,ko;q=0.2",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Cookie": phpCode,
            "Host": HOST_IP,
            "Pragma": "no-cache",
            "Referer": "http://" + HOST_IP + "/",
            "User-Agent": "Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36"
        }
    };

    var req = http.request(options, function(res) {
        // debugResponse(res);

        // get php code from header
        // var headerStr = JSON.stringify(res.headers);
        // var phpCode = getStrByReg(headerStr, "CAKEPHP=.*?(?=;)") || "";

        res.setEncoding("utf8");
        var htmlContent = "";
        res.on("data", function(chunk) {
            htmlContent = chunk;
        });
        res.on("end", function() {
            var $ = cheerio.load(htmlContent);
            var records = $(".Bug_table tr");
            var checkResult = checkCard(records, $);
            if (!records || records.length == 0) {
                // 无法取得签到信息，密码错误？
                allMessages.push(USER_NAME + " : 签到信息无法取得");
                okStatus = false;
            }
            if (checkResult != null) {
                // 存在异常的签到信息。
                allMessages.push(USER_NAME + " " + checkResult);
                okStatus = false;
            }
            next(null, checkResult);
        });
    });

    req.end();
}

function sendMail(checkResult, next) {
    if (!checkResult) {
        next(null);
        return;
    }

    doSendMail({
        to: USER_NAME + "@microad-tech.com",
        subject: "异常签到记录",
        text: checkResult
    }, next);
    next(null);
}

function sendSummaryMailToAdmin() {
    doSendMail({
        to: "zhao_hongsheng@microad-tech.com",
        subject: "【Summary】签到报告 (ADMIN)",
        text: allMessages.join("\r\n")
    });
}

function sendErrorMailToAdmin(e) {
    doSendMail({
        to: "zhao_hongsheng@microad-tech.com",
        subject: "【Exception】异常签到Batch (ADMIN)",
        text: e
    });
}

function doSendMail(params) {
    if (SEND_MAIL_FLAG == false) {
        return;
    }
    var transporter = nodemailer.createTransport(smtpTransport({
        // debug: true
        // host: "192.168.196.6",
        // port: 25
        host: "smtp.163.com",
        secure: true,
        port: 465,
        auth: {
            user: "yisuren2@163.com",
            pass: "801b95"
        },
    }));
    transporter.sendMail({
        from: "yisuren2@163.com",
        to: params.to,
        subject: params.subject,
        text: params.text
    }, function(err) {
        if (err) {
            console.log("--- mail err", err);
        }
    });
}

function checkCard(trs, $) {
    if (!trs || trs.length == 0) {
        return null;
    }
    var errorMsgArr = [];
    var yesterdayStr = getYesterday().format("yyyy-MM-dd");
    var yesterday = getYesterday();
    for (var i = 0; i < trs.length; i++) {
        var trItem = trs[i];
        var dateStr = trim($("td:nth-child(2)", trItem).text());
        var begin = trim($("td:nth-child(3)", trItem).text());
        var end = trim($("td:nth-child(4)", trItem).text());
        var otBegin = trim($("td:nth-child(5)", trItem).text());
        var otEnd = trim($("td:nth-child(6)", trItem).text());

        if (dateStr != yesterdayStr) {
            continue;
        } else {
            var beginDate = getYesterday(begin);
            if (begin == "-" || !isInRange(beginDate, "07:30", "08:30")) {
                var errMsg = "异常的上班签到时间 ：%s".format(begin);
                errorMsgArr.push(errMsg);
            }
            var endDate = getYesterday(end);
            if (end == "-" || !isInRange(endDate, "17:00", "17:30")) {
                var errMsg = "异常的下班签退时间 ：%s".format(end);
                errorMsgArr.push(errMsg);
            }
            var otBeginDate = getYesterday(otBegin);
            if (otBegin != "-" && !isInRange(otBeginDate, "17:30", "19:00")) {
                var errMsg = "异常的加班签到时间 ：%s".format(otBegin);
                errorMsgArr.push(errMsg);
            }
            if ((otBegin != "-" && otEnd == "-") || (otBegin == "-" && otEnd != "-")) {
                var errMsg = "异常的加班签到/签退时间：%s".format("缺少时间");
                errorMsgArr.push(errMsg);
            }
            if (otBegin != "-" && otEnd != "-") {
                var otBeginDate = getYesterday(otBegin);
                if(otBeginDate.getTime() < getYesterday("18:00").getTime()){
                    otBeginDate = getYesterday("18:00");
                }
                var otEndDate = getYesterday(otEnd);
                var hour3 = 3 * 60 * 60 * 1000;
                var overtime = otEndDate.getTime() - otBeginDate.getTime();
                if (overtime < hour3) {
                    var tmpDateTime = Date.parse("2015-01-01 00:00");
                    tmpDateTime += overtime;
                    var overTimeStr = new Date(tmpDateTime).format("hh小时:mm分");
                    var errMsg = "异常加班时间 ： 加班时间为 %s， 不足3小时，请确认".format(overTimeStr);
                    errorMsgArr.push(errMsg);
                }
            }
        }
    }
    if (errorMsgArr.length == 0) {
        return null;
    } else {
        errorMsgArr.unshift("%s (%s)".format(yesterdayStr, yesterday.weekDay()));
        return errorMsgArr.join("\r\n");
    }
}

function isInRange(date, start, end) {
    var sh = start.split(":")[0];
    var sm = start.split(":")[1];
    var eh = end.split(":")[0];
    var em = end.split(":")[1];
    var time = date.getTime();

    var startDate = new Date(time);
    startDate.setHours(parseInt(sh, 10));
    startDate.setMinutes(parseInt(sm, 10));
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);

    var endDate = new Date(time);
    endDate.setHours(parseInt(eh, 10));
    endDate.setMinutes(parseInt(em, 10));
    endDate.setSeconds(0);
    endDate.setMilliseconds(0);

    if (date.getTime() > endDate.getTime()) {
        return false;
    }
    if (date.getTime() < startDate.getTime()) {
        return false;
    }
    return true;

}

function getYesterday(hm) {
    var today = new Date();
    today.setSeconds(0);
    today.setMilliseconds(0);
    if (hm) {
        var h = hm.split(":")[0];
        var m = hm.split(":")[1];
        today.setHours(parseInt(h, 10));
        today.setMinutes(parseInt(m, 10));
    }
    var yTime = today.getTime() - 24 * 60 * 60 * 1000;
    return new Date(yTime);
}

function trim(str) {
    if (!str) {
        return "";
    }
    return str.replace(new RegExp("\\r\\n|\\n|\\s", "g"), "");
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
    var regExp = new RegExp(reg, "g");
    var result = str.match(regExp);
    if (result != null) {
        return result[result.length - 1];
    } else {
        return null;
    }
}

Date.prototype.format = function(fmt) { // author: meizz
    var o = {
        "M+": this.getMonth() + 1, // 月份
        "d+": this.getDate(), // 日
        "h+": this.getHours(), // 小时
        "m+": this.getMinutes(), // 分
        "s+": this.getSeconds(), // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
        "S": this.getMilliseconds()
    // 毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for ( var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

Date.prototype.weekDay = function() {
    var d = this;
    var week = "";
    if (d.getDay() == 0)
        week = "日";
    if (d.getDay() == 1)
        week = "一";
    if (d.getDay() == 2)
        week = "二";
    if (d.getDay() == 3)
        week = "三";
    if (d.getDay() == 4)
        week = "四";
    if (d.getDay() == 5)
        week = "五";
    if (d.getDay() == 6)
        week = "六";
    return week;
};

String.prototype.format = function() {
    var args = Array.prototype.slice.call(arguments);
    var value = this;
    for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        value = value.replace("%s", arg);
    }
    return value;
};

function checkOneUser(next) {
    async.waterfall([ getLoginPage, login, getCardPage, sendMail ], function(err) {
        if (err) {
            console.log("err -- ", err);
        } else {
            console.log(USER_NAME, "done ...");
            if (okStatus == true) {
                allMessages.push(USER_NAME + " : [ALL OK]");
            }
            allMessages.push("------------------- ");
        }
        next(null);
    });
}

function main() {
    async.eachSeries(users, function(user, eachNext) {
        okStatus = true;
        USER_NAME = user.name;
        PASS = user.pass;
        checkOneUser(eachNext);
    }, function(err) {
        if (err) {
            console.log("err - ", err);
        } else {
            sendSummaryMailToAdmin();
        }
    });
}

// var d = require("domain").create();
// d.on("error", function(e){
// console.log("in domain - ", e);
// sendErrorMailToAdmin(e);
//});
//d.run(main);

//process.on("uncaughtException", function(e){
//    sendErrorMailToAdmin(e);
//});

main();
