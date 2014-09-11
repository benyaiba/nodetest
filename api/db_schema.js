var async = require("async");
var mysql = require("mysql");

var conn = null;

function createConnection(next){
    conn = mysql.createConnection({
        host     : '192.168.196.8',
        port: "9515",
        user     : 'dev',
        password : 'password',
        database: "ssp_pub_site_db"
      });

    conn.connect(function(err){
        if(err){
            console.error(err);
            return;
        }
        console.info("connection created ");
        next();
    });
}

function handleError(next){
    conn.on("error", function(err){
       console.error("in global error handler", e);
    });
    next();
}

function getSchema(next){
    conn.query("show columns from ??", ["allowed_account_ssp_pub_site"], function(err, rows){
        if(err){
            console.error(err);
            return;
        }
        next(null, rows);
    })
}

function changeMysqlSchemaToJava(rows, next){
    var retArr = [];
    rows.forEach(function(row){
       var obj = {};
       obj.name = getVariableName(row["Field"]);
       obj.type = getDeclareTypes(row["Type"]);
       obj.defaultValue = getDefaultValue(obj.type);
       retArr.push(obj);
    });
    next(null, retArr);
}

function output(rows, next){
    next(null, rows);
    conn.end();
}

function run(callback) {
    var runSequenceArr = [ createConnection, handleError, getSchema, changeMysqlSchemaToJava, output];

    var ret = null;
    async.waterfall(runSequenceArr, function(err, result) {
        if (err) {
            console.error("err in async", err);
            return;
        }
        callback(result);
    });
}

function getVariableName(dbName){
    var nameArr = dbName.split("_");
    var resultName = "";
    nameArr.forEach(function(name, index){
        if(index == 0){
            resultName += name;
        }else{
            resultName += name.substring(0,1).toUpperCase();
            resultName += name.substring(1);
        }
    });
    return resultName;
}

function getDeclareTypes(type){
    var type = type.toLowerCase();
    if(type.indexOf("bigdecimal") != -1){
        return "BigDecimal";
    }
    if(type.match(/\bint/)){
        return "Long";
    }
    if(type.indexOf("double") != -1){
        return "Double";
    }
    if(type.indexOf("float") != -1){
        return "Float";
    }
    if(type.indexOf("timestamp") != -1){
        return "TimeStamp";
    }
    if(type.indexOf("date") != -1){
        return "Date";
    }
    return "String";
}

function getDefaultValue(type){
    if(type == "Long"){
        return "0L";
    }
    if(type == "String"){
        return "null";
    }
    if(type == "Double"){
        return "0d";
    }
    if(type == "Float"){
        return "0f";
    }
    if(type == "int"){
        return "0";
    }
    if(type == "date"){
        return "null";
    }
    if(type == "BigDecimal"){
        return "null";
    }
    if(type == "TimeStamp"){
        return "null";
    }
}
exports.run = run;
