var aop = require("./aop");


function Person(name){
    this.name = name;

    this.say = function(){
        console.log("hello from ", this.name);
    };
}

var p = new Person("zhaohs");
p.say();

console.log(" --- add before aspect ---");

aop.before(p, "say", function(){
    console.log("--- in before aspect -- name is", this.name );
});
p.say();