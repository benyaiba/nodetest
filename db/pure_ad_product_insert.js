var extend = require("xtend");
var mysql = require('mysql');
var baseDatas = require('./baseData').datas;
var Deferred = require("Deferred");
var async = require("async");

var connection = mysql.createConnection({
  host     : 'localhost',
  port     : '3306',
  database : "monoliths_master_db",
  user     : 'dev',
  password : 'password'
});

connection.connect();

var base_pure_ad_product = {
	"product_name": "product_name",
	"fixed_price": "100.0",
	"wholesale_price": "40.0",
	"stock": "99",
	"order_count": "10",
	"order_term": "2",
	"remarks": "bara bura bura .",
	"start_date": "2014-09-01",
	"end_date": "2014-09-10",
	"status": "active",
	"update_time": "2014-06-14",
	"create_time": "2014-06-14"
}

var count = 100;
var monitor_id = 1;

var params = {
  monitor_id: monitor_id
}

connection.beginTransaction(function(err){
  if(err){
    throw err
  }else{
    createProduct();
  }
});

var countArr = [];
for(var i = 0;i < count; i++){
	countArr.push(i);
}

function createProduct(){
	async.eachSeries(countArr, function(index, next){
		var productObj = extend(base_pure_ad_product, params);
		createOneProduct(productObj, connection).done(function(pId){
			var pName = "product_name_" + pId;
			updateProductName(pId, pName, connection).done(function(){
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
}

function createOneProduct(productObj, conn){
	var dfd = new Deferred();
	var sql = "insert into pure_ad_product set ?";
	conn.query(sql, productObj, function(err, result){
		if(err){
	      conn.rollback();
	      console.log("insert pure_ad_product error .", err);
	    }else{
	      console.log("++ insert one pure_ad_product done ...");
	      dfd.resolve(result.insertId);
	    }
	});
	return dfd;
}

function updateProductName(productId, productName, conn){
	var dfd = new Deferred();
	var sql = "update pure_ad_product set product_name = ? where product_id = ?";
	conn.query(sql, [productName,productId], function(err, result){
		if(err){
	      conn.rollback();
	      console.log("insert pure_ad_product error .", err);
	    }else{
	      console.log("++ insert one pure_ad_product done ...");
	      dfd.resolve();
	    }
	});
	return dfd;
}
