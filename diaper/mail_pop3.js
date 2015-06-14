var assert = require('assert');
var util = require('util');
var Fiber = require('fibers');
var pop3 = require("pop3");
var fs = require("fs");
var async = require("async");
var config = require("./config.json");


var HOST = "pop3.live.com";

var client = pop3.Client({});
var fiber;

function work(person) {
    fiber = Fiber.current;

    client.synchronize(fiber.run.bind(fiber), Fiber.yield.bind(Fiber));
    
    client.connect(HOST, "pop3s");
    client.user(person.mail);
    client.pass(person.mailPassword);
    
    var allMessageStr = client.list().response;
    var msgLen = /\d+/.exec(allMessageStr)[0];
    
    var lastMessage = client.retr(parseInt(msgLen, 10) - 1).data;
    var maiInfo = getMailInfo(lastMessage);
    person.url = maiInfo.url;
    client.quit();
}

function getMailInfo(content){
    var contentInfo  = {};
    var contentArr = content.split("\r\n");
    contentArr.forEach(function(contentItem){
        if(contentItem.indexOf("Date") != -1){
            var dateStr = /,(.*?)\+/.exec(contentItem)[1].trim();
            var date = new Date(dateStr);
            var today = new Date();
            if(today.getMonth() == date.getMonth() 
                    && today.getDate() == date.getDate()){
                contentInfo.date = dateStr;
            }
        }
        if(contentItem.indexOf("From: info@k.akachan.jp") !=-1){
            contentInfo.from = "info@k.akachan.jp";
        }
        if(contentItem.indexOf("https") !=-1){
            contentInfo.url = contentItem;
        }
    });
    
    if(contentInfo.date && contentInfo.from && contentInfo.url){
        console.log("## get url : ", contentInfo.url);
    }else{
        console.log("can not get url from mail - ", contentInfo);
    }
    return contentInfo;
}

function getUrl(personArr){
    var personArr = config.personArr;
    async.each(personArr, function(person){
        Fiber(function() { work(person); }).run();
    }, function(err){
        if(err){
            console.log(err);
        }
        fs.createWriteStream("config.json").write(JSON.stringify(personArr, null, 4));
        console.log("## write url to config.json done ...");
    });
}

exports.getUrl  = getUrl;

