(function() {

    var socket = null;
    var MSG = {
            BROADCAST_SENT_CALLBACK:1,
            BROADCAST_GET: 2,
            BROADCASE_SYSTEM: 3,
            BROADCASE_WARNING: 4,
            PRIVATE_SENT_CALLBACK: 5,
            PRIVATE_GET: 6
    };

    $(function() {
        initIo();
        
        // get message from server
        initIoMessage();
        initUpdateUserList();
        
        // send message to server
        initSetNameBtn();
        initSendMsgBtn();
        
        // js associate user operation
        initUserListSelect();

        // init js
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
        }else{
            setName();
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
                showMessage(MSG.BROADCASE_SYSTEM, null, returnData.msg);
            } else {
                // set user name ng, show set name mask
                showSetNameDiv();
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
                var messageType = data.from ? MSG.BROADCAST_GET : MSG.BROADCASE_SYSTEM;
                showMessage(messageType, data.from, data.msg);
            } else {
                showMessage(MSG.PRIVATE_GET, data.from, data.msg);
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
            $("<div></div>").addClass("userItem").text(name).attr("title", name).appendTo($("#userList"));
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
            return selectedUser.text();
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
            if (returnData.code == Constant.CODE.OK) {
                showMessage(MSG.BROADCAST_SENT_CALLBACK, socket.name, returnData.msg);
            }else{
                showMessage(MSG.BROADCASE_WARNING, null, returnData.msg);
            }
        });
    }

    function sendPrivateMsg(toName, content) {
        socket.emit("chat", {
            code : Constant.CODE.PRIVATE_MSG,
            toName : toName,
            msg : content
        }, function(returnData) {
            if (returnData.code == Constant.CODE.OK) {
                showMessage(MSG.PRIVATE_SENT_CALLBACK, toName, returnData.msg);
            }else {
                showMessage(MSG.BROADCASE_WARNING, null, returnData.msg);
            }
        });
    }

    function clearMsgText() {
        $("#chatContent").val("");
    }
  
    /**
     * show message
     */
    function showMessage(messageType, name, msgContent){
        var className = "";
        
        switch (messageType){
        
        case MSG.BROADCASE_SYSTEM:
            className = "systemBroadcastMsg";
            $("<div></div>").addClass(className).text(msgContent).appendTo($("#messages"));
            break;
            
        case MSG.BROADCASE_WARNING:
            className = "systemBroadcastMsg systemWarning";
            $("<div></div>").addClass(className).text(msgContent).appendTo($("#messages"));
            break;
            
        case MSG.BROADCAST_GET:
            msgContent = "【" + name + "】说：" + msgContent;
            className = "userBroadcastMsg";
            $("<div></div>").addClass(className).text(msgContent).appendTo($("#messages"));
            break;
            
        case MSG.BROADCAST_SENT_CALLBACK:
            msgContent = "【" + name + "】说：" + msgContent;
            className = "userBroadcastMsg";
            $("<div></div>").addClass(className).text(msgContent).appendTo($("#messages"));
            break;
            
        case MSG.PRIVATE_GET:
            className = "privateMsgOther";
            msgContent = "【" + name + "】"+ "悄悄对你说：" + msgContent;
            $("<div></div>").addClass(className).text(msgContent).appendTo($("#messages"));
            break;
            
        case MSG.PRIVATE_SENT_CALLBACK:
            className = "privateMsgSelf";
            msgContent = "你悄悄的对【" + name + "】"+ "说：" + msgContent;
            $("<div></div>").addClass(className).text(msgContent).appendTo($("#messages"));
            break;
        }
        
        $("#messages").scrollTop($("#messages").get(0).scrollHeight);
    }
    
    function preventFormSubmit(){
        $("#messageForm, #nameForm").on("submit", function() {
            return false;
        });
    }

    function showSetNameDiv() {
        $("#setNameMask").show();
        $("#name").focus();
    }

    function hideSetNameDiv() {
        $("#setNameMask").hide();
    }

    function showErrorMsg(msg) {
        $("div.error").html(msg);
        $("div.error").show().delay(1500).fadeOut(500);
    }

})();