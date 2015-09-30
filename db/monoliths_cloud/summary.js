var extend = require("xtend");
var mysql = require('mysql');
var async = require("async");
var baseData = require("./baseData").data;

/* ST */
//var conn = mysql.createConnection({
//    host     : '192.168.196.10',
//    port     : '9540',
//    database : "compass_master_db",
//    user     : 'root',
//    password : 'password'
//  });
//
//var connCore = mysql.createConnection({
//      host     : '192.168.196.10',
//  port     : '9540',
//  database : "core_master_db",
//  user     : 'root',
//  password : 'password'
//});

/* DEVELOP */
var conn = mysql.createConnection({
    host: '192.168.196.10',
    port: '5301',
    database: "monoliths_summary_db",
    user: 'root',
    password: 'password'
});
var connMaster = mysql.createConnection({
    host: '192.168.196.10',
    port: '5301',
    database: "monoliths_master_db",
    user: 'root',
    password: 'password'
});
var connCore = mysql.createConnection({
    host: '192.168.196.10',
    port: '5301',
    database: "core_master_db",
    user: 'root',
    password: 'password'
});

/* HOME */
//var conn = mysql.createConnection({
//  host     : 'localhost',
//  port     : '3306',
//  database : "monoliths_summary_db",
//  user     : 'dev',
//  password : 'password'
//});
//var connMaster = mysql.createConnection({
//    host     : 'localhost',
//    port     : '3306',
//    database : "monoliths_master_db",
//    user     : 'dev',
//    password : 'password'
//  });
//var connCore = mysql.createConnection({
//    host     : 'localhost',
//    port     : '3306',
//    database : "core_master_db",
//    user     : 'dev',
//    password : 'password'
//});


var co_account_id = 1;
var dsp_id = 1;
var display_id = 2;
var creative_id = 6;
var currency_id = 1;

// format ... "2015/08/12-1015/09/12"
// format ... "2015/09/12"
// format ... "2015/09/12,2015/09/13"
var duration = "2015/07/10-2015/10/23";

// format ... "2015/08/12 10:00-2015/08/15 11:00"
var duration_time = "2015/07/10 10:00-2015/10/23 8:00";

conn.connect();
connCore.connect();
connMaster.connect();

function insertDisplayDailySummary(outerNext) {
    var datesArr = getDatesArr(duration, "date");
    async.eachSeries(datesArr, function(dateItem, next) {
        insertOneDaily(dateItem, next);
    }, function(e) {
        logError(e);
        outerNext(null);
    });
}

function insertOneDaily(dateItem, next) {
    var sql = "insert into display_daily_summary set ?";
    var params = extend(baseData.display_daily_summary, {
        "display_id" : display_id,
        "dsp_id" : dsp_id,
        "creative_id" : creative_id,
        "target_date" : dateItem,
        "co_account_id" : co_account_id,
        impression : 101,
        cost : 11.23
    });
    conn.query(sql, params, function(err) {
        logError(err);
        console.log("insert one - ", params.target_date);
        next(null);
    })
}

function insertDisplaySummary(outerNext) {
    var datesArr = getDatesArr(duration_time, "datetime");
    async.eachSeries(datesArr, function(dateItem, next) {
        insertOne(dateItem, next);
    }, function(e) {
        logError(e);
        outerNext(null);
    });
}

function insertOne(dateItem, next) {
    var sql = "insert into display_summary set ?";
    var params = extend(baseData.display_summary, {
        "display_id" : display_id,
        "dsp_id" : dsp_id,
        "creative_id" : creative_id,
        "target_datetime" : dateItem,
        "co_account_id" : co_account_id,
        impression : 101,
        cost : 11.23
    });
    conn.query(sql, params, function(err) {
        logError(err);
        console.log("insert one - ", params.target_datetime);
        next(null);
    })
}

/**
 * type ... date / datetime
 * @param duration
 * @param type
 * @returns
 */
function getDatesArr(duration, type) {
    calcFn = type == "date" ? getDates : getDateTimes;

    var start = null;
    var end = null;
    if (duration.indexOf("-") != -1) {

        // "xxx-xxx"
        start = duration.split("-")[0];
        end = duration.split("-")[1];
        return calcFn.call(this, start, end);
    } else if (duration.indexOf(",") != -1) {

        // "xxx,xxx,xxx"
        return duration.split(",").map(function(d) {
            return new Date(d);
        });
    } else {

        // "xxx"
        return calcFn.call(this, duration, duration);
    }
}

function getDateTimes(beginDate, endDate) {

    if (typeof beginDate == "string") {
        beginDate = new Date(beginDate);
    }
    if (typeof endDate == "string") {
        endDate = new Date(endDate);
    }

    var dates = [];
    var oneHour = 1000 * 60 * 60;
    var start = beginDate.getTime();
    while (start <= endDate) {
        dates.push(new Date(start));
        start = start + oneHour;
    }
    return dates;
}

function getDates(beginDate, endDate) {
    console.log(beginDate, endDate);

    if (typeof beginDate == "string") {
        beginDate = new Date(beginDate);
    }
    if (typeof endDate == "string") {
        endDate = new Date(endDate);
    }

    var dates = [];
    var oneDay = 1000 * 60 * 60 * 24;
    var start = beginDate.getTime();
    while (start <= endDate) {
        dates.push(new Date(start));
        start = start + oneDay;
    }
    return dates;
}


function logError(err) {
    if (err) {
        console.error(err);
    }
}

function beginTransaction(callback) {
    conn.beginTransaction(function(err) {
        // start transaction one ...
        if (err) {
            console.log("transactin begin error ", err);
        } else {
            connCore.beginTransaction(function(errCore) {
                // start transaction two ...
                if (errCore) {
                    console.log("transactin begin error (core) ", err);
                } else {
                    connMaster.beginTransaction(function(errorMonoliths) {
                        if (errorMonoliths) {
                            console.log("transaction begin err (monoliths)", err);
                        } else {
                            callback();
                        }
                    });

                }
            });
        }
    });
}

function main(){
    async.waterfall([
                     insertDisplayDailySummary
//                     ,
//                     insertDisplaySummary
                      ], function(error) {
        if (error) {
            console.log(error);
            conn.rollback(function(){
                connCore.rollback(function(){
                    connMaster.rollback(function(){
                        process.exit();
                    });
                });
            });
        } else {
            conn.commit(function(){
                connCore.commit(function(){
                    connMaster.commit(function(){
                        process.exit();
                    });
                });
            });
            console.log("done ...");
        }
    });
}

beginTransaction(main);
