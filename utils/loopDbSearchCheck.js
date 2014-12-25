(function() {
    "use strict";

    var walk = require('walk');
    var fs = require('fs');
    var options = null;
    var walker = null;
    var path = require("path");

    var SRC_PATH = "C:\\Users\\Lenovo\\digitalSignage\\digitalSignage\\src\\main\\java\\jp\\microad\\digitalSignage";
//    var SRC_PATH = "C:\\tmp\\aa";
//    var SRC_PATH = "C:\\gitWorkspace\\monoliths_admin\\monoliths_admin\\src\\main\\java";

    options = {
        followLinks: false
    // directories with these keys will be skipped
    // , filters: ["Temp", "_Temp"]
    };

    walker = walk.walk(SRC_PATH, options);

    walker.on("directories", function(root, dirStatsArray, next) {
        // dirStatsArray is an array of `stat` objects with the additional
        // attributes
        // * type
        // * error
        // * name

        next();
    });

    walker.on("file", function(root, fileStats, next) {
        var fp = path.join(root, fileStats.name);
        fs.readFile(fp,{
           encode: "utf8" 
        }, function(err, result) {
            if(err){
                console.log(err);
                exit;
            }

            var resultArr = result.toString().replace(/\n\r/g, "\n").replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
            dealOneFile(resultArr, fileStats.name)
            next();
        });
    });

    walker.on("errors", function(root, nodeStatsArray, next) {
        next();
    });

    walker.on("end", function() {
        console.log("all done");
    });


    function dealOneFile(resultArr, fileName){
        var startLineIndex = null;
        var endLineIndex = null;
        var endBraceStr = null;
        var serviceFlg = false;
        var forBegineExp = new RegExp("for\\s?\\(");
        
        for(var i=0;i< resultArr.length; i++){
            
            var line = resultArr[i];
            var matchResult = forBegineExp.exec(line);
            if(startLineIndex == null && matchResult){
                startLineIndex = i;
                var matchIndex = matchResult.index;
                var preBlank = line.substring(0, matchIndex);
                endBraceStr = preBlank + "}";
            }
            if(startLineIndex != null && line.indexOf("service") != -1){
                serviceFlg = true;
            }
            if(startLineIndex != null && line.indexOf(endBraceStr) == 0){
                endLineIndex = i;
                
                if(serviceFlg){
                    console.log("-- find one loop db call -- ", fileName, (startLineIndex + 1), (endLineIndex + 1));
                }
                startLineIndex = null;
                endLineIndex = null;
                serviceFlg = false;
            }
        }
    }
}());