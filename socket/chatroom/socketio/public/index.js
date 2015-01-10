(function() {

    var socket = null;

    $(function() {
        initIo();
        initIoMessage();
        initUpdateUserList();
        initSetNameBtn();
        initSendMsgBtn();
        initUserListSelect();

        initName();
        preventFormSubmit();
    });

    function initIo() {
        socket = io.connect("http://localhost");
    }
    
    function initName(){
        var nameInCookie = $.cookie("chat_name");
        if(!nameInCookie){
            showSetNameDiv();
        }
    }

    function initSetNameBtn() {
        $("#setNameBtn").on("click", function() {
            var name = $("#name").val();
            $.cookie("chat_name", name);
            setName();
        });
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
                showErrorMsg(returnData.msg);
            }
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
        $("<a href='#' id='everyUser'>所有人</a>").appendTo($("#userList"));
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
        $("#userList").on("click", "#everyUser", function() {
            $("#userList .userItem").removeClass("selected");
        });
    }
    
    function getSelectUserName(){
        var selectedUser = $("#userList .userItem.selected");
        if(selectedUser.length == 0){
            return null;
        }else{
            return selectedUser.html();
        }
    }

    /**
     * send message to server
     */
    function initSendMsgBtn() {
        
        function send(){
            var content = $("#chatContent").val();
            var selectedName = getSelectUserName();
            if(selectedName == null){
                // no user is selected, send broadcast msg
                sendMsg(content);
            }else{
                // select one, send private message
                sendPrivateMsg(selectedName, content);
            }
            clearMsgText();
        }
        
        $("#sendMsgBtn").on("click", function() {
            send();
        });
        $("#chatContent").on("keypress", function(e) {
            var code = e.keyCode || e.which;
            if (code == 13) {
                // enter key
                send();
            }
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
            code : Constant.CODE.PRIVATE_MSG,
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
            privateMsg = "【" + from + "】"+ "对你说：" + msg;
        } else {
            privateMsg = "你说：" + msg;
        }
        $("<div></div>").addClass("privateMsg").html(privateMsg).appendTo($("#messages"));
    }
    
    function preventFormSubmit(){
        $("#messageForm, #nameForm").on("submit", function() {
            return false;
        });
    }

    function showSetNameDiv() {
        $("#setNameMask").show();
    }

    function hideSetNameDiv() {
        $("#setNameMask").hide();
    }

    function showErrorMsg(msg) {
        $("div.error").html(msg);
        $("div.error").show().delay(1500).fadeOut(500);
    }

})();