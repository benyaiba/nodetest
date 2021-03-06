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
  schedule_id: 233,
  start_time: "08:00:00",
  end_time: "20:00:00",
  relay_start_times: ["04:00:00", "08:00:00", "19:00:00"],
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
    getMadsId(schedule_id, connection).done(function(mads_id){
      clearScheduleProgramRelate(schedule_id, connection).done(function(){
        var index = 0;
        async.eachSeries(program_times, function(program_time, next){
          getProgram(mads_id, program_time, connection).done(function(program_id){
            var startEndTime = getStartEndTime(index);
            var pro_start_time = startEndTime[0];
            var pro_end_time = startEndTime[1];
            index++;
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
      console.log("err insert relate_schedule_program ", err);
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

function getStartEndTime(index){
  var relay_start_times = params.relay_start_times;
  var program_times = params.program_times;
  var program_time = program_times[index];
  var timeStr = getTimeStr(program_time);
  var start_time = relay_start_times[index];
  var end_time = start_time.substring(0, start_time.length - timeStr.length) + timeStr;
  return [start_time, end_time];
}

function getTimeStr(secondStr){
  var second = parseInt(secondStr, 10);
  if(second < 60){
    return secondStr + "";
  }else{
    var minite = parseInt(second / 60, 10);
    var second = second % 60;
    if((second + "").length == 1){
      second = "0" + second;
    } 
    return minite + ":" + second;
  }
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
