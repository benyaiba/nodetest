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

function test(){

    var begin = "08:00";
    var end = "17:00";
    var otBegin = "19:01";
    var otEnd = "21:00";
    var errorMsgArr = [];
    var yesterday = getYesterday();
    var yesterdayStr = getYesterday().format("yyyy-MM-dd");

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

        if (errorMsgArr.length == 0) {
            return null;
        } else {
            errorMsgArr.unshift("%s (%s)".format(yesterdayStr, yesterday.weekDay()));
            return errorMsgArr.join("\r\n");
        }
    }

console.log(test());