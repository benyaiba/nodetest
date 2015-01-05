var net = require("net");
var sockets = [];

var server = net.createServer(function(socket) {
    var userChecker = new UserChecker();
    var currentStatus = userChecker.status.requireName;
    socket.userInfo = new UserInfo();

    userChecker.requireName(socket, message);
    currentStatus = userChecker.status.inputName;

    socket.on("end", function() {
        removeOneSocket(socket);
    });

    var message = ""
    socket.on("data", function(data) {
        var str = data.toString();
        if (!/\r\n/.exec(str)) {
            message += str;
        } else {

            // already input user name
            if(currentStatus == userChecker.status.ok){
                broadcast(message, socket);
                message = "";
                return;
            }

            // require name and name confirm
            if (currentStatus == userChecker.status.inputName) {
                var result = userChecker.inputName(socket, message);
                if(result == true){
                    userChecker.requireConfirm(socket, message);
                    currentStatus = userChecker.status.inputConfirm;
                }else{
                    userChecker.requireName(socket, message);
                }
                message = "";
                return;
            }
            if (currentStatus == userChecker.status.inputConfirm) {
                var result = userChecker.inputConfirm(socket, message);
                if(result == true){
                    currentStatus = userChecker.status.ok;
                    userChecker.ok(socket);
                    addOneSocket(socket);
                }else{
                    userChecker.requireName(socket, message);
                    currentStatus = userChecker.status.inputName;
                }
                message = "";
                return;
            }
        }
    })

    function broadcast(message, socket) {
        for (var i = 0; i < sockets.length; i++) {
            var s = sockets[i];
            if(s == socket){
                // not send to self
                continue;
            }else{
                if(socket){
                    s.write("[" + socket.userInfo.name + "] " + message + "\r\n");
                }else{
                    s.write(message + "\r\n");
                }
            }
        }
    }

    function addOneSocket(socket) {
        broadcast("[" + socket.userInfo.name + "]" + " * join the chat *");
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

function UserChecker(){
    this.status = {
            requireName: "requireName",
            inputName: "inputName",
            requireConfirm: "requireConfirm",
            inputConfirm: "inputConfirm",
            ok: "ok"
    }

    this.requireName = function(socket, message){
        socket.write("please input your name\r\n");
    }
    this.inputName = function(socket, message){
        var msg = message.trim();
        if(!msg || msg == ""){
            return false;
        }else{
            socket.userInfo.name = message;
            return true;
        }
    }
    this.requireConfirm = function(socket, message){
        socket.write("your name is [%s] , is that ok ? (y/n)\r\n".replace("%s", socket.userInfo.name));
    }
    this.inputConfirm = function(socket, message){
        var msg = message.trim();
        if(!/^(y|n)$/.test(message) || message == "n"){
            return false;
        }else {
            socket.userInfo.confirmFlg = true;
            return true;
        }
    }
    this.ok = function(socket, message){
       socket.write("-- welcome , have a nice day ~ -- \r\n");
    }
}

//function UserChecker(socket, message) {
//    this.socket = socket;
//    this.message = message;
//
//    var currentStatus = "NONAME";
//    this.statusMap = {
//        "NONAME": {
//            message: "please input your name\r\n",
//            expectValue: /./,
//            judgeStatus: function() {
//                if (!this.socket.name || !this.socket.userInfo.name) {
//                    return true;
//                }
//            },
//            goNext: (function() {
//                this.socket.userInfo.name = message;
//                currentStatus = "NOCONFIRM";
//            }).bind(this)
//        },
//
//        "NOCONFIRM": {
//            message: (function(socket) {
//                return "your name is [%field1], is that ok? (y/n)\r\n".replace("%field1", this.socket.userInfo.name);
//            }).bind(this),
//            expectValue: /^(y|n)$/,
//            judgeStatus: function() {
//                if (this.socket.name || this.socket.userInfo.confirmFlg == false) {
//                    return true;
//                }
//            },
//            goNext: function() {
//                if (message == "y") {
//                    this.socket.userInfo.confirmFlg = true;
//                    currentStatus = "OK";
//                } else {
//                    this.socket.userInfo.name = "";
//                    currentStatus = "NONAME";
//                }
//            }
//        },
//        "OK": {}
//    }
//
//    this.isValid = function() {
//
//        if (currentStatus == "OK") {
//            return true;
//        } else {
//
//            var statusObj = this.statusMap[currentStatus];
//            var msg = this.message.trim();
//            if (msg == "" || !statusObj.expectValue.test(msg)) {
//                socket.write(getMessage(statusObj["message"]));
//            } else {
//                statusObj["goNext"]();
//            }
//        }
//    }
//
//    function getMessage(fnOrString) {
//        if (typeof (fnOrString) == "function") {
//            return fnOrString(this.socket);
//        } else {
//            return fnOrString;
//        }
//    }
//}

function UserInfo() {
    var userName = null;
    var confirmFlg = false;

    this.setConfirmFlg = function(flg) {
        confirmFlg = flg;
    }

    this.getConfirmFlg = function() {
        return confirmFlg;
    }

    this.setUserName = function(ua) {
        userName = ua;
    }
    this.getUserName = function() {
        return ua;
    }
}

server.listen(1234, "192.168.196.142");
