var extend = require("xtend");
var mysql = require('mysql');
var baseDatas = require('baseData');
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

var params = {
  mads_id: 1,
  air_times: ["2014-05-01", "2014-05-02"],
  schedule_times: [["09:00:00", "10:00:00"], ["12:00:00","15:00:00"]],
  monitor_name: "zhaoMonitor001"
}
var program_base = extend(baseDatas.program_base, {mads_id: params.mads_id});
var monitor_base = extend(baseDatas.monitor_base, {mads_id: params.mads_id});
var schedule_base = extend(baseDatas.schedule_base, {mads_id: params.mads_id});
getOrInsertSchedule("09:00:00", "10:10:00", connection);

// create monitor
function createMonitor() {
  // create monitor
  createOneMonitor(params.monitor_name, connection).done(function(monitor_id) {
    async.each(params.schedule_times,
    function(schedule_times, next) {
      var i = params.schedule_times.indexOf(schedule_times);
      var air_time = params.air_times;
      // create schedule
      getSchedule(schedule_times[0], schedule_times[1], connection).done(function(schedule_id) {
        var start_datetime = air_time[i] + " " + schedule_times[0];
        var end_datetime = air_time[i] + " " + schedule_times[1];
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
  conn.query("insert into Monitor set ?", extend(monitor_base,{monitor_name: monitor_name}), function(err, result){
    if(err){
      conn.rollback();
      console.log("insert Monitor error .", err);
    }else{
      var monitor_id = result.insertId;
      console.log("++ insert one monitor, monitor_id:" + monitor_id);
      dfd.resolve(monitor_id);
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
  var scheduleSearchSql = "select * from schedule where start_time = ? and end_time = ? and fixed_flag = 'fixed' and soft_delete_flag = 'open'";
  conn.query(scheduleSearchSql, [start_time, end_time], function(err, result){
    if(result.length == 0){
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
          console.log("++ insert schedule OK ... schedule_id : " + schedule_id);
          dfd.resolve(schedule_id);
        }
      })
    }else{
      var schedule_id = result[0].schedule_id;
      console.log("++ find one exists schedule, schedule_id: " + schedule_id);
      dfd.resolve(schedule_id);
    }
  });
}

// create schedule_program relation
// only creat one to one relation for now
// first find the program by condition : program_time = 15
// then insert relay_schedule_program
function relateScheduleProgram(schedule_id, start_time, end_time, conn){
  var dfd = new Deferred();
  var programSearchSql = "select * from program where program_time = 15 and mads_id = ? and program_type = 'adnw' and soft_delete_flag = open";
  conn.query(programSearchSql, [params.mads_id], function(err, result){
    if(err){
      conn.rollback();
    }else{
      if(result.length == 0){
        // not found ? I don't belive
        console.log("not found programe by programe time !");
        conn.rollback();
        progress.exit();
      }else{
        var program_id = result[0].program_id;
        console.log("++ find program ok ..., program_id:" + program_id);
        var relay_start_time = start_time;
        var relay_end_time = start_time.substring(0, start_time.length - 2) + "15";
        conn.query("insert into relay_schedule_program set ?", 
          extend(baseDatas.relay_schedule_program, {
            schedule_id: schedule_id,
            program_id: program_id,
            start_time: relay_start_time,
            end_time: relay_end_time
          }), function(err, result){
            if(err){
              console.log("relay_schedule_program failed ..");
              conn.rollback();
            }else{
              console.log("++ relay_schedule_program insert OK ...");
              dfd.resolve();
            }
          });
      }
    }
  });
  return dfd.promise();
}