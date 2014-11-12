var extend = require("xtend");
var mysql = require('mysql');
var baseDatas = require('./baseData').datas;
var Deferred = require("Deferred");
var async = require("async");

var connection = mysql.createConnection({
  host     : '192.168.196.10',
  port     : '9918',
  database : "monoliths_master_db",
  user     : 'd_signage',
  password : 'signage'
});

var params = {
  monitor_name: "純広モニタ",
  oneDayDates: [
      "2014-12-29",
      "2014-12-30",
      "2015-01-01",
      "2015-01-03"
//      "2015-01-16",
      ],
  periodDates: [
                ["2014-12-29", "2014-12-31"], 
                ["2015-01-01", "2015-01-02"],
                ["2015-01-05", "2015-01-08"] 
//                ["2015-02-04", "2015-02-05"], 
//                ["2015-03-01", "2015-03-03"], 
//                ["2015-03-05", "2015-03-07"]
               ]
}

connection.connect();

var base_pure_ad_product = {
	"product_name": "商品_",
	"fixed_price": "100.0",
	"wholesale_price": "40.0",
	"stock": "99",
	"order_limit": "10",
	"order_term": "2",
	"remarks": "bara bura bura .",
	"start_date": "2014-09-24",
	"end_date": "2014-10-24",
	"status": "active",
	"update_time": "2014-06-14",
	"create_time": "2014-06-14"
}

function insertAreaMaster(next){
  var conn = connection;
  var sql = "insert into area_master set ?";
  var sqlParam = {
    area_name: "area_name",
    special_area_flag: "special",
    multiple_flag : "on",
    "soft_delete_flag": "open",
    "update_time": "2014-03-08 03:08:00",
    "create_time": "2014-03-08 03:08:00"
  }
  conn.query(sql,sqlParam, function(err, result){
    if(!err){
      var areaId = result.insertId;
      console.log("insert area_master as special area, id: [ " + areaId + " ]");
    }
    next(err, areaId);
  });
}
function updateAreaName(areaId, next){
  var conn = connection;
  var sql = "update area_master set area_name = ? where area_id = ?";
  var sqlParam = ["特別エリア" + areaId, areaId];
  conn.query(sql,sqlParam, function(err, result){
    if(!err){
      console.log("update area name done.");
    }
    next(err, areaId);
  });
}

function insertMonitor(areaId, next){
  var conn = connection;
  var sql = "insert into pure_ad_monitor set ?";
  var sqlParam = extend(baseDatas.monitor_base,{
      monitor_name: params.monitor_name,
      special_area_id: areaId
  });
  conn.query(sql,sqlParam, function(err, result){
    if(err){
      console.log("insert one pure_ad_monitor error !", err);
    }
    console.log("insert one pure_ad_monitor, id : [ ", result.insertId + " ]");
    next(err, result.insertId);
  });
}
function updateMonitorName(monitorId, next){
  var conn = connection;
  var sql = "update pure_ad_monitor set monitor_name = ? where pure_ad_monitor_id = ?";
  var sqlParam = [(params.monitor_name + monitorId), monitorId];
  conn.query(sql, sqlParam, function(err, result){
    if(!err){
      console.log("update pure_ad_monitor name");
    }
    next(err,monitorId);
  });
}

function insertOneDayPureAdProduct(monitorId, next){
  var conn = connection;
  var sql = "insert into pure_ad_product set ?";
  var sqlParam = extend(base_pure_ad_product, {
    pure_ad_monitor_id: monitorId
  });
  async.eachSeries(params.oneDayDates, function(oneDay, seriesNext){
    sqlParam.start_date = oneDay;
    sqlParam.end_date = oneDay;
    conn.query(sql, sqlParam, function(err, result){
      if(err){
        console.log(err);
      }
      var insertProductId = result.insertId;
      updatePureAdProductName(insertProductId);
      seriesNext(err);
    });
  }, function(err){
    if(err){
      console.log(err);
    }
    console.info("insert one day pure_ad_product", params.oneDayDates);
    next(err, monitorId);
  });
}
function insertPeriodPureAdProduct(monitorId, next){
  var conn = connection;
  var sql = "insert into pure_ad_product set ?";
  var sqlParam = extend(base_pure_ad_product, {
    pure_ad_monitor_id: monitorId
  });
  async.eachSeries(params.periodDates, function(period, seriesNext){
    sqlParam.start_date = period[0];
    sqlParam.end_date = period[1];
    conn.query(sql, sqlParam, function(err, result){
      if(err){
        console.log(err);
      }
      var insertProductId = result.insertId;
      updatePureAdProductName(insertProductId);
      seriesNext(err);
    });
  }, function(err){
    if(err){
      console.log(err);
    }
    console.info("insert period pure_ad_product", params.periodDates);
    next(err, monitorId);
  });
}
function updatePureAdProductName(productId){
  var conn = connection;
  var sql = "update pure_ad_product set product_name = ? where pure_ad_product_id = ?";
  var sqlParam = ["商品_" + productId, productId];
  conn.query(sql, sqlParam, function(err, result){
    if(err){
      console.error("update pure_ad_product name fail !", err);
    }
  });
}

function insertMonitorLocation(monitorId, next){
  var conn = connection;
  var sql = "insert into monitor_location set ?";
  var sqlParam = extend(baseDatas.monitor_location_base, {monitor_id: monitorId});
  conn.query(sql,sqlParam, function(err, result){
    if(!err){
      console.log("insert monitor location");
    }
    next(err, monitorId);
  });
}

function relayMonitorAge(monitorId, next){
  var conn = connection;
  var sql = "insert into relay_monitor_age set ?";
  var sqlParams = {
    monitor_id: monitorId,
    age_id: null,
    order_type_id: 1,
    rate: 80,
    soft_delete_flag: "open",
    "update_time": "2014-03-08 03:08:00",
    "create_time": "2014-03-08 03:08:00"
  }
  async.each([1,2,3,4], function(ageId, next2){
     sqlParams.age_id = ageId;
     conn.query(sql, sqlParams, function(err, result){
       next2(err, result);
     });
  }, function(err){
    if(!err){
      console.log("relate monitor age.");
    }
    next(err, monitorId);
  });
}

function relayMonitorPersona(monitorId, next){
  var conn = connection;
  var sql = "insert into relay_monitor_persona set ?";
  var sqlParams = {
    monitor_id: monitorId,
    persona_id: null,
    order_type_id: 1,
    rate: 80,
    soft_delete_flag: "open",
    "update_time": "2014-03-08 03:08:00",
    "create_time": "2014-03-08 03:08:00"
  }
  async.each([1,2,3,4], function(personaId, next2){
     sqlParams.persona_id = personaId;
     conn.query(sql, sqlParams, function(err, result){
       next2(err, result);
     });
  }, function(err){
    if(!err){
      console.log("relate monitor persona");
    }
    next(err, monitorId);
  });
}

function relayMonitorGender(monitorId, next){
  var conn = connection;
  var sql = "insert into relay_monitor_gender set ?";
  var sqlParams = {
    monitor_id: monitorId,
    gender_id: null,
    order_type_id: 1,
    rate: 80,
    soft_delete_flag: "open",
    "update_time": "2014-03-08 03:08:00",
    "create_time": "2014-03-08 03:08:00"
  }
  async.each([1,2], function(genderId, next2){
     sqlParams.gender_id = genderId;
     conn.query(sql, sqlParams, function(err, result){
       next2(err, result);
     });
  }, function(err){
    if(!err){
      console.log("relate monitor gender");
    }
    next(err, monitorId);
  });
}

function insertRelayMonitorFormat(monitorId, next){
  async.eachSeries([1,2,3], function(formatId, eachNext) {
      insertRelayMonitorFormatOne(monitorId, formatId, eachNext)
  }, function(err) {
      next(err, monitorId);
  });
}

function insertRelayMonitorFormatOne(monitorId, formatId, next){
  var conn = connection;
  var sql = "insert into relay_pure_ad_monitor_format set ?";
  var sqlParam = {
        "pure_ad_monitor_id": monitorId,
        "format_id": formatId,
        "create_time": "2014-03-08 03:08:00"
  }
  conn.query(sql, sqlParam, function(err, result){
    if(err){
      console.log("insert into realy_pure_ad_monitor_format err !!", err);
    }
    next(err);
  });
}

function main(){
  async.waterfall([insertAreaMaster,
                    updateAreaName,
                    insertMonitor,
                    updateMonitorName,
                    insertOneDayPureAdProduct,
                    insertPeriodPureAdProduct,
                    insertMonitorLocation,
                    relayMonitorAge,
                    relayMonitorPersona,
                    relayMonitorGender,
                    insertRelayMonitorFormat
], function(err){
  if(err){
    console.log(err);
    connection.rollback();
    connection.end();
  }else{
    connection.commit();
    connection.end();
    console.log("done ...");
  }
});
}

main();