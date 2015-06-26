require("./extends.js");

var request = require('request');
var iconv = require('iconv-lite');
var fs = require("fs");
var async = require("async");
var erequest = require("./encoderequest");

var harJson = require("./har_v.json");
var getMailHar = harJson[2];
var cardNoHar = harJson[4];
var infoHar = harJson[5];
var confirmHar = harJson[6];

var charset = "Shift_JIS";
var timeout = 1000;

/**
 * L size:
 * gaoqi:
 * http://advs.jp/cp/akachan_sale_pc/search_event_list.cgi?area2=%8cQ%94n%8c%a7&event_type=7&sid=37031&kmws=
 * shengu:
 * http://aksale.advs.jp/cp/akachan_sale_pc/search_event_list.cgi?area2=%258d%25e9%258b%25ca%258c%25a7&event_type=7&sid=37189&kmws=
 *
 * country for test:
 * http://advs.jp/cp/akachan_sale_pc/search_event_list.cgi?area2=%90%e7%97t%8c%a7&event_type=5&sid=37213&kmws=
 *
 */
function run() {
    var args = process.argv;
    args = Array.prototype.slice.apply(args);
    args.splice(0, 2);

    if (!args || args.length == 0) {
        console.log("1 - send confirm mail");
        console.log("2 - get url from confirm mail, set to config.json");
        console.log("3 - get sess id");
        console.log("4 - reservation start !!");
        return;
    }
    if (args[0] == "1") {
        sendConfirmMail();
    }
    if (args[0] == "2") {
        getUrlFromMail();
    }
    if (args[0] == "3") {
        getSessId();
    }
    if (args[0] == "4") {
        doOrder();
    }

}

function sendConfirmMail() {
    var config = require("./config.json");
    var event_id = config.event_id;
    var event_type = config.event_type;
    var personArr = config.personArr;
    personArr.forEach(function(person) {
        var har = getMailHar;
        var params = har.postData.params;
        _setValue(params, "event_id", event_id);
        _setValue(params, "event_type", event_type);
        _setValue(params, "mail1", person.mail);
        _setValue(params, "mail2", person.mail);

        erequest({
            har : har
        }, null, function(body) {
            // console.log(body);
            if (body.indexOf("送信しました") != -1) {
                console.log("## 【" + person.mail + "】 confirm mail success");
            } else {
                console.log("## 【" + person.mail + "】 confirm mail fail .", person.mail);
            }
        }, charset);
    });
}

function getUrlFromMail() {
    var mailPop3 = require("./mail_pop3.js");
    mailPop3.getUrl();
}

function getSessId(){
    var config = require("./config.json");
    var personArr = config.personArr;
    async.each(personArr, function(person, next){
        getSessOne(person, next);
    }, function(err){
        if(err){
            console.log(err);
        }else{
            fs.createWriteStream("config.json").write(JSON.stringify(config, null, 4));
            console.log("## write sessId and redirectUrl to config.json done ...");
        }
    });
}

function getSessOne(person, next) {
    var sess = null;

    var har = {
        method : "GET",
        url : person.url
    };
    erequest({
        har : har
    }, function(response) {

        // get sess
        var cookieArr = response.headers["set-cookie"];
        var cookie = null;
        cookieArr.forEach(function(cookieItem) {
            if (cookieItem.indexOf("sess") != -1) {
                cookie = cookieItem;
            }
        });
        var regExp = new RegExp("sess=(.*?);");
        var result = regExp.exec(cookie);
        sess = result[1];
    }, function(body) {

        // get redirect url
        var redirectUrl = /http.*?(?=")/.exec(body)[0];
        console.log("## sess", sess, redirectUrl);
        person.sess = sess;
        person.sessUrl = redirectUrl;
        next(null);
    }, charset);
}

function doOrder() {
    var config = require("./config.json");
    async.each(config.personArr, function(person) {
        doOneOrder(person);
    }, function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("## all done ...");
        }
    });
}

function doOneOrder(person) {
    var taskArr = [];
    taskArr.push(function(next) {
        next(null, person);
    });
    taskArr.push(registSess);
    taskArr.push(postCardNo);
    taskArr.push(timeoutRun(postInfo, 1200));
    taskArr.push(timeoutRun(postConfirmDone, 1200));
    async.waterfall(taskArr, function(err) {
        if (err) {
            console.log("water fall err:", person.mail, err);
            return;
        }
        log("one person done ...", person);
    });
}

function registSess(person, next) {
    log("start");
    person.time = new Date();

    erequest({
        url : person.sessUrl,
        method : "GET",
        headers : {
            "Cookie" : "sess=" + person.sess
        }
    }, null, function(body) {
        // console.log(body);
        if (body.indexOf("次へ") != -1) {
            console.log("## 予約始め...");
            next(null, person);
        } else {
            console.log("## 予約待ち中...");
            registSess(person, next);
        }
    }, charset);
}

function postCardNo(person, next) {
    log("post card no -- begin");
    var har = cardNoHar;
    var params = har.postData.params;
    _setHeaderSess(har.headers, person.sess);
    _setValue(params, "card_no", person.card_no);
    erequest({
        har : har
    }, function(response) {
    }, function(body) {
        if (body.indexOf("パスワード") != -1) {
            log("post card no -- end",person);
        }
    }, charset);
    next(null, person);
}

function postInfo(person, next) {
    log("post info -- begin");
    var har = infoHar;
    var params = har.postData.params;
    _setHeaderSess(har.headers, person.sess);
    _setValue(params, "password", person.password);
    _setValue(params, "sei", person.sei);
    _setValue(params, "mei", person.mei);
    _setValue(params, "sei_kana", person.sei_kana);
    _setValue(params, "mei_kana", person.mei_kana);
    _setValue(params, "tel1", person.tel1);
    _setValue(params, "tel2", person.tel2);
    _setValue(params, "tel3", person.tel3);
    erequest({
        har : har
    }, function(response) {
    }, function(body) {
        if (body.indexOf("パスワード") != -1) {
            log("post info -- end", person);
        }
    }, charset);
    next(null, person);
}

function postConfirmDone(person, next) {
    log("post confirm -- begin");
    var har = confirmHar;
    _setHeaderSess(har.headers, person.sess);
    erequest({
        har: har
    }, function(response) {
    }, function(body) {

        if (body.indexOf("エラー") != -1) {
            log("post confirm エラー",  person);
            fileLog(body);
        }

        if (body.indexOf("予約完了") != -1) {
            log("post confirm -- done", person);
            log("【" + person.mail + "】SUCCESS !!");
            next(null, person);
        } else if (body.indexOf("満席") != -1) {
            ("## 【" + person.mail + "】満席しまった ...", person);
            next(null, person);
        } else {
            ("## resend post confirm for 【" + person.mail + "】");
            postConfirmDone(person, next);
        }
    }, charset);
}

function _setHeaderSess(headers, sess) {
    headers.forEach(function(h) {
        if (h.name == "Cookie") {
            var value = h.value;
            value = value.replace(/sess=.*?;/, "sess=" + sess + ";");
            h.value = value;
        }
    });
}

function _setValue(arr, name, value) {
    arr.forEach(function(item) {
        if (item["name"] == name) {
            item["value"] = value;
        }
    });
}

function timeoutRun(fn, to){
    to = to || timeout;
    return function(){
        var argArr = Array.prototype.slice.call(arguments);
        setTimeout(function(){
            fn.apply(this, argArr);
        }, to);
    };
}

function log(msg, person){
    if(person === false){
        console.log("## " + msg);
        return;
    }

    if(person){
        var time = person.time || new Date();
        var now = new Date();
        var costTime = (now.getTime() - time.getTime()) / 1000 + "s";
        console.log("## <%s> - %s - cost time %s".format(person.mail, msg, costTime));
    }else{
        console.log("## %s - %s".format(msg, new Date().format("h:m:s.S")));
    }
}

function fileLog(content){
    fs.createWriteStream("log.log", {
        flags:"r+",
        encoding: "Shift_JIS"
    }).write(content);
}

run();
