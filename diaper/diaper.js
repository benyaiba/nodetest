var request = require('request');
var harJson = require("./har_v.json");
var iconv = require('iconv-lite');
var fs = require("fs");
var erequest = require("./encoderequest");
var async = require("async");

var charset = "Shift_JIS";

var event_id = "5467635266";
var event_type = "7";

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

function doMail() {
    var config = require("./config.json");
    var event_id = config.event_id;
    var event_type = config.event_type;
    var personArr = config.personArr;
    personArr.forEach(function(person) {
        var getMailHar = harJson[2];
        var params = getMailHar.postData.params;
        _setValue(params, "event_id", event_id);
        _setValue(params, "event_type", event_type);
        _setValue(params, "mail1", person.mail);
        _setValue(params, "mail2", person.mail);

        erequest({
            har : getMailHar
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

function doAll() {
    var config = require("./config.json");
    async.each(config.personArr, function(person) {
        doOne(person);
    }, function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("## all done ...");
        }
    });
}

function doOne(person) {
    var taskArr = [];
    taskArr.push(function(next) {
        next(null, person);
    });
    taskArr.push(getSess);
    taskArr.push(registSess);
    taskArr.push(postCardNo);
    taskArr.push(postInfo);
    taskArr.push(postConfirmDone);
    async.waterfall(taskArr, function(err) {
        if (err) {
            console.log("water fall err:", person.mail, err);
            return;
        }
        console.log("## one person done ...");
    });
}

function getSess(person, next) {
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
        next(null, person);
    }, charset);
}

function registSess(person, next) {
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
    var har = cardNoHar;
    var params = har.postData.params;
    _setHeaderSess(har.headers, person.sess);
    _setValue(params, "card_no", person.card_no);
    erequest({
        har : har
    }, function(response) {
        next(null, person);
    }, function(body) {
        if (body.indexOf("パスワード") != -1) {
            console.log("## postCardNo -- ok");
        }
    }, charset);
}

function postInfo(person, next) {
    var har = infoHar;
    var params = har.postData.params;
    _setHeaderSess(har.headers, person.sess);
    _setValue(params, "password", person.password);
    _setValue(params, "sei", person.sei);
    _setValue(params, "mei", person.mei);
    _setValue(params, "sei_kana", person.sei_kana);
    _setValue(params, "mei", person.mei_kana);
    _setValue(params, "tel1", person.tel1);
    _setValue(params, "tel2", person.tel2);
    _setValue(params, "tel3", person.tel3);
    erequest({
        har : har
    }, function(response) {
        next(null, person);
    }, function(body) {
        if (body.indexOf("パスワード") != -1) {
            console.log("## post info -- ok");
        }
    }, charset);
}

function postConfirmDone(person, next) {
    var har = confirmHar;
    _setHeaderSess(har.headers, person.sess);
    erequest({
        har : har
    }, function(response) {
    }, function(body) {
        if (body.indexOf("予約完了") != -1) {
            console.log("## post confirm -- ok");
            console.log("## 【" + person.mail + "】SUCCESS !!");
            next(null, person);
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

doAll();
