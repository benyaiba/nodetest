var extend = require("xtend");
var mysql = require('mysql');
var async = require("async");

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
  host     : '192.168.196.10',
  port     : '4306',
  database : "compass_master_db",
  user     : 'root',
  password : 'password'
});

var connCore = mysql.createConnection({
    host     : '192.168.196.10',
    port     : '4306',
    database : "core_master_db",
    user     : 'root',
    password : 'password'
  });

/* HOME */
//var conn = mysql.createConnection({
//  host     : 'localhost',
//  port     : '3306',
//  database : "compass_master_db",
//  user     : 'dev',
//  password : 'password'
//});
//var connCore = mysql.createConnection({
//    host     : 'localhost',
//    port     : '3306',
//    database : "core_master_db",
//    user     : 'dev',
//    password : 'password'
//});


var params = {
  structId: "81255",
  startDate: "2015-03-01",
  endDate: "2015-03-13",
  ratioFlg: true,
  ratios: [{
      startDate: "2015-03-01",
      endDate: "2015-03-13",
      deliveryRatio: "13.000",
      forecastCpm: "14.0000"
  },{
      startDate: "2015-02-25",
      endDate: "2015-02-27",
      deliveryRatio: "13.000",
      forecastCpm: "14.0000"
  }]
};

conn.connect();
connCore.connect();

function updateStruct(next){
    var sql = "update struct set start_date = ?, end_date = ? where struct_id = ?";
    connCore.query(sql, [params.startDate, params.endDate, params.structId], function(err, result){
        if(!err){
            console.log("-- update struct done ...");
        }
        next(err);
    });
}

function deleteAllRatio(next){
    var sql = "delete from reserve_delivery_ratio where struct_id = ?";
    conn.query(sql, [params.structId], function(err){
        if(!err){
            console.log("-- delete reserve_delivery_ratio done ...");
        }
        next(err);
    });
}

function insertReserveDeliveryRatio(next) {
    var sql = "insert into reserve_delivery_ratio (start_date, end_date, delivery_ratio, forecast_cpm, struct_id, create_time) "
            + "values (?,?,?,?,?,now())";
    if (params.ratioFlg === false) {
        next();
    } else {
        async.each(params.ratios, function(ratioItem, eachNext) {
            conn.query(sql, [ ratioItem.startDate, ratioItem.endDate, ratioItem.deliveryRatio, ratioItem.forecastCpm,
                    params.structId ], function(err) {
                eachNext(err);
            });
        }, function(err) {
            if(!err){
                console.log("-- insert reserve_delivery_ratio done ...");
            }
            next(err);
        });
    }
}

function selectReserveDeliveryRatio(next){
    var sql = "select * from reserve_delivery_ratio where struct_id = ?";
    conn.query(sql, params.structId, function(error, result){
        if(!error){
            console.log("-- select reserve_delivery_ratio ok, " + result.length);
        }
        next(error, result);
    });
}

function updateReserveDeliveryRatio(result, next){
    if(params.ratioFlg === false){
        next();
    }else{
        var i = 0;
        async.each(params.ratios, function(ratioItem, eachNext){
            var resultItem = result[i];
            i++;
            if(!resultItem){
                eachNext();
                return;
            }
            var sql = "update reserve_delivery_ratio set start_date = ?, end_date = ? where ratio_sequence = ?";
            conn.query(sql, [ratioItem.startDate, ratioItem.endDate, resultItem["ratio_sequence"]], function(error){
                eachNext(error);
            });
        }, function(error){
            if(!error){
                console.log("-- update reserveDeliveryRatio ok");
            }
            next(error);
        });
    }
}

function selectReserveTotalTargetImpression(next){
    var sql = "select * from reserve_total_target_impression where struct_id = ?";
    conn.query(sql, [params.structId], function(error, result){
       if(!error){
           console.log("-- select reserve_total_target_impression ok ", result.length);
       }
       next(error, result);
    });
}

function updateReserveTotalTargetImpression(result, next){
    if(params.ratioFlg === false){
        next();
    }else{
        var i = 0;
        async.each(params.ratios, function(ratioItem, eachNext){
            var resultItem = result[i];
            i++;
            if(!resultItem){
                eachNext();
                return;
            }
            var sql = "update reserve_total_target_impression set start_date = ?, end_date = ? where total_sequence = ?";
            conn.query(sql, [ratioItem.startDate, ratioItem.endDate, resultItem["total_sequence"]], function(error){
                eachNext(error);
            });
        }, function(error){
            if(!error){
                console.log("-- update reserve_total_target_impression ok");
            }
            next(error);
        });
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
    async.waterfall([ updateStruct,
//                      deleteAllRatio,
//                      insertReserveDeliveryRatio
                      selectReserveTotalTargetImpression,
                      updateReserveTotalTargetImpression,
                      selectReserveDeliveryRatio,
                      updateReserveDeliveryRatio
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
