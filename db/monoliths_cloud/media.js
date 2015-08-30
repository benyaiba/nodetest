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
//var conn = mysql.createConnection({
//  host     : '192.168.196.10',
//  port     : '4306',
//  database : "compass_master_db",
//  user     : 'root',
//  password : 'password'
//});
//
//var connCore = mysql.createConnection({
//    host     : '192.168.196.10',
//    port     : '4306',
//    database : "core_master_db",
//    user     : 'root',
//    password : 'password'
//  });

/* HOME */
var conn = mysql.createConnection({
  host     : 'localhost',
  port     : '3306',
  database : "monoliths_master_db",
  user     : 'dev',
  password : 'password'
});
var connCore = mysql.createConnection({
    host     : 'localhost',
    port     : '3306',
    database : "core_master_db",
    user     : 'dev',
    password : 'password'
});


var co_account_id = 1;

conn.connect();
connCore.connect();

var creatives = [{
    co_account_id: co_account_id
},{
    co_account_id: co_account_id
},{
    co_account_id: co_account_id
},{
    co_account_id: co_account_id
},{
    co_account_id: co_account_id
}];

var rolls = [{
    co_account_id: co_account_id,
    settingInfo : [[1,2], [2,1]]
},{
    co_account_id: co_account_id,
    settingInfo : [[1,1], [2,1]]
}]

function insertCreative(context, outterNext) {
    context.creativeIds = [];
    var sql = "insert into creative set ?";
    async.eachSeries(creatives, function(cItem, next) {
        var params = extend(baseData.creative, cItem);
        connCore.query(sql, params, function(err, result) {
            logError(err);
            var insertId = result.insertId;
            context.creativeIds.push(insertId);
            console.log("# insert creative -- ", insertId);

            // update
            var upSql = "update creative set creative_name = ?, file_name = ? where creative_id = ?";
            var upParams = [ "creative_" + insertId, insertId + "_1", insertId ];
            connCore.query(upSql, upParams, function(err) {
                logError(err);
                console.log("# update creative done ...");
                next(null);
            });
        });
    }, function(err) {
        if (err) {
            console.log(err);
        } else {
            outterNext(null, context);
        }
    });
}

function insertRoll(context, outterNext){
    context.rollIds = [];
    context.rollSettings = [];
    var sql = "insert into roll set ?";
    async.eachSeries(rolls, function(rItem, next) {
        // set setting info ... [[[1,2],[2,1]], [[],[]]]
        var settingInfo = rItem.settingInfo;
        delete rItem.settingInfo
        context.rollSettings.push(settingInfo);
        // insert
        var params = extend(baseData.roll, rItem);
        conn.query(sql, params, function(err, result) {
            logError(err);
            var insertId = result.insertId;
            context.rollIds.push(insertId);
            console.log("# insert roll -- ", insertId);

            // update
            var upSql = "update roll set roll_name = ?, max_order_num = ? where roll_id = ?";
            var upParams = [ "roll_" + insertId, settingInfo.length, insertId ];
            conn.query(upSql, upParams, function(err) {
                logError(err);
                console.log("# update roll done ...");
                next(null);
            });
        });
    }, function(err) {
        if (err) {
            console.error(err);
        } else {
            outterNext(null, context);
        }
    });
}

function insertRollSetting(context, outterNext){
    var rollIds = context.rollIds;
    var creativeIds = context.creativeIds;
    var rollSettings = context.rollSettings;

//    console.log(context);

    // get roll setting insert params
    var paramsArr = [];
    rollIds.forEach(function(rollId){
        var rollSetting = rollSettings.shift();
        rollSetting.forEach(function(settingItem){
            var orderNum = settingItem[0];
            var creativeCount = settingItem[1];
            for(var i=0; i< creativeCount;i++){
                var creativeId = creativeIds.shift();
                var params = extend(baseData.rollSetting, {
                    roll_id: rollId,
                    creative_id: creativeId,
                    order_num: orderNum
                });
                paramsArr.push(params);
            }
        });
    });

    // insert roll setting
    var sql ="insert into roll_setting set ?";
    async.eachSeries(paramsArr, function(paramItem, next){
        conn.query(sql, paramItem, function(err){
            logError(err);
            var logStr =  paramItem.roll_id + " - " + paramItem.creative_id + " - " + paramItem.order_num;
            console.log("# insert roll setting [roll - creative - order_num]", logStr);
            next(null);
        });
    }, function(err){
        if(err){
            console.error(err);
        }else{
            outterNext(null, context);
        }
    });
}

function logError(err){
    if(err){
        console.error(err);
    }
}


function beginTransaction(callback){
    conn.beginTransaction(function(err) {
        // start transaction one ...
        if (err) {
            console.log("transactin begin error ", err);
        }else{
            connCore.beginTransaction(function(errCore){
                // start transaction two ...
                if(errCore){
                    console.log("transactin begin error (core) ", err);
                }else{
                    callback();
                }
            });
        }
    });
}

function main(){
    async.waterfall([
                     function(next){
                         var context = {};
                         next(null, context);
                     },
                     insertCreative,
                     insertRoll,
                     insertRollSetting
//                     insertTimetable,
//                     insertTimetableSetting,
//                     insertSchedule,
//                     insertScheduleSetting
                      ], function(error) {
        if (error) {
            console.log(error);
            conn.rollback(function(){
                connCore.rollback(function(){
                    process.exit();
                });
            });
        } else {
            conn.commit(function(){
                connCore.commit(function(){
                    process.exit();
                });
            });
            console.log("done ...");
        }
    });
}

beginTransaction(main);
