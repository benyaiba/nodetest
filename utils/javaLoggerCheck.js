(function () {
  "use strict";

  var walk = require('walk')
    , fs = require('fs')
    , path = require('path')
    , options
    , walker
    ;
  var PATH = "C:\\gitWorkspace\\monoliths_admin\\monoliths_admin\\src\\main\\java"

  // To be truly synchronous in the emitter and maintain a compatible api,
  // the listeners must be listed before the object is created
  options = {
    listeners: {
      names: function (root, nodeNamesArray) {
        nodeNamesArray.sort(function (a, b) {
          if (a > b) return 1;
          if (a < b) return -1;
          return 0;
        });
      }
    , directories: function (root, dirStatsArray, next) {
        // dirStatsArray is an array of `stat` objects with the additional attributes
        // * type
        // * error
        // * name
        //console.log(root);
        next();
      }
,
file: function(root, fileStats, next) {
	var fp = path.join(root, fileStats.name);
	var hasLogger = false;
	var isDif = false;
	var className = null;
  var loggerName = null;
	fs.readFile(fp, {
		encode: 'utf8'
	},
	function(err, data) {
		if (err) throw err;
		var dataArr = data.toString().split("\r\n");
		for (var i = 0; i < dataArr.length; i++) {
			var line = dataArr[i];
			var matches = line.match(new RegExp("LoggerFactory.getLogger.*?\\((.*?)\\.class"));
			if (matches != null) {
        loggerName = matches[1];
			}
			matches = line.match(new RegExp("public\\sclass\\s(.*?)\\s"));
			if (matches != null) {
        className = matches[1];
			}
		}
    if(loggerName != null && className != loggerName){
      console.log(className, loggerName);
    }
	});
}
    , errors: function (root, nodeStatsArray, next) {
        next();
      }
    }
  };

  walker = walk.walkSync(PATH, options);

  console.log("all done");
}());