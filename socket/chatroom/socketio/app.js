var express = require("express");
var app = express();
var server = require('http').Server(app);
var io = require("socket.io")(server);

var Constant = require("./public/common/Constant.js").Constant;
var sockets = [];

app.use(express.static(__dirname + "/public"));
server.listen(3000, function(err) {
    if (!err) {
        console.log("server started on port 3000 ...");
    }
});

io.on("connection", function(socket) {

    sockets.push(socket);

    socket.on("disconnect", function() {
        var leftUserName = socket.name;
        var index = sockets.indexOf(socket);
        sockets.splice(index, 1);
        socket.broadcast.emit("chat", {
            code: Constant.CODE.MSG,
            msg: "【" + leftUserName + "】离开了聊天室"
        });
    });

    // name setting
    socket.on("name", function(data, callback) {
        if (data.code == Constant.CODE.SET_NAME) {
            // set user name
            var name = data.msg.trim();
            if (name == null) {
                // NG blank name
                callback({
                    code : Constant.CODE.NG,
                    msg : "名字不能为空。"
                });
            } else if (getSocketByName(name) != null) {
                // NG exists name
                callback({
                    code : Constant.CODE.NG,
                    msg : "名字已经被使用了，换个新的。"
                });
            } else {
                // OK name
                callback({
                    code : Constant.CODE.OK,
                    msg : "成功登陆聊天室，您的名字是【" + name + "】。"
                });
                socket.name = name;
                updateUserList(socket);
                socket.broadcast.emit("chat", {
                    code : Constant.CODE.MSG,
                    msg : "欢迎【" + name + "】进入聊天室。"
                });
            }
        }
    });

    // chat
    socket.on("chat", function(data, callback) {
        if (data.code == Constant.CODE.MSG) {
            // broadcast message
            socket.broadcast.emit("chat", {
                code : Constant.CODE.MSG,
                from : socket.name,
                msg : data.msg
            });
            if (callback) {
                callback({
                    code : Constant.CODE.OK,
                    msg : data.msg
                });
            }
        } else {
            // private messag
            var toName = data.toName;
            var toSocket = getSocketByName(toName);
            toSocket.emit("chat", {
                code : Constant.CODE.PRIVATE_MSG,
                from : socket.name,
                msg : data.msg
            });
            callback({
                code : Constant.CODE.OK,
                msg : data.msg
            });
        }
    });
});

function updateUserList(socket) {
    var userNames = getAllUserList(socket);
    // update all others
    socket.broadcast.emit("userList", {
        code : Constant.CODE.UPDATE,
        names : userNames
    });
    // update this socket too
    socket.emit("userList", {
        code : Constant.CODE.UPDATE,
        names : userNames
    });
}

function getAllUserList() {
    var names = [];
    for (var i = 0; i < sockets.length; i++) {
        var s = sockets[i];
        names.push(s.name);
    }
    return names;
}

function getSocketByName(name) {
    for (var i = 0; i < sockets.length; i++) {
        var s = sockets[i];
        if (s.name == name) {
            return s;
        }
    }
    return null;
}