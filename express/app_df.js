//var express = require("express");
//var path = require("path");
//var fs = require("fs");
//var async = require('async');
//var Deferred = require("Deferred");
var dingfan = require("../api/dingfan.js");
//
//var app = express();
//
//app.use(express.logger());
//app.use(express.static(__dirname, "/public"));
//app.use(express.bodyParser());

function extend(app){
    
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
    
    app.post("/api/df_order/insert", function(req, res){
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
    
    app.post("/api/df_order/delete", function(req, res){
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
}


function wrapForJsonp(callbackFnName, jsonStr){
    return callbackFnName + "(" + jsonStr + ")";
}

exports.extend = extend;

