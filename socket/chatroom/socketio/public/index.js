(function() {

    var socket = null;
    
    $(function() {
        initIo();
        initIoMessage();
        initSetNameBtn();
        initSendMsgBtn();
        
        setName();
    });

    function initIo() {
        socket = io.connect("http://localhost");
    }

    function setName() {
        var nameInCookie = $.cookie("chat_name");
        socket.emit("name", {
            code: Constant.CODE.SET_NAME,
            msg: nameInCookie
        }, function(returnData){
            if(returnData.code == Constant.CODE.OK){
                // set user name ok
                hideSetNameDiv();
            }else{
                // set user name ng, show set name mask
                showSetNameDiv();
                showErrorMsg();
            }
        });
    }
    
    function initSetNameBtn(){
        $("#setNameBtn").on("click", function(){
            var name = $("#name").val();
            $.cookie("chat_name", name);
            setName();
        });
    }
    
    function initIoMessage(){
        socket.on("chat", function(data, callback){
            if(data.code == Constant.CODE.MSG){
                showBroadcastMsg(data.from, data.msg);
            }else{
                showPrivateMsg(data.from, data.msg);
            }
        });
    }
    
    function initSendMsgBtn(){
        $("#sendMsgBtn").on("click", function(){
            var content = $("#chatContent").val();
            socket.emit("chat", {
                code: Constant.CODE.MSG,
                msg: content 
            });
        });
    }
    
    /**
     * show broadcast message
     */
    function showBroadcastMsg(from, msg){
        var broadcastMsg = null;
        var className = null;
        if(from){
            broadcastMsg = "【"+from+"】说：" + msg;
            className = "systemBroadcastMsg";
        }else{
            broadcastMsg = msg;
            className = "userBroadcastMsg";
        }
        $("<div></div>").addClass(className).html(broadcastMsg).appendTo($("#messages"));
    }
    
    /**
     * show private message
     */
    function showPrivateMsg(from, msg){
        var privateMsg = from + "对你说：" + msg;
        $("<div></div>").addClass("broadcastMsg").html(privateMsg).appendTo($("#messages"));
    }
    
    function showSetNameDiv(){
        $("#setNameMask").show();
    }
    
    function hideSetNameDiv(){
        $("#setNameMask").hide();
    }
    
    function showErrorMsg(){
        $("div.error").show().delay(1500).fadeOut(500);
    }

})();