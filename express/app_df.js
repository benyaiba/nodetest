//var express = require("express");
//var path = require("path");
//var fs = require("fs");
//var async = require('async');
//var Deferred = require("Deferred");
var dingfan = require("../db/dingfan/db_df.js");
//
//var app = express();
//
//app.use(express.logger());
//app.use(express.static(__dirname, "/public"));
//app.use(express.bodyParser());

function extend(app){

    app.get("/dingfan", function(req, res){
        res.redirect("/public/html/dingfan/dingfan.html");
    })

    app.get("/api/df_info/select/:group_id", function(req, res){
        var groupId = req.params.group_id;
        var callbackFnName = req.query.callback;
        dingfan.sInfo({
            "group_id": groupId,
        }, function(err, result){
            var ret = null;
            if(err){
                ret = JSON.stringify({"error": err});
            }else{
                ret = JSON.stringify(result);
            }
            ret = callbackFnName ? wrapForJsonp(callbackFnName, ret) : ret;
            res.set({
                "content-type": callbackFnName ? "text/javascript" : "text/json"
            });
            res.send(ret).end();
        });
    });

    app.get("/api/df_order/select/:group_id", function(req, res){
        var groupId = req.params.group_id;
        var callbackFnName = req.query.callback;
        dingfan.s({
            "group_id": groupId,
        }, function(err, result){
            var ret = null;
            if(err){
                ret = JSON.stringify({"error": err});
            }else{
                ret = JSON.stringify(result);
            }
            ret = callbackFnName ? wrapForJsonp(callbackFnName, ret) : ret;
            res.set({
                "content-type": callbackFnName ? "text/javascript" : "text/json"
            });
            res.send(ret).end();
        });
    });

    app.post("/api/df_order/insert", [checkEndTime], function(req, res){
        var params = req.body;
        var callbackFnName = req.query.callback;
        dingfan.i(params, function(err, result){
            var ret = null;
            if(err){
                ret = JSON.stringify({"error": err});
            }else{
                ret = JSON.stringify(result);
            }
            ret = callbackFnName ? wrapForJsonp(callbackFnName, ret) : ret;
            res.set({
                "content-type": callbackFnName ? "text/javascript" : "text/json"
            });
            res.send(ret).end();
        });
    });

    app.post("/api/df_order/delete", [checkEndTime], function(req, res){
        var params = req.body;
        var callbackFnName = req.query.callback;
        dingfan.d(params, function(err, result){
            var ret = null;
            if(err){
                ret = JSON.stringify({"error": err});
            }else{
                ret = JSON.stringify(result);
            }
            ret = callbackFnName ? wrapForJsonp(callbackFnName, ret) : ret;
            res.set({
                "content-type": callbackFnName ? "text/javascript" : "text/json"
            });
            res.send(ret).end();
        });
    });

    function checkEndTime(req,res, next){
        var groupId = req.body.group_id;
        var params = {"group_id": groupId};
        dingfan.sInfo(params,function(err, result){
            if(err){
                console.log(err);
                res.json({"error": "系统错误。"});
                return;
            }else{

                if(!result || !result[0]){
                    // no end time limit
                    next();
                    return;
                }

                var dbEndTime = result[0].end_time;
                if(checkOverTime(dbEndTime)){
                    // out of reservation time
                    res.json({"error": "预约已停止"});
                    return;
                }else{
                    next();
                }
            }

        });
    }

    function checkOverTime(dbEndTime){
        var r = new RegExp("\\d+(:\\d+)?");
        var dbTime = r.exec(dbEndTime)[0];
        var hour = null;
        var minute = null;
        if(dbTime.indexOf(":") != -1){
            hour = parseInt(dbTime.split(":")[0],10);
            minute = parseInt(dbTime.split(":")[1],10);
        }else{
            hour = parseInt(dbTime,10);
        }
        var currentHour = new Date().getHours();
        var currentMinute = new Date().getMinutes();
        if(minute){
            return currentHour >= hour && currentMinute >= minute;
        }else{
            return currentHour >= hour;
        }
    }
}


function wrapForJsonp(callbackFnName, jsonStr){
    return callbackFnName + "(" + jsonStr + ")";
}

exports.extend = extend;

