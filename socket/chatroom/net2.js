var net = require("net");
var sockets = [];



var server = net.createServer(function(socket) {

    var message = ""
    socket.on("data", function(data) {
        var input = data.toString();
        if (!/\r\n/.test(input)) {
            message += input;
        } else {
            // get one line input
            
            message = message.trim();
            if (status < STATUS.name_ok) {
                // need set user name, first
            } else {
                // run command or broadcast chat
            }
            message = "";
        }
        

        
        function execCommand(message){
            status = STATUS.name_ok;
            if (/^\\who$/.test(message)) {
                status = STATUS.command_who;
            }
            if (/^\\help$/.test(message)) {
                status = STATUS.command_help;
            }
            if (/^\\change_name\s.*$/.test(message)) {
                status = STATUS.command_change_name;
            }
            if (/^@\w+\s.*$/.test(message)) {
                status = STATUS.command_private;
            }

            switch (status) {
            case STATUS.command_help:
                socket.write("# \\who to check one line users\r\n");
                socket.write("# \\change_name mike, to change your name to mike\r\n");
                socket.write("# @mike xxx , to chat mike only\r\n");
                socket.write("# \\help to show this list\r\n");
                break;
            case STATUS.command_who:
                var names = getUserNameList();
                for (var i = 0; i < names.length; i++) {
                    socket.write("# " + names[i] + "\r\n");
                }
                break;
            case STATUS.command_change_name:
                var newName = message.replace("\\change_name ", "");
                var oldName = socket.userInfo.name;
                socket.userInfo.name = newName;
                socket.write("# change your name to [" + newName + "]\r\n");
                broadcast("# [" + oldName + "] change name to [" + newName + "]");
                break;
            case STATUS.command_private:
                var fromName = socket.userInfo.name;
                var privateMsg = message.split(" ")[1];
                var toName = message.split(" ")[0].replace("@", "");
                var toSocket = findSocketByName(toName);
                if(!toSocket){
                    socket.write("# sorry , user not found .\r\n");
                }else{
                    toSocket.write("* [" + fromName + "] say to you: " + privateMsg + "\r\n");
                }
                break;
            default:
                broadcast(message, socket);
            }
        }
    });

    socket.on("end", function() {
        removeOneSocket(socket);
    });

    function findSocketByName(name) {
        for (var i = 0; i < sockets.length; i++) {
            var s = sockets[i];
            if (s.userInfo.name == name) {
                return s;
            }
        }
    }

    function getUserNameList() {
        var names = [];
        for (var i = 0; i < sockets.length; i++) {
            names.push(sockets[i].userInfo.name);
        }
        return names;
    }

    function broadcast(message, socket) {
        for (var i = 0; i < sockets.length; i++) {
            var s = sockets[i];
            if (s == socket) {
                // not send to self
                continue;
            } else {
                if (socket) {
                    s.write("[" + socket.userInfo.name + "] " + message + "\r\n");
                } else {
                    s.write(message + "\r\n");
                }
            }
        }
    }

    function addOneSocket(socket) {
        broadcast("++ [" + socket.userInfo.name + "]" + " join the chat *");
        sockets.push(socket);
    }

    function removeOneSocket(socket) {
        var index = sockets.indexOf(socket);
        if (index == -1) {
            console.log("error - socket not found");
            return;
        }

        var leftUserName = socket.userInfo.name;
        sockets.splice(index, 1);
        broadcast(leftUserName + " has left the room");
    }
});

function UserInfo() {
    var userName = null;

    this.setUserName = function(ua) {
        userName = ua;
    }
    this.getUserName = function() {
        return ua;
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
    
    this.who = function(){
        
    }
    
    this.help = function(){
        
    }
    
    this.changeName = function(){
        
    }
    
    this.sentMessage = function(){
        
    }
}

/**
 * socket请求的中央控制器，负责根据请求调用控制器中的各个方法
 * 提供给一个类方法dispatch
 */
function Dispatcher(){}
Dispatcher.dispatch = function(message){
    if (/^\\who$/.test(message)) {
        socket.action["who"](message);
    }
    if (/^\\help$/.test(message)) {
        socket.action["help"](message);
    }
    if (/^\\change_name\s.*$/.test(message)) {
        socket.action["changeName"](message);
    }
    if (/^@\w+\s.*$/.test(message)) {
        socket.action["sendMessagePrivate"](message);
    }
}

server.listen(1234, "127.0.0.1");
