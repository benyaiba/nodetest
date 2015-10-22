var fs = require("fs");
var knox = require("knox");
var client = knox.createClient({
    key : "xx",
    secret : "xx/ojO95",
    bucket : "zhao-test1"
});

function list(callback){
    var resultArr = [];
    client.list({prefix: ""}, function(err, result){
        result.Contents.forEach(function(item){
//            console.log(item);
            resultArr.push(item.Key);
        });
        callback(resultArr);
    });
}

function uploadFile(sourcePath, destPath) {
    var req = client.putFile(sourcePath, destPath, function(err, data) {
        if (err) {
            console.log(err)
        } else {
            console.log("upload to S3 done ...", destPath);
            fs.unlink(sourcePath, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("delete origin file - ", sourcePath);
                }
            })
        }
    });
}

//list();

//var s = "c:\\tmp\\im\\12_1.jpg";
//var d = "\\im\\12_1.jpg";
//uploadFile(s,d);

exports.uploadFile = uploadFile;
exports.list = list;