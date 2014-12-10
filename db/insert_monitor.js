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

connection.connect();

FORCE_INSERT_SCHEDULE = true;
var params = {
  mads_id: 1,
  air_times: ["2015-01-17", "2015-01-18"],
  // 0 -> normal
  // 2 -> sepcial_area , will insert area_master
  external_media_id: 2,
  schedule_times: [["08:00:00", "20:00:00"],["08:00:00", "20:00:00"]],
  monitor_name: "monitor",
  monitor_id: ""
}
var program_base = extend(baseDatas.program_base, {mads_id: params.mads_id});
var monitor_base = extend(baseDatas.monitor_base, {mads_id: params.mads_id});
var schedule_base = extend(baseDatas.schedule_base, {mads_id: params.mads_id});

connection.beginTransaction(function(err){
  if(err){
    throw err
  }else{
    var monitroBeginId = 12014;
    var idArr = [];
    for(var i = 0; i< 2; i++){
      idArr.push(i);
    }
    async.eachSeries(idArr, function(id, next){
      var monitorId = id + monitroBeginId;
      params.monitor_id = monitorId;
      console.log("-----------  " + id + "  ---------------");
      createMonitor(next);
    }, function(){
      // all done
      if(err){
        console.log(err);
        connection.rollback();
        connection.end();
      }else{
        connection.commit();
        connection.end();
        console.log("all done ...");
      }
    });
    
  }
});


// create monitor
function createMonitor(outterNext) {
  // create monitor
  createOneMonitor().done(function(monitor_id) {
    async.eachSeries(params.schedule_times,
    function(schedule_times, next) {
      var i = params.schedule_times.indexOf(schedule_times);
      var airTimeArr = params.air_times;
      var air_time = airTimeArr[i];
      // create schedule
      getSchedule(schedule_times[0], schedule_times[1], connection).done(function(schedule_id) {
        var start_datetime = air_time + " " + schedule_times[0];
        var end_datetime = air_time + " " + schedule_times[1];
        // relate monitor and schedule
        relateMonitorSchedule(monitor_id, schedule_id, air_time, start_datetime, end_datetime, connection).done(function() {
          console.log("++++ one suit done... ++++");
          next();
        });
      });
    },
    function(err) {
      if(err){
        console.log("err!!!");
        progress.exit();
      }
      // when all is done
      connection.commit(function(err) {
        if (!err) {
          //connection.end();
          console.log("++ all done [for one] ...");
          outterNext(err);
        }
      });
    });
  });
}

function relateMonitorSchedule(monitor_id,schedule_id, air_time, start_datetime, end_datetime, conn){
  var dfd = new Deferred();
  var insertSql = "insert into monitor_schedule set ?";
  var insertParam = extend(baseDatas.monitor_schedule, {
    monitor_id: monitor_id,
    airtime: air_time,
    schedule_id: schedule_id,
    start_datetime: start_datetime,
    end_datetime: end_datetime
  });
  conn.query(insertSql, insertParam, function(err, result){
    if(err){
      conn.rollback();
      console.log("insert monitor_schedule error .", err);
    }else{
      console.log("++ insert monitor_schedule done ...");
      dfd.resolve();
    }
  });
  return dfd.promise();
}

// get one schedule and then relate the schedule to program
function getSchedule(start_time, end_time,conn) {
  var dfd = new Deferred();
  getOrInsertSchedule(start_time, end_time,conn).done(function(schedule_id){
    // create schedule program relation
    relateScheduleProgram(schedule_id, start_time, end_time, conn).done(function(){
      dfd.resolve(schedule_id);
    });
  });
  return dfd.promise();
}

// find one or create one schedule
// return the schedule_id
// first find, if get one ,just return the id
// or insert one and retrun the id
function getOrInsertSchedule(start_time, end_time, conn){
  var dfd = new Deferred();
  var scheduleSearchSql = "select * from schedule " +
     "where start_time = ? and end_time = ? and fixed_flag = 'fixed' and soft_delete_flag = 'open' and mads_id = ?";
  conn.query(scheduleSearchSql, [start_time, end_time, params.mads_id], function(err, result){
    if(result.length == 0 || FORCE_INSERT_SCHEDULE == true){
      console.log("++ schedule not found, try to insert one.", [start_time, end_time]);
      var insertSchedule = extend(schedule_base, {
        start_time: start_time,
        end_time: end_time
      });
      conn.query("insert into schedule set ? ", insertSchedule, function(err, result){
        if(err){
          conn.rollback();
          console.log("insert schedule failed", err);
        }else{
          var schedule_id = result.insertId;
          var forcePrefix = FORCE_INSERT_SCHEDULE == true ? "[force] ": "";
          console.log("++ " + forcePrefix + "insert schedule OK ... schedule_id : " + schedule_id);
          dfd.resolve(schedule_id);
        }
      })
    }else{
      var schedule_id = result[0].schedule_id;
      console.log("++ find one exists schedule, schedule_id: " + schedule_id);
      dfd.resolve(schedule_id);
    }
  });
  return dfd.promise();
}

function findOrCreateProgram(start_time, end_time, conn){
  var dfd = new Deferred();
  var programSearchSql = "select * from program where program_time = 15 and mads_id = ? and program_type = 'adnw' and soft_delete_flag = 'open'";
  conn.query(programSearchSql, [params.mads_id], function(err, result){
    if(err){
      console.log("err!!", err);
      conn.rollback();
    }else{
      if(result.length == 0){
        console.log("++ not found program by program time !, try to create one");
        var programEntity = program_base
        conn.query("insert into program set ?",programEntity, function(err, result){
          if(err){
            console.log("err!!", err);
            conn.rollback();
          }else{
            var program_id = result.insertId;
            console.log("++ insert one program, id: " + program_id);
            dfd.resolve(program_id);
          }
        });
      }else{
        console.log("++ find one program, id:" + result[0].program_id);
        dfd.resolve(result[0].program_id);
      }
    }
  });
  return dfd.promise();
}

// create schedule_program relation
// only creat one to one relation for now
// first find the program by condition : program_time = 15
// then insert relay_schedule_program
function relateScheduleProgram(schedule_id, start_time, end_time, conn){
  var dfd = new Deferred();
  findOrCreateProgram(start_time, end_time, conn).done(function(program_id){
    var relay_start_time = start_time;
    var relay_end_time = start_time.substring(0, start_time.length - 2) + "15";
    check_relay_schedule_program(schedule_id, program_id, conn).done(function(checkflg){
      if(checkflg){
        // check ok -- no exists, insert one
        var insertEntity = extend(baseDatas.relay_schedule_program, {
            schedule_id: schedule_id,
            program_id: program_id,
            start_time: relay_start_time,
            end_time: relay_end_time
        });
        conn.query("insert into relay_schedule_program set ?", insertEntity, function(err, result){
            if(err){
              console.log("relay_schedule_program failed ..", err);
              conn.rollback();
            }else{
              console.log("++ relay_schedule_program insert OK ...");
              dfd.resolve();
            }
          });
      }else{
        // we have one exists, nothing todo
        console.log("++ find one exists relay_schedule_program");
        dfd.resolve();
      }
    });
  });
  return dfd.promise();
}

function check_relay_schedule_program(schedule_id, program_id, conn){
  var dfd = new Deferred();
  var sql = "select * from relay_schedule_program where program_id = ? and schedule_id = ?";
  conn.query(sql, [program_id, schedule_id], function(err, result){
    if(err){
      conn.rollback();
      console.log("check relay_schedule_program err", err);
    }else{
      dfd.resolve(result.length == 0);
    }
  });
  return dfd.promise();
}

// =============== monitor create ==================
function insertAreaMaster(next){
  if(params.external_media_id == 0){
    next(null, 0);
    return;
  }
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
  if(areaId == 0){
    next(null, 0);
    return;
  }
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
  var sql = "insert into monitor set ?";
  var sqlParam = extend(monitor_base,{
    monitor_name: params.monitor_name,
    monitor_id: params.monitor_id
  });
  if(areaId != 0){
    sqlParam.special_area_id = areaId;
    sqlParam.external_media_id = params.external_media_id;
  }
  conn.query(sql,sqlParam, function(err, result){
    if(!err){
      console.log("insert one monitor, id : [ ", result.insertId + " ]");
    }
    next(err, result.insertId);
  });
}
function updateMonitorName(monitorId, next){
  var conn = connection;
  var sql = "update monitor set monitor_name = ? where monitor_id = ?";
  var sqlParam = [(params.monitor_name + monitorId), monitorId];
  conn.query(sql, sqlParam, function(err, result){
    if(!err){
      console.log("update monitor name");
    }
    next(err,monitorId);
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
function insertRelayMedipMonitor(monitorId, next){
  if(params.external_media_id != 2){
    next(null, monitorId);
    return;
  }
  var conn = connection;
  var sql = "insert into relay_medip_monitor set ?";
  var sqlParam = {
    monitor_id: monitorId,
    medip_device_id: "888",
    roll_count: "3",
    "update_time": "2014-03-08 03:08:00",
    "create_time": "2014-03-08 03:08:00"
  }
  conn.query(sql,sqlParam, function(err, result){
    if(!err){
      console.log("insert relay_medip_monitor .");
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

function createOneMonitor(){
  var dfd = new Deferred();
  async.waterfall([insertAreaMaster, updateAreaName, 
    insertMonitor, updateMonitorName, insertMonitorLocation, 
    insertRelayMedipMonitor,
    relayMonitorAge, relayMonitorPersona, relayMonitorGender], 
    function(err, result){
      if(err){
        console.log("err in water fall", err);
        connection.rollback();
      }else{
        dfd.resolve(result);
      }
  });
  return dfd;
}
// ============== monitor creat end =========