(function() {
    "use strict";

    var walk = require('walk');
    var fs = require('fs');
    var options = null;
    var walker = null;
    var path = require("path");

    var SRC_PATH = "C:\\gitWorkspace\\monoliths_admin\\monoliths_admin\\src\\main\\java";

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
        fs.readFile(fp, function(err, result) {
            if(err){
                console.log(err);
                exit;
            }

            console.log(result.length);
            next();
        });
    });

    walker.on("errors", function(root, nodeStatsArray, next) {
        next();
    });

    walker.on("end", function() {
        console.log("all done");
    });


    function dealOneFile(resultArr){
        for(var i=0;i< resultArr.length; i++){
            if()
        }
    }
}());