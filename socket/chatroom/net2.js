var net = require("net");
var sockets = [];

var server = net.createServer(function(socket) {

    // 每个socket一个action，
    // action和socket相互依赖（相互依赖不好？）
    var action = new Action();
    action.setSocket(socket);
    socket.action = action;

    // 显示欢迎信息
    socket.action.welcome();

    var message = ""
    socket.on("data", function(data) {
        var input = data.toString();
        if (!/\r\n/.test(input)) {
            message += input;
        } else {
            // 读取到一行消息
            message = message.trim();
            Dispatcher.dispatch(socket, message);
            message = "";
        }
    });

    socket.on("end", function() {
        socket.action.leave();
    });
});

function UserInfo() {
    var name = null;
    this.setName = function(name){
        this.name = name;
    }
    this.getName = function(){
        return this.name;
    }
}

/**
 * 控制器
 */
function Action(){
    var socket = null;
    this.setSocket = function(s){
        socket = s;
    }

    this.welcome = function(){
        var ipAddress = socket.remoteAddress;
        socket.write("## welcom [" + ipAddress + "] and have a nice day ! ##\r\n");
        socket.write("# type \\help to show help message\r\n");
        socket.userInfo = new UserInfo();
        socket.userInfo.setName(ipAddress);
        sockets.push(socket);
    }

    this.leave = function(){
        removeOneSocket();
    }

    this.help = function(){
        socket.write("# \\who to check one line users\r\n");
        socket.write("# \\change_name mike, to change your name to mike\r\n");
        socket.write("# @mike xxx , to chat mike only\r\n");
        socket.write("# \\help to show this list\r\n");
    }

    this.who = function(){
        var names = getUserNameList();
        for (var i = 0; i < names.length; i++) {
            socket.write("# " + names[i] + "\r\n");
        }
    }

    this.changeName = function(message){
        var newName = message.replace("\\change_name ", "");
        var oldName = socket.userInfo.getName();
        socket.userInfo.setName(newName);
        socket.write("# change your name to [" + newName + "]\r\n");
        broadcast("# [" + oldName + "] change name to [" + newName + "]");
    }

    this.broadcast = function(message){
        broadcast(message);
    }

    this.sendMessage = function(message){
        var fromName = socket.userInfo.getName();
        var privateMsg = message.split(" ")[1];
        var toName = message.split(" ")[0].replace("@", "");
        var toSocket = findSocketByName(toName);
        if(!toSocket){
            socket.write("# sorry , user not found .\r\n");
        }else{
            toSocket.write("* [" + fromName + "] say to you: " + privateMsg + "\r\n");
        }
    }

    function broadcast(message) {
        for (var i = 0; i < sockets.length; i++) {
            var s = sockets[i];
            if (s == socket) {
                // not send to self
                continue;
            } else {
                if (socket) {
                    s.write("[" + socket.userInfo.getName() + "] " + message + "\r\n");
                } else {
                    s.write(message + "\r\n");
                }
            }
        }
    }

    function addOneSocket() {
        broadcast("# ++ [" + socket.userInfo.getName() + "]" + " join the chat #");
        sockets.push(socket);
    }

    function removeOneSocket() {
        var index = sockets.indexOf(socket);
        if (index == -1) {
            console.log("error - socket not found");
            return;
        }

        var leftUserName = socket.userInfo.getName();
        sockets.splice(index, 1);
        broadcast(leftUserName + " has left the room");
    }

    function findSocketByName(name) {
        for (var i = 0; i < sockets.length; i++) {
            var s = sockets[i];
            if (s.userInfo.getName() == name) {
                return s;
            }
        }
    }

    function getUserNameList() {
        var names = [];
        for (var i = 0; i < sockets.length; i++) {
            names.push(sockets[i].userInfo.getName());
        }
        return names;
    }
}

/**
 * socket请求的中央控制器，
 * 负责根据请求调用控制器中的各个方法 提供给一个类方法dispatch
 */
function Dispatcher(){}
Dispatcher.dispatch = function(socket, message){
    if (/^\\who$/.test(message)) {
        console.log("111111111");
        socket.action["who"](message);
        return;
    }
    if (/^\\help$/.test(message)) {
        socket.action["help"](message);
        return;
    }
    if (/^\\change_name\s.*$/.test(message)) {
        socket.action["changeName"](message);
        return;
    }
    if (/^@\w+\s.*$/.test(message)) {
        socket.action["sendMessage"](message);
        return;
    }
    socket.action["broadcast"](message);
}

server.listen(1234, "127.0.0.1");
