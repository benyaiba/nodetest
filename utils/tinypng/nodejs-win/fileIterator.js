/**
 * iterator specified dir and find all png files
 */

var fs = require('fs');

function getExtension(filename) {
	var i = filename.lastIndexOf('.');
	return (i < 0) ? '' : filename.substr(i + 1);
}

/**
 * iterate find files
 */
var walk = function(dir, done, recursiveFlg) {
	var results = [];
	fs.readdir(dir, function(err, list) {
		if (err)
			return done(err);
		var i = 0;
		(function next() {
			var file = list[i++];
			if (!file)
				return done(null, results);
			file = dir + '\\' + file;
			fs.stat(file, function(err, stat) {
				if (stat && stat.isDirectory()) {
					if(recursiveFlg){
						walk(file, function(err, res) {
							results = results.concat(res);
							next();
						}, recursiveFlg);
					}else{
						next();
					}
				} else {
					var fileExtName = getExtension(file);
					if (fileExtName.toLowerCase() == "png") {
						results.push(file);
					}
					next();
				}
			});
		})();
	});
};

// test
//walk("C:\\home", function() {
//	console.log(arguments[1]);
//}, false);

exports.walk = walk;