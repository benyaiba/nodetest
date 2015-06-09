var async = require("async");
var mysql = require("mysql");

var conn = null;

function createConnection(params, next) {
    conn = mysql.createConnection({
        host : "localhost",
        port : 3306,
        user : "dev",
        password : "password",
        database : "test",
        timeout : 800
    });

//    conn = mysql.createConnection({
//        host : "192.168.196.8",
//        port : 9626,
//        user : "dev",
//        password : "password",
//        database : "test",
//        timeout : 800
//    });

    conn.connect(function(err) {
        if (err) {
            console.error(err);
        } else {
            console.info("connection created ");
        }
        next(err, params);
    });
}

function output(rows, next) {
    conn.end();
    next(null, rows);
}

function s(params, callback) {

    var runSequenceArr = [ function(next) {
        next(null, params);
    }, createConnection, selectDfOrder, output ];
    async.waterfall(runSequenceArr, function(err, result) {
        if (err) {
            console.error("err in async", err);
        } else {
            console.info("async water fall succeed!");
            callback(err, result);
        }
    });
}

function selectDfOrder(params, next) {
    var sql = "select * from df_order where group_id = ? and target_date = ?";
    params.target_date = new Date().format("yyyy-MM-dd");
    console.log(sql, params);
    conn.query(sql, [params.group_id, params.target_date], function(err, result){
        if(err){
            console.log(err);
        }
        next(err, result);
    });
}

function i(params, callback) {

    var runSequenceArr = [ function(next){next(null, params);},
                           createConnection, insertDfOrder, output ];
    async.waterfall(runSequenceArr, function(err, result) {
        if (err) {
            console.error("err in async", err);
        } else {
            console.info("async water fall succeed!");
            callback(err, result);
        }
    });
}

function insertDfOrder(params, next){
    var sql = "insert into df_order set ?";
    params.target_date = new Date();
    conn.query(sql, params, function(err, result){
        if(err){
            console.log(err);
        }
        next(err, result);
    });
}

function d(params, callback) {

    var runSequenceArr = [ function(next){next(null, params);},
                           createConnection, deleteDfOrder, output ];
    async.waterfall(runSequenceArr, function(err, result) {
        if (err) {
            console.error("err in async", err);
        } else {
            console.info("async water fall succeed!");
            callback(err, result);
        }
    });
}

function deleteDfOrder(params, next){
    var sql = "delete from df_order where id = ?";
    console.log(sql, params);
    conn.query(sql, params.id, function(err, result){
        if(err){
            console.log(err);
        }
        next(err, result);
    });
}

function sInfo(params, callback) {

    var runSequenceArr = [ function(next) {
        next(null, params);
    }, createConnection, selectDfInfo, output ];
    async.waterfall(runSequenceArr, function(err, result) {
        if (err) {
            console.error("err in async", err);
        } else {
            console.info("async water fall succeed!");
            callback(err, result);
        }
    });
}

function selectDfInfo(params, next) {
    var sql = "select * from df_info where group_id = ?";
    console.log(sql, params);
    conn.query(sql, [params.group_id], function(err, result){
        if(err){
            console.log(err);
        }
        next(err, result);
    });
}

exports.s = s;
exports.i = i;
exports.d = d;
exports.sInfo = sInfo;
