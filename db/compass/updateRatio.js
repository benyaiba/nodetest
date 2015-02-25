var extend = require("xtend");
var mysql = require('mysql');
var async = require("async");


/*var connection = mysql.createConnection({
  host     : '192.168.196.10',
  port     : '9918',
  database : "monoliths_master_db",
  user     : 'd_signage',
  password : 'signage'
});*/

  
var conn = mysql.createConnection({
  host     : 'localhost',
  port     : '3306',
  database : "compass_master_db",
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


var params = {
  structId: "81122",
  startDate: "2015-02-25",
  endDate: "2015-02-28",
  ratioFlg: true,
  ratios: [{
      startDate: "2015-02-25",
      endDate: "2015-02-25",
      deliveryRatio: "13.000",
      forecastCpm: "14.0000"
  },{
      startDate: "2015-02-26",
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
    async.waterfall([ updateStruct, deleteAllRatio, insertReserveDeliveryRatio ], function(error) {
        if (error) {
            console.log(error);
            conn.rollback();
            connCore.rollback();
            process.exit();
        } else {
            conn.commit();
            connCore.commit();
            console.log("done ...");
            process.exit();
        }
    });
}

beginTransaction(main);
