var im = require("imagemagick");
var path = require("path");
var fs = require("fs");
var async = require("async");
var mysql = require("mysql");
var s3 = require("./s3");

var originFilePath = "c:\\tmp\\base.png";
var outputPath = "C:\\mnt\\contents\\monoliths_cloud\\creative";

/* HOME */
//var conn = mysql.createConnection({
//    host : 'localhost',
//    port : '3306',
//    database : "core_master_db",
//    user : 'dev',
//    password : 'password'
//});

/* dev */
var conn = mysql.createConnection({
    host : '192.168.196.10',
    port : '5301',
    database : "core_master_db",
    user : 'root',
    password : 'password'
});

/* ST */
//var conn = mysql.createConnection({
//    host : '192.168.196.10',
//    port : '9540',
//    database : "core_master_db",
//    user : 'root',
//    password : 'password'
//});

conn.connect();

var s3FileArr = [];

function main(){
    async.waterfall([createPath, getS3FileList, createFiles], function(err){
        logError(err);
        console.log("all done");
    })
}

function getS3FileList(next) {
    s3FileList = s3.list(function(nameArr){
        s3FileArr = nameArr;
        next();
    });
}

function createFiles(next) {
    var sql = "select * from creative limit 0,1";
    conn.query(sql, [], function(err, result) {
        logError(err);
        result.forEach(function(item) {
            var coId = item.co_account_id + "";
            var contentType = item.content_type;
            var creativeId = item.creative_id;
            // console.log(contentType, creativeId);
            if ([ "jpg", "gif", "png" ].indexOf(contentType) != -1) {
                // image upload file to s3

                // create in local file system
                var oFileName = originFilePath;
                var dFileName = creativeId + "_1.jpg";
                var dFileFullPath = path.join(outputPath, coId, dFileName)
                var content = "S3 " + "\r\n" + contentType + " - " + dFileName;
                if (!isFileExists(dFileFullPath)) {
                    convert(oFileName, dFileFullPath, content);
                    console.log("convert one file", dFileFullPath);
                } else {
                    console.log("file exists", dFileFullPath);
                }
                // upload to s3
                if(s3FileArr.indexOf(dFileName) == -1){
                    s3.uploadFile(dFileFullPath, dFileName);
                }else {
                    console.log("[s3 check] already exists file", dFileName);
                }

            } else if ([ "ogv", "webm", "mp4", "site" ].indexOf(contentType) != -1) {
                // movie, thumbnail in local file system

                var oFileName = originFilePath;
                var dFileName = creativeId + "_1.jpg";
                var dFileFullPath = path.join(outputPath, coId, dFileName)
                var content = "locale " + "\r\n" + contentType + " - " + dFileName;
                if (!isFileExists(dFileFullPath)) {
                    convert(oFileName, dFileFullPath, content);
                    console.log("[locale] convert one file", dFileFullPath);
                } else {
                    console.log("file exists", dFileFullPath);
                }
            } else {
                // nothing todo

            }
        })
    });
}

function createPath(next){
    var coIds = [];
    var sql = "select * from creative";
    conn.query(sql, function(err, data){
        data.forEach(function(item){
            coIds.push(item.co_account_id + "");
        })

        coIds.forEach(function(id){
            var dir = path.join(outputPath, id);
            if(!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }
        });
        console.log("dir create done ...");
        next();
    });
}

function isFileExists(path) {
    return fs.existsSync(path);
}

function convert(originPath, destPath, content) {
    im.convert([ originFilePath, "-pointsize", "35", "-fill", "green", "-draw", "text 0,100 '" + content + "'",
            destPath ], function(err) {
        logError(err);
    });
}

function logError(e) {
    if (e) {
        console.log(e);
    }
}

main();