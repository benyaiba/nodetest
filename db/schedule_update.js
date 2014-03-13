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

var params = {
  schedule_id: 212,
  start_time: "08:00:00",
  end_time: "12:00:00",
  relay_start_times: ["08:00:00", "09:00:00", "10:00:00"],
  program_times: [15,45,30]
}
var program_base = baseDatas.program_base;

connection.beginTransaction(function(err){
  if(err){
    throw err
  }else{
    //updateSchedule(212, "12:00:00","13:00:00", connection);
    main();
  }
});

function main(){
  var schedule_id = params.schedule_id;
  var start_time = params.start_time;
  var end_time = params.end_time;
  var program_times = params.program_times;
  updateSchedule(schedule_id, start_time, end_time, connection).done(function(){
    console.log("1111111111", schedule_id, start_time, end_time);
    getMadsId(schedule_id, connection).done(function(mads_id){
      clearScheduleProgramRelate(schedule_id, connection).done(function(){
        async.eachSeries(program_times, function(program_time, next){
          getProgram(mads_id, program_time, connection).done(function(program_id){
            var startEndTime = getStartEndTime(program_time);
            var pro_start_time = startEndTime[0];
            var pro_end_time = startEndTime[1];
            relateScheduleProgram(schedule_id, pro_start_time, pro_end_time, program_id, connection).done(function(){
              next();
            });
          });
        }, function(err){
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
      })
    });
  });
}

function updateSchedule(schedule_id, start_time, end_time,conn){
  var dfd = new Deferred();
  var sql = "update schedule set start_time = ?, end_time = ? where schedule_id = ?";
  var sqlParams = [start_time, end_time, schedule_id];
  conn.query(sql, sqlParams, function(err, result){
    if(err){
      conn.rollback();
      console.log("err", err);
    }else{
      console.log("++ update schedule ok ... schedule_id : " + schedule_id);
      dfd.resolve();
    }
  });
  return dfd.promise();
}

function getMadsId(schedule_id, conn){
  var dfd = new Deferred();
  var sql = "select mads_id from schedule where schedule_id = ?";
  var sqlParams = [schedule_id];
  conn.query(sql, sqlParams, function(err, result){
    if(err){
      conn.rollback();
      console.log("err", err);
    }else{
      var mads_id = result[0].mads_id;
      console.log("++ find mads_id : " + mads_id);
      dfd.resolve(mads_id);
    }
  });
  return dfd.promise();
}

function getProgram(mads_id, program_time, conn){
  var dfd = new Deferred();
  var sql = "select * from program where mads_id = ? and program_time = ?";
  var sqlParams = [mads_id, program_time];
  conn.query(sql, sqlParams, function(err, result){
    if(err){
      conn.rollback();
      console.log("err", err);
    }else{
      if(result.length == 0){
        // not found insert one
        var insertSql = "insert into program set ?";
        var insertParam = extend(program_base,{
          mads_id: mads_id,
          program_time: program_time
        });
        conn.query(insertSql,insertParam, function(err, result){
          if(err){
            console.log("err", err);
            conn.rollback();
          }else{
            console.log("++ insert one program : " + result.insertId);
            dfd.resolve(result.insertId);
          }
        });
      }else{
        // find one
        var pId = result[0].program_id;
        console.log("++ find one program, id : " + pId);
        dfd.resolve(pId);
      }
    }
  });
  return dfd.promise();
}

function relateScheduleProgram(schedule_id, start_time, end_time, program_id, conn){
  var dfd = new Deferred();
  var sql = "insert into relay_schedule_program set ?";
  var sqlParams = {
    schedule_id: schedule_id,
    start_time: start_time,
    end_time: end_time,
    program_id: program_id
  };
  conn.query(sql, sqlParams, function(err, result){
    if(err){
      conn.rollback();
      console.log("err", err);
    }else{
      var iId = result.insertId;
      console.log("++ insert relate_schedule_program ok ..., id : " + iId);
      dfd.resolve();
    }
  });
  return dfd.promise();
}

function clearScheduleProgramRelate(schedule_id, conn){
  var dfd = new Deferred();
  var sql = "delete from relay_schedule_program where schedule_id = ?";
  var sqlParams = [schedule_id];
  conn.query(sql, sqlParams, function(err, result){
    if(err){
      conn.rollback();
      console.log("err", err);
    }else{
      console.log("++ clear all schedule program relation where schedule_ id = " + schedule_id);
      dfd.resolve();
    }
  });
  return dfd.promise();
}

function getStartEndTime(program_time){
  var relay_start_times = params.relay_start_times;
  var program_times = params.program_times;
  var index = program_times.indexOf(program_time);
  var start_time = relay_start_times[index];
  var end_time = start_time.substring(0, start_time.length - 2) + program_time;
  return [start_time, end_time];
}


function template(){
  var dfd = new Deferred();
  var sql = "";
  var sqlParams = {};
  conn.query(sql, sqlParams, function(err, result){
    if(err){
      conn.rollback();
      console.log("err", err);
    }else{
      console.log("++ ");
      dfd.resolve();
    }
  });
  return dfd.promise();
}
