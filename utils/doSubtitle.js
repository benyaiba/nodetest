var fs = require("fs");
var path = require("path");

var filePath = "C:\\Users\\zhao_hongsheng\\Desktop\\tmp";
var fileName = "the.walking.dead.s04e16.720p.hdtv.x264-killers.eng&chs.srt";
var encoding = "utf8";
var fullpath = path.join(filePath, fileName);
fs.readFile(fullpath, {encoding: encoding}, function(err, datas){
  if(err) throw err;
  var resultArr = [];
  var pairFlg = false;
  var pairArr = [];
  var pairCount = 0;
  var subtitleConnt = 1;
  datas.split("\r\n").forEach(function(line){
    if((/^\d+$/.test(line) && subtitleConnt == parseInt(line, 10)) || pairFlg == true){
      pairCount ++;
      pairFlg = true;
      if(pairCount == 1 || pairCount == 2){
        // pairCount for four lines
        // line 1 -- the subtitleCount (skip)
        // line 2 -- time (skip)
        // line 3 -- chinese
        // line 4 -- english
        
        // nothing to do , just go next loop
      }else{
        pairArr.push(line);
        if(pairCount == 4){
          resultArr.push(pairArr);
          pairCount = 0;
          pairArr = new Array();
          pairFlg = false;
          subtitleConnt ++;
        }
      }
    }
  });
  var len = getLongestEnglish(resultArr);
  resultArr = reFormatResultArr(resultArr, len);
  fs.writeFile(path.join(filePath, "result"), getContentString(resultArr), function(err, result){
    if(err) throw err;
  });
  
});

function getContentString(resultArr){
  var ret = "";
  resultArr.forEach(function(item){
    var line = item.join(" | ");
    ret += (ret == "" ? "": "\r\n");
    ret += line;
  });
  return ret;
}

function reFormatResultArr(resultArr, len){
  var ret = [];
  resultArr.forEach(function(item){
    ret.push([appendToLength(len, item[1]), item[0]]);
  });
  return ret;
}

function getLongestEnglish(resultArr){
  var ret = 0;
  resultArr.forEach(function(item){
    if(item[1].length > ret){
      ret = item[1].length;
    }
  });
  return ret;
}

function appendToLength(len, str){
  if(str.length >= len){
    return str;
  }else{
    var blanks = "";
    for(var i = 0; i< len - str.length; i++){
      blanks += " ";
    }
    str += blanks;
    return str;
  }
}