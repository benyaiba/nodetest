var request = require('request');
var harJson = require("./har_v.json");
var iconv = require('iconv-lite');
var fs = require("fs");
var erequest = require("./encoderequest");
var async = require("async");

var charset = "Shift_JIS";

var event_id = "5467635266";
var event_type = "7";

var getMailHar = harJson[2];
var sessHar = {
    "method" : "GET",
    "url" : "https://aksale.advs.jp/cp/akachan_sale_pc/reg?id=6GxfGo4pqOmgJFVHA4d60F4Ar1Uj4BSh"
};
var cardNoHar = harJson[4];
var infoHar = harJson[5];
var confirmHar = harJson[6];

/**
 * L size:
 * http://advs.jp/cp/akachan_sale_pc/search_event_list.cgi?area2=%8cQ%94n%8c%a7&event_type=7&sid=37031&kmws=
 * 
 * country for test:
 * http://advs.jp/cp/akachan_sale_pc/search_event_list.cgi?area2=%90%e7%97t%8c%a7&event_type=5&sid=37213&kmws=
 * 
 */
function doIt() {
    var taskArr = [];
//     taskArr.push(getConfirmMail);
    taskArr.push(getSess);
    taskArr.push(registSess);
    taskArr.push(postCardNo);
    taskArr.push(postInfo);
    taskArr.push(postConfirmDone);
    async.waterfall(taskArr, function(err) {
        if (err) {
            console.log("water fall err:", err);
            return;
        }
        console.log("water fall done .");
    });
}

function getConfirmMail(next) {
    var params = getMailHar.postData.params;
    _setValue(params, "event_id", event_id);
    _setValue(params, "event_type", event_type);
    erequest({
        har : getMailHar
    }, null, function(body) {
//         console.log(body);
        if(body.indexOf("送信しました") != -1){
            console.log("## confirm mail success");
            next(null);
        }else{
            console.log("## confirm mail fail .");
        }
    }, charset);
}

function getSess(next) {
    var sess = null;

    var har = sessHar;
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
        next(null, sess, redirectUrl);
    }, charset);
}

function registSess(sess, url, next) {
    erequest({
        url : url,
        method : "GET",
        headers : {
            "Cookie" : "sess=" + sess
        }
    }, null, function(body) {
        // console.log(body);
        if (body.indexOf("次へ") != -1) {
            console.log("## 予約始め...");
            next(null, sess);
        } else {
            console.log("## 予約待ち中...");
            registSess(sess, url, next);
        }
    }, charset);
}

function postCardNo(sess, next) {
    var har = cardNoHar;
    _setHeaderSess(har.headers, sess);
    erequest({
        har : har
    }, function(response) {
        next(null, sess);
    }, function(body) {
        if (body.indexOf("パスワード") != -1) {
            console.log("## postCardNo -- ok");
        }
    }, charset);
}

function postInfo(sess, next) {
    var har = infoHar;
    _setHeaderSess(har.headers, sess);
    erequest({
        har : har
    }, function(response) {
        next(null, sess);
    }, function(body) {
        if (body.indexOf("パスワード") != -1) {
            console.log("## post info -- ok");
        }
    }, charset);
}

function postConfirmDone(sess, next) {
    var har = confirmHar;
    _setHeaderSess(har.headers, sess);
    erequest({
        har : har
    }, function(response) {
    }, function(body) {
        if (body.indexOf("予約完了") != -1) {
            console.log("## post confirm done -- ok");
            console.log("## SUCCESS !!");
            next(null, sess);
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

doIt();
