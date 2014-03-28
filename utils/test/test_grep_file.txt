var grep = require("../grep");
var path = require("path");

// > node test_grep test_grep_file.txt h
var cp = process.cwd();
var source = process.argv[2];
var exp = process.argv[3];
var encoding = process.argv[4];

grep.grep(source, exp, encoding);
