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
  mads_id: 80,
  air_times: ["2014-04-07"],
  schedule_times: [["08:00:00", "20:00:00"]],
  monitor_name: "monitor"
}
var program_base = extend(baseDatas.program_base, {mads_id: params.mads_id});
var monitor_base = extend(baseDatas.monitor_base, {mads_id: params.mads_id});
var schedule_base = extend(baseDatas.schedule_base, {mads_id: params.mads_id});

connection.beginTransaction(function(err){
  if(err){
    throw err
  }else{
    createMonitor();
  }
});


// create monitor
function createMonitor() {
  // create monitor
  createOneMonitor(params.monitor_name, connection).done(function(monitor_id) {
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
          connection.end();
          console.log("++ all done ...");
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

function createOneMonitor(monitor_name, conn){
  var dfd = new Deferred();
  conn.query("insert into monitor set ?", extend(monitor_base,{monitor_name: monitor_name}), function(err, result){
    if(err){
      conn.rollback();
      console.log("insert monitor error .", err);
    }else{
      var monitor_id = result.insertId;
      // update monitor name
      var monitor_name = "monitor_" + monitor_id;
      conn.query("update monitor set monitor_name = ? where monitor_id = ?",[monitor_name, monitor_id], function(err, result){
        if(err){
          conn.rollback();
          console.log("update monitor error .", err);
        }else{
          console.log("++ insert one monitor, monitor_id:" + monitor_id);
          dfd.resolve(monitor_id);
        }
      });
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