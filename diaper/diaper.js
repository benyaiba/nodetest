var request = require('request');
var harJson = require("./har_v.json");
var iconv = require('iconv-lite');
var fs = require("fs");
var harrequest = require("./harrequest");

var charset = "Shift_JIS";

var sessHar = harJson[0];
var cardNoHar = harJson[1];
var infoHar = harJson[2];
var confirmHar = harJson[3];

function getSess(){
    harrequest(sessHar, function(response){
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
//        console.log(response);
    }, charset);
}

getSess();
