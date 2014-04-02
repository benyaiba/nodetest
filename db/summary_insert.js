// delete from creative_summary where create_time like '2014-03-08%'

var extend = require("xtend");
var mysql = require('mysql');
var baseDatas = require('./baseData').datas;
var Deferred = require("Deferred");
var async = require("async");

var summary_connection = mysql.createConnection({
  host     : '192.168.196.10',
  port     : '9918',
  database : "monoliths_summary_db",
  user     : 'd_signage',
  password : 'signage'
});
var connection = mysql.createConnection({
  host     : '192.168.196.10',
  port     : '9918',
  database : "monoliths_master_db",
  user     : 'd_signage',
  password : 'signage'
});

summary_connection.connect();
connection.connect();

var params = {
  mads_id: "104",
  start_date: "2014-03-01",
  end_date: "2014-04-01",
}
var program_base = baseDatas.program_base;
var creative_summary_base = baseDatas.creative_summary;

summary_connection.beginTransaction(function(err){
  if(err){
    throw err
  }else{
    main();
  }
});

var conn = connection;
var sum_conn = summary_connection;
var days = getDaysInTerm(params.start_date, params.end_date);

function main(){
  clearTermData().done(function(){
    createCreativeSummary();
  });
}
function createCreativeSummary(){
  console.log("++ begin with mads: " + params.mads_id);
  var madsId = params.mads_id;
  var sql = "select * from struct left join campaign on struct.campaign_id = campaign.campaign_id where campaign.mads_id = ? and struct.soft_delete_flag = 'open' and campaign.soft_delete_flag ='open'";
  conn.query(sql, [madsId], function(err,result){
    if(err){
      console.log("err", err);
      sum_conn.rollback();
    }else{
      if(result.length == 0){
        console.log("++ no creative is founded !");
        process.exit();
      }
      async.eachSeries(result, function(item, next){
         doOneStruct(madsId, item.struct_id).done(function(){
           next();
         });
      }, function(err){
          if(err){
            console.log("err !!!", err);
            sum_conn.rollback();
            progress.exit();
          }
          // all creative is done
          sum_conn.commit(function(err){
            if(!err){
              conn.end();
              // create struct summary according to creative summary
              createStructSummary();
            }else{
              console.log("err!!",err);
              sum_conn.rollback();
            }
          });
      });
    }
  });
}

function createStructSummary(){
  var sql = "insert into struct_summary "+
  " (select struct_id,target_date, mads_id, sum(impression) as impression, sum(aired_time) as aired_time, sum(gross) as gross, now(), now()"+
  " from creative_summary "+
  "group by mads_id, struct_id, target_date"+
  " having target_date >= ? and target_date <= ? and mads_id = ?)";
  sum_conn.query(sql, [params.start_date, params.end_date, params.mads_id], function(err, result){
    if(err){
      console.log("err !", err);
      sum_conn.rollback();
      process.exit();
    }else{
      console.log("#### insert into struct_summary ####")
      console.log("++++ going to commit !");
      sum_conn.commit();
      sum_conn.end();
      process.exit();
    }
  });
}

function clearTermData(){
  var dfd = new Deferred();
  var sql = "delete from creative_summary where target_date IN (?) and mads_id = ?";
  var sqlParam = [days, params.mads_id]
  sum_conn.query(sql, sqlParam, function(err, result){
    if(err){
      console.log("err !", err);
      process.exit();
    }else{
      console.log("-- clear struct_summary data in term : ", days);
      var sql2 = "delete from struct_summary where target_date IN (?) and mads_id = ?";
      sum_conn.query(sql2, sqlParam, function(err, result){
        if(err){
          console.log("err !", err);
          process.exit();
        }else{
          console.log("-- clear creative_summary data in term : ", days);
          dfd.resolve();
        }
      });
    }
  });
  return dfd;
}

function doOneStruct(madsId, structId) {
	console.log("++++ begin with struct id: " + structId);
	var dfd = new Deferred();
	var sql = "select * from creative c join relay_struct_creative rsc on  rsc.creative_id = c.creative_id join struct s on s.struct_id = rsc.struct_id where s.struct_id = ? and s.soft_delete_flag = 'open'";
	var sqlParams = [structId];
	conn.query(sql, sqlParams,
	function(err, result) {
		if (err) {
			console.log("err", err);
			sum_conn.rollback();
		} else {
			async.eachSeries(result,
			function(item, next) {
				doOneCreative(madsId, structId, item.creative_id).done(function() {
					next();
				});
			},
			function(err) {
				if (err) {
					console.log("err !!!", err);
					sum_conn.rollback();
					progress.exit();
				} else {
					dfd.resolve();
				}
			});
		}
	});
	return dfd.promise();
}

function doOneCreative(madsId, structId, creativeId){
  console.log("++ begin with creative id: " + creativeId);
  var dfd = new Deferred();
  async.eachSeries(days, function(oneDayStr, next){
    doInsert(madsId, structId, creativeId, oneDayStr).done(function(){
      next();
    });
  }, function(err){
    if(err){
      console.log("err!", err);
      sum_conn.rollback();
    }else{
      dfd.resolve();
    }
  });
  return dfd.promise();
}

function doInsert(madsId, structId, creativeId, oneDayStr){
  var dfd = new Deferred();

  var count = getRandomCount();
  var time = getRandomTime(count);
  var gross = getRandomGross(time);
  var sql = "insert into creative_summary set ?";
  var sqlParams = extend(creative_summary_base, {
    mads_id: madsId,
    struct_id: structId,
    creative_id: creativeId,
    target_date: oneDayStr,
    impression: count,
    aired_time: time,
    gross: gross
  });
  sum_conn.query(sql, sqlParams, function(err, result){
    if(err){
      console.log("err", err);
      sum_conn.rollback();
    }else{
      console.log("++ insert creative_summary ok ... target_date: " + oneDayStr + " creative_id:" + creativeId);
      dfd.resolve();
    }
  });
  return dfd.promise();
}

function template(){
  var dfd = new Deferred();
  var sql = "";
  var sqlParams = {};
  conn.query(sql, sqlParams, function(err, result){
    if(err){
      console.log("err", err);
      sum_conn.rollback();
    }else{
      console.log("++ ");
      dfd.resolve();
    }
  });
  return dfd.promise();
}


function getDaysInTerm(startDateStr, endDateStr){
  var startSeconds = Date.parse(startDateStr);
  var endSeconds = Date.parse(endDateStr);
  var oneDaySeconds = 24 * 60 * 60 * 1000;
  
  var retArr = [];
  var tmpSeconds = startSeconds;
  while(tmpSeconds <= endSeconds){
    retArr.push(dateFormat(new Date(tmpSeconds)));
    tmpSeconds += oneDaySeconds;
  }
  return retArr;
}

function dateFormat(d){
  var y = d.getFullYear() + "";
  var m = d.getMonth() + 1 + "";
  var date = d.getDate() + "";
  if(m.length == 1){
    m = "0" + m;
  }
  if(date.length == 1){
    date = "0" + date;
  }
  return [y,m,date].join("-");
}

function getRandomCount(){
  // count if random in 0 - 100
  return parseInt(Math.random() * 100,10) + 1;
}
function getRandomTime(count){
  // program is random in [15, 30, 45]
  var pArr = [15, 40, 150];
  var rp = parseInt(Math.random() * 3);
  return count * pArr[rp];
}
function getRandomGross(time){
  // monitor amount is random in 10 - 200
  var monitorAmount = 0;
  while(monitorAmount < 10){
    monitorAmount = parseInt(Math.random() * 200) + 1;
  }
  return monitorAmount * time / 15;
}
//var arr = getDaysInTerm("2014-01-01", "2014-01-01");
//  console.log(arr);