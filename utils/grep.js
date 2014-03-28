// usage:
// node <main program js> <file> <exp> <encoding>
// example: > node test_grep test_grep_file.txt h

var fs = require('fs');

function grep(sourceFile, exp, encoding){
  var result = [];
  
  if(encoding == undefined){
    encoding = "utf8";
  }
  fs.readFile(sourceFile, {encoding: encoding},function(err, data){
    if(err){
      console.log("err!!", err);
    }else{
      data.split(/\r\n/).forEach(function(item){
        if(new RegExp(exp).test(item)){
          result.push(item);
        }
      });
      console.log(result.join("\r\n"));
    }
  });
}

function rgrep(sourceFile, exp, encoding){
  var result = [];
  
  if(encoding == undefined){
    encoding = "utf8";
  }
  fs.readFile(sourceFile, {encoding: encoding},function(err, data){
    if(err){
      console.log("err!!", err);
    }else{
      data.split(/\r\n/).forEach(function(item){
        if(new RegExp(exp).test(item)){
          result.push(item);
        }
      });
      console.log(result.join("\r\n"));
    }
  });
}

exports.grep = grep;
exports.rgrep = rgrep;