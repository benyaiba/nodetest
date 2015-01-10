(function() {

    var socket = null;

    $(function() {
        initIo();
        initIoMessage();
        initUpdateUserList();
        initSetNameBtn();
        initSendMsgBtn();
        initUserListSelect();

        setName();
    });

    function initIo() {
        socket = io.connect("http://localhost");
    }

    /**
     * set user name
     */
    function setName() {
        var nameInCookie = $.cookie("chat_name");
        socket.emit("name", {
            code : Constant.CODE.SET_NAME,
            msg : nameInCookie
        }, function(returnData) {
            if (returnData.code == Constant.CODE.OK) {
                // set user name ok
                hideSetNameDiv();
                socket.name = nameInCookie;
                showBroadcastMsg(null, returnData.msg);
            } else {
                // set user name ng, show set name mask
                var showErrorFlg = $("#setNameMask").css("display") != 'none';
                if (showErrorFlg) {
                    showErrorMsg(returnData.msg);
                } else {
                    showSetNameDiv();
                }
            }
        });
    }

    function initSetNameBtn() {
        $("#setNameBtn").on("click", function() {
            var name = $("#name").val();
            $.cookie("chat_name", name);
            setName();
        });
    }

    /**
     * show message from server
     */
    function initIoMessage() {
        socket.on("chat", function(data) {
            if (data.code == Constant.CODE.MSG) {
                showBroadcastMsg(data.from, data.msg);
            } else {
                showPrivateMsg(data.from, data.msg);
            }
        });
    }

    /**
     * update user list
     */
    function initUpdateUserList() {
        socket.on("userList", function(returnData) {
            var names = returnData.names;
            updateUserList(names);
        });
    }

    function updateUserList(names) {
        $("#userList").html("");
        for (var i = 0; i < names.length; i++) {
            var name = names[i];
            $("<div></div>").addClass("userItem").html(name).attr("title", name).appendTo($("#userList"));
        }
    }

    function initUserListSelect() {
        $("#userList").on("click", ".userItem", function() {
            $("#userList .userItem").removeClass("selected");
            $(this).addClass("selected");
        });
    }

    /**
     * send message to server
     */
    function initSendMsgBtn() {
        $("#sendMsgBtn").on("click", function() {
            var content = $("#chatContent").val();
            sendMsg(content);
            clearMsgText();
        });
        $("#chatContent").on("keypress", function(e) {
            var code = e.keyCode || e.which;
            if (code == 13) {
                // enter key
                var content = $("#chatContent").val();
                sendMsg(content);
                clearMsgText();
            }
        });
        $("#messageForm").on("submit", function() {
            return false;
        });
    }

    function sendMsg(content) {
        socket.emit("chat", {
            code : Constant.CODE.MSG,
            msg : content
        }, function(returnData) {
            if (returnData.code = Constant.CODE.OK) {
                showBroadcastMsg(socket.name, returnData.msg);
            }
        });
    }

    function sendPrivateMsg(toName, content) {
        socket.emit("chat", {
            code : Constant.CODE.MSG,
            toName : toName,
            msg : content
        }, function(returnData) {
            if (returnData.code = Constant.CODE.OK) {
                showPrivateMsg(null, returnData.msg);
            }
        });
    }

    function clearMsgText() {
        $("#chatContent").val("");
    }

    /**
     * show broadcast message
     */
    function showBroadcastMsg(from, msg) {
        var broadcastMsg = null;
        var className = null;
        if (from) {
            broadcastMsg = "【" + from + "】说：" + msg;
            className = "userBroadcastMsg";
        } else {
            broadcastMsg = msg;
            className = "systemBroadcastMsg";
        }
        $("<div></div>").addClass(className).html(broadcastMsg).appendTo($("#messages"));
    }

    /**
     * show private message
     */
    function showPrivateMsg(from, msg) {
        var privateMsg = null;
        if (from) {
            privateMsg = from + "对你说：" + msg;
        } else {
            privateMsg = "你说：" + msg;
        }
        $("<div></div>").addClass("privateMsg").html(privateMsg).appendTo($("#messages"));
    }

    function showSetNameDiv() {
        $("#setNameMask").show();
    }

    function hideSetNameDiv() {
        $("#setNameMask").hide();
    }

    function showErrorMsg() {
        $("div.error").show().delay(1500).fadeOut(500);
    }

})();