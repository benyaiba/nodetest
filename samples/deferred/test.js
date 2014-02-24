var Deferred = require("Deferred");

var dfd = new Deferred();
function p(){
	console.log("done ... qq");
}

dfd.done(p).fail(function(){
	console.log("fail");
});

setTimeout(function(){
	dfd.resolve();
},1000);