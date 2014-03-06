var extend = require("xtend");
var mysql = require('mysql');

var program_base = {
    "mads_id": "1",
    "program_name": "自動program",
    "program_time": "15",
    "program_type": "adnw",
    "soft_delete_flag": "open",
    "update_time": "2014-03-08 07:05:39",
    "create_time": "2013-03-08 04:15:26"
  };
  
var monitor_base = {
    "mads_id": "1",
    "monitor_name": "自動monitor",
    "monitor_size_id": "1",
    "monitor_size": "1280*1024",
    "monitor_category_id": "1",
    "area_id": "1",
    "special_area_id": "10",
    "state": "東京都",
    "city": "渋谷区",
    "street": "マークシティ",
    "default_creative_id": "422",
    "standard_cost": "200.00000000",
    "special_cost": "300.00000000",
    "standard_time": "00:00:00",
    "soft_delete_flag": "open",
    "update_time": "2013-11-25 10:22:10",
    "create_time": "2013-11-04 14:27:49"
  };

var schedule_base = {
    "mads_id": "1",
    "schedule_name": "自動schedule",
    "start_time": "09:00:00",
    "end_time": "10:00:00",
    "fixed_flag": "fixed",
    "soft_delete_flag": "open",
    "update_time": "2014-01-14 14:31:17",
    "create_time": "2013-10-14 19:11:50"
  };

var connection = mysql.createConnection({
  host     : '192.168.196.10',
  port     : '9918',
  database : "monoliths_master_db",
  user     : 'd_signage',
  password : 'signage'
});

connection.connect();
var params = {
  mads_id: 1
}
extend(program_base, {mads_id: params.mads_id});
extend(monitor_base, {mads_id: params.mads_id});
extend(schedule_base, {mads_id: params.mads_id});
getOrInsertSchedule("09:00:00", "10:10:00", connection);

// params :
//   mads_id,
//   date: array (array of airtime),
//   schedule_time (array of time),
//   program_time (array of time)
//connection.beginTransaction(function(err) {
//  if (err) { throw err; }
//  var program = {
//    mads_id: 10
//  }
//  connection.query('INSERT INTO program SET ?', program, function(err, result) {
//    if (err) { 
//      connection.rollback(function() {
//        throw err;
//      });
//    }
//    console.log(result.insertId);
//    connection.commit();
//  });
//  
//});

function getOrInsertSchedule(start_time, end_time, conn){
  conn.query("select * from schedule where start_time = ? and end_time = ? and fixed_flag = 'fixed' and soft_delete_flag = 'open'", [start_time, end_time], function(err, result){
    if(result.length == 0){
      console.log("schedule not found, try to insert one.", [start_time, end_time]);
      var insertSchedule = extend(schedule_base, {
        start_time: start_time,
        end_time: end_time
      });
      conn.query("insert into schedule set ? ", insertSchedule, function(err, result){
        if(err){
          console.log(err);
        }else{
          conn.commit(function(err){
            console.log("all done...");
            conn.end();
          });
        }
      })
    }else{
      console.log(result[0].schedule_id);
    }
  });
}