var express = require("express");
var app = express();
var server = require('http').Server(app);
var io = require("socket.io")(server);

var Constant = require("common/Constant").Constant;
var sockets = [];

app.use(express.static(__dirname + "/public"));
server.listen(3000, function(err) {
    if (!err) {
        console.log("server started on port 3000 ...");
    }
});

io.on("connection", function(socket) {

    sockets.push(socket);

    sockets.on("disconnect", function() {
        var leftUserName = socket.name;
        var index = sockets.indexOf(socket);
        sockets.splice(index, 1);
        socket.broadcast.emit("【" + leftUserName + "】离开了聊天室");
    });

    // name setting
    socket.on("name", function(data, callback) {
        if (data.code == Constant.CODE.setName) {
            // set user name
            var name = data.msg.trim();
            if (name == null) {
                // NG blank name
                callback({
                    code: Constant.CODE.NG,
                    msg: ""
                });
            } else if (getSocketByName(name) != null) {
                // NG exists name
                callback({
                    code: Constant.CODE.NG_EXISTS,
                    msg: ""
                });
            } else {
                // OK name
                callback({
                    code: Constant.CODE.OK,
                    msg: "成功登陆聊天室，您的名字是【" + name + "】"
                });
                socket.name = name;
                socket.broadcast.emit({
                    code: Constant.CODE.MSG,
                    msg: "欢迎【" + name + "】进入聊天室"
                });
            }
        }
    });

    // chat
    socket.on("chat", function(data, callback) {
        if (data.code == Constant.CODE.MSG) {
            // broadcast message
            socket.broadcast.emit({
                code: Constant.CODE.OK,
                msg: data.msg
            });
            callback({
                code: Constant.CODE.OK,
                msg: data.msg
            });
        } else {
            // private messag
            var toName = data.toName;
            var toSocket = getSocketByName(toName);
            toSocket.emit({
                code: Constant.CODE.PRIVATE_MSG,
                msg: data.msg
            });
            callback({
                code: Constant.CODE.OK,
                msg: data.msg
            });
        }
    });
});

function getSocketByName(name) {
    for (var i = 0; i < sockets.length; i++) {
        var s = sockets[i];
        if (s.name == name) {
            return s;
        }
    }
    return null;
}