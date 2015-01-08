var express = require("express");
var app = express();
var server = require('http').Server(app)
var io = require("socket.io")(server);

app.use(express.static(__dirname + "/public"));
server.listen(3000, function(err){
    if(!err){
        console.log("server started on port 3000 ...")
    }
});


io.on("connection", function(socket){
});

io.on("login", function(data){

})

