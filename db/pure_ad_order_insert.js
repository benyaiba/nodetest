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
var conn = connection;

connection.connect();

// meida's madsId
var madsId = 1;
// advertiser's madsId
var madsIdAd = 2;
var creativeIds;
var productIds;

connection.beginTransaction(function(err){
  if(err){
    throw err
  }else{
    prepare();
  }
});

function prepare(){
  var dfd = new Deferred();
  getProductIds().done(function(){
    getCreativeIds().done(function(){
      main();
    });
  });
  return dfd.promise();
}

var creativeIndex = 0;
function main(){
  async.eachSeries(productIds, function(productId, outerNext){
    // outter body
    createAdOrder(productId, madsIdAd).done(function(orderId){
      // order insert
      async.eachSeries(creativeIds, function(creativeId, next){
        // inner body
        createOrderCreativeRelay(orderId, creativeId).done(function(){
          next();
        });
      }, function(err){
        // inner error
        if(err){
          console.log("err!!!");
          conn.rollback();
          progress.exit();
        }else{
          outerNext();
        }
      });
    });
  }, function(err){
    // outter err
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
}
function createOrderCreativeRelay(orderId, creativeId){
  var dfd = new Deferred();
  var obj = {
    "order_id" : orderId,
    "creative_id" : creativeId
  }
	var sql = "insert into pure_ad_relay_order_creative set ?";
	conn.query(sql, obj, function(err, result){
		if(err){
	      conn.rollback();
	      console.log("insert pure_ad_relay_order_creative error .", err);
	    }else{
	      console.log("++ insert one pure_ad_relay_order_creative done ...");
	      dfd.resolve(result.insertId);
	    }
	});
	return dfd;
}

function createAdOrder(productId, madsId){
	var dfd = new Deferred();
	var sql = "insert into pure_ad_order set ?";
  var obj = {
    "mads_id": madsId,
    "product_id": productId
  };
	conn.query(sql, obj, function(err, result){
		if(err){
	      conn.rollback();
	      console.log("insert pure_ad_order error .", err);
	    }else{
	      console.log("++ insert one pure_ad_order done ...");
	      dfd.resolve(result.insertId);
	    }
	});
	return dfd;
}

function getCreativeIds(){
	var dfd = new Deferred();
	var sql = "select * from pure_ad_creative where mads_id = ?";
	conn.query(sql, madsIdAd, function(err, result){
		if(err){
	      conn.rollback();
	      console.log("select creative ids error .", err);
	    }else{
        creativeIds = new Array();
        creativeIds.push(result[result.length - 1].creative_id);
        creativeIds.push(result[result.length - 2].creative_id);
	      dfd.resolve();
	    }
	});
	return dfd;
}
function getProductIds(){
  if(productIds && productIds.length && productIds.length != 0){
    // set productIds manually
    return;
  }
	var dfd = new Deferred();
	var sql = "select * from pure_ad_product " + 
  "inner join pure_ad_monitor on pure_ad_monitor.mads_id = ? and pure_ad_monitor.monitor_id = pure_ad_product.monitor_id";
	conn.query(sql, madsId, function(err, result){
		if(err){
	      conn.rollback();
	      console.log("select product ids error .", err);
	    }else{
        productIds = new Array();
        for(var i = 100; i > 0; i--){
          if(result.length > i){
            productIds.push(result[result.length - i].product_id);
          }
        }
	      dfd.resolve();
	    }
	});
	return dfd;
}

