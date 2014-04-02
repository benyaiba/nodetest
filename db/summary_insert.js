var extend = require("xtend");
var mysql = require('mysql');
var baseDatas = require('./baseData').datas;
var Deferred = require("Deferred");
var async = require("async");

var connection = mysql.createConnection({
  host     : '192.168.196.10',
  port     : '9918',
  database : "monoliths_summary_db",
  user     : 'd_signage',
  password : 'signage'
});

connection.connect();

var params = {
  mads_id: 103,
  start_date: "2014-04-01",
  end_date: "2014-04-03",
}
var program_base = baseDatas.program_base;
var creative_summary_base = baseDatas.creative_summary;

connection.beginTransaction(function(err){
  if(err){
    throw err
  }else{
    main();
  }
});

var conn = connection;
var days = getDaysInTerm(params.start_date, params.end_date);
function main(){
  var madsId = params.madsId;
  var sql = "select * from struct left join campaign on struct.campaign_id = campaign.campaign_id where campaign.mads_id = ? and struct.open_flag = 'open' and campaign.open_flag ='open'";
  conn.query(sql, [madsId], function(err,result){
    if(err){
      console.log("err", err);
      conn.rollback();
    }else{
      async.eachSeries(result, function(item, next){
        doOneStruct(madsId, item.struct_id).done(function(){
          next();
        }, function(err){
          if(err){
            console.log("err !!!", err);
            conn.rollback();
            progress.exit();
          }
          // all is done
          conn.commit(function(err){
            if(!err){
              conn.commit();
              conn.end();
            }else{
              conn.rollback();
              console.log("err!!",err);
            }
          });
        });
      });
    }
  });
}

function doOneStruct(madsId, structId){
  var dfd = new Deferred();
  var sql = "select * from creative c join relay_struct_creative rsc on  rsc.creative_id = c.creative_id join structs s on s.struct_id = rsc.struct_id where s.struct_id = ? and s.delete_flag = 'open'";
  var sqlParams = [structId];
  conn.query(sql, sqlParams, function(err, result){
    if(err){
      conn.rollback();
      console.log("err", err);
    }else{
      async.eachSeries(result, function(item, next){
        doOneCreative(madsId, structId, item.creative_id).done(function(){
          next();
        });
      }, function(err){
          if(err){
            console.log("err !!!", err);
            conn.rollback();
            progress.exit();
          }
          // this struct is done
          conn.commit(function(err){
            if(!err){
              dfd.resolve();
            }else{
              conn.rollback();
              console.log("err!!",err);
            }
          });
    })
  });
  return dfd.promise();
}

function doOneCreative(madsId, structId, creativeId){
  var dfd = new Deferred();
  async.forSeries(days, function(oneDayStr, next){
    doInsert(madsId, structId, creativeId, oneDayStr).done(function(){
      doInsert(madsId, structId, creativeId, oneDayStr)
    });
  }, function(err){
    if(err){
      console.log("err!", err);
      conn.rollback();
    }else{
      dfd.resolve();
    }
  });
  return dfd;
}

function doInsert(madsId, structId, creativeId, oneDayStr){
  var dfd = new Deferred();
  // TODO
  var sql = "insert into creative_summary set ?";
  var sqlParams = extend(creative_summary_base, {
    mads_id: madsId,
    struct_id: structId,
    creative_id: creativeId,
    target_date: oneDayStr
  });
  conn.query(sql, sqlParams, function(err, result){
    if(err){
      conn.rollback();
      console.log("err", err);
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
      conn.rollback();
      console.log("err", err);
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
//var arr = getDaysInTerm("2014-01-01", "2014-01-01");
//  console.log(arr);