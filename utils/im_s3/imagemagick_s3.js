var im = require("imagemagick");
var path = require("path");
var fs = require("fs");
var async = require("async");
var mysql = require("mysql");
var s3 = require("./s3");

var originFilePath = "c:\\tmp\\base.png";
var outputPath = "c:\\tmp\\im";

/* HOME */
var conn = mysql.createConnection({
    host : 'localhost',
    port : '3306',
    database : "core_master_db",
    user : 'dev',
    password : 'password'
});

conn.connect();

function getContentId(next) {
    var sql = "select * from creative";
    conn.query(sql, function(err, result) {
        logError(err);

        result.forEach(function(item) {
            var coId = item.co_account_id;
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
                s3.uploadFile(dFileFullPath, dFileName);

            } else if ([ "ogv", "webm", "mp4", "site" ].indexOf(contentType) != -1) {
                // movie, thumbnail in local file system

                var oFileName = originFilePath;
                var dFileName = creativeId + "_1.jpg";
                var dFileFullPath = path.join(outputPath, coId, dFileName)
                var content = "locale " + "\r\n" + contentType + " - " + dFileName;
                if (!isFileExists(dFileFullPath)) {
                    convert(oFileName, dFileFullPath, content);
                    console.log("convert one file", dFileFullPath);
                } else {
                    console.log("file exists", dFileFullPath);
                }
            } else {
                // nothing todo

            }
        })
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

getContentId();