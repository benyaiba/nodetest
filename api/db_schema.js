var async = require("async");
var mysql = require("mysql");

var conn = null;
var config = null;

function createConnection(next){
    conn = mysql.createConnection({
        host     : config.host,
        port     : config.port,
        user     : config.username,
        password : config.password,
        database : config.database,
        timeout: 800
      });

    conn.connect(function(err){
        if(err){
            console.error(err);
        } else{
            console.info("connection created ");
        }
        next(err);
    });
}

//function handleError(next){
//    conn.on("error", function(err){
//       console.error("in global error handler", e);
//    });
//    next();
//}

function getSchema(next){
    conn.query("show full columns from ??", [config.tableName], function(err, rows){
        if(err){
            console.error(err);
        }else{
            console.info("query column successed !");
        }
        next(err, rows);
    });
}

function changeMysqlSchemaToJava(rows, next){
    var retArr = [];
    rows.forEach(function(row){
       var obj = {};
       obj.name = getVariableName(row["Field"]);
       obj.type = getDeclareTypes(row["Type"]);
       obj.comment = row["Comment"];
       obj.defaultValue = getDefaultValue(obj.type);
       retArr.push(obj);
    });
    next(null, retArr);
}

function output(rows, next){
    next(null, rows);
    conn.end();
}

function run(pConfig, callback) {
    config = pConfig;

    var runSequenceArr = [ createConnection, getSchema, changeMysqlSchemaToJava, output];
    async.waterfall(runSequenceArr, function(err, result) {
        if (err) {
            console.error("err in async", err);
        }else{
            console.info("async water fall succeed!");
        }
        callback(err, result);
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
    type = type.toLowerCase();
    if(type.indexOf("bigdecimal") != -1){
        return "BigDecimal";
    }
    if(type.match(/\bint/)){
        return "int";
    }
    if(type.indexOf("double") != -1){
        return "Double";
    }
    if(type.indexOf("float") != -1){
        return "Float";
    }
    if(type.indexOf("timestamp") != -1){
        return "Timestamp";
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
    if(type == "Date"){
        return "null";
    }
    if(type == "BigDecimal"){
        return "null";
    }
    if(type == "Timestamp"){
        return "null";
    }
    return null;
}
exports.run = run;
