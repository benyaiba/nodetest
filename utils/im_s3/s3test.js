var fs = require("fs");
var knox = require("knox");
var client = knox.createClient({
    key : 'xxx',
    secret : 'xxxojO95',
    bucket : 'zhaohs-t1'
});


function list(){
    client.list({prefix: ""}, function(err, result){
        result.Contents.forEach(function(item){
            console.log(item.Key);
        })
    });
}

function get(){
    var s3Path = "/content/cp/111.txt";
    client.getFile(s3Path,function(err, result){
        if(err){
            console.log(err);
        }else{
            console.log(result);
        }
    })
}

list();
//get();
