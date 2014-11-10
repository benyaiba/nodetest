var extend = require("xtend");
var mysql = require('mysql');
var baseDatas = require('./baseData').datas;
var Deferred = require("Deferred");
var async = require("async");

var conn = null;

var params = {
    mads_id: 1,
    air_times: [ "2014-11-11"],
    category_id: 2,
    createSpArea: true
}
var response_monitor_base = extend(baseDatas.monitor_base, {
    "mads_id": params.mads_id,
    "external_media_id": 4,
    "monitor_category_id": params.category_id
});

function createConnection(next) {
    conn = mysql.createConnection({
        host: '192.168.196.10',
        port: '9918',
        database: "monoliths_master_db",
        user: 'd_signage',
        password: 'signage'
    });
    conn.connect(function(err) {
        next(err);
    });
}

function startTransaction(next) {
    conn.beginTransaction(function(txErr) {
        next(txErr);
    });
}

function insertMonitor(next) {
    var sql = "insert into monitor set ? ";
    conn.query(sql, response_monitor_base, function(err, result) {
        var insertId = null;
        if (!err) {
            insertId = result.insertId;
        }
        next(err, insertId);
    })
}

function updateMonitorName(monitorId, next) {
    var sql = "update monitor set monitor_name = ? where monitor_id = ?";
    var name = "感知式モニタ" + monitorId;
    conn.query(sql, [name, monitorId], function(err) {
        next(err, monitorId);
    })
}

function insertMonitorLocation(monitorId, next){
  var sql = "insert into monitor_location set ?";
  var sqlParam = extend(baseDatas.monitor_location_base, {monitor_id: monitorId});
  conn.query(sql,sqlParam, function(err, result){
    next(err, monitorId);
  });
}

function insertRelayResponseMonitor(monitorId, next) {
    var sql = "insert into relay_response_monitor set ?";
    var obj = {
        "monitor_id": monitorId,
        // "response_device_id": null,
        "max_count": 4,
        "update_time": "2014-03-08 03:08:00",
        "create_time": "2014-03-08 03:08:00"
    }
    conn.query(sql, obj, function(err, result) {
        next(err, monitorId);
    })

}

function insertResponseMonitorSchedule(monitorId, next) {
    async.eachSeries(params.air_times, function(airtime, eachNext) {
        insertResponseMonitorScheduleOne(monitorId, airtime, eachNext)
    }, function(err) {
        next(err, monitorId);
    });
}

function insertResponseMonitorScheduleOne(monitorId, airtime, next) {
    var sql = "insert into response_monitor_schedule set ?";
    var obj = {
        "monitor_id": monitorId,
        "airtime": airtime,
        "airtime_status": 1,
        "update_time": "2014-03-08 03:08:00",
        "create_time": "2014-03-08 03:08:00"
    }
    conn.query(sql, obj, function(err) {
        next(err, monitorId);
    })
}

function insertAreaMaster(monitorId, next){
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
    next(err, areaId, monitorId);
  });
}
function updateAreaName(areaId, monitorId, next){
  var sql = "update area_master set area_name = ? where area_id = ?";
  var sqlParam = ["特別エリア" + areaId, areaId];
  conn.query(sql,sqlParam, function(err, result){
    if(!err){
      console.log("update area name done.");
    }
    next(err, areaId, monitorId);
  });
}
function updateMonitorAreaId(areaId, monitorId, next){
  var sql = "update monitor set special_area_id = ? where monitor_id = ?";
  var sqlParam = [areaId, monitorId];
  conn.query(sql,sqlParam, function(err, result){
    if(!err){
      console.log("update monitor area_id done ...");
    }
    next(err, monitorId);
  });
}


function main() {
  var monitorInsertArr = [ createConnection, startTransaction, insertMonitor, updateMonitorName, insertMonitorLocation,
            insertRelayResponseMonitor, insertResponseMonitorSchedule ];
  if(params.createSpArea == true){
    monitorInsertArr.push(insertAreaMaster);
    monitorInsertArr.push(updateAreaName);
    monitorInsertArr.push(updateMonitorAreaId);
  }
  async.waterfall(monitorInsertArr,
     function(err, monitorId) {
      if (err) {
          console.error("error in water fall, rollback !", err);
          conn.rollback();
          conn.end();
      } else {
          conn.commit();
          conn.end();
          console.info("all done ...");
          console.info("monitor_id: ", monitorId);
      }
  });
}

main();
