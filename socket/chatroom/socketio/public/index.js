(function(){

$(function(){
    initIo();
});

function initIo(){
    var socket = io.connect("http://localhost");
    socket.on("msg", function(msg){
        $("<span></span>").addClass("message").html(msg).appendTo($("#messages"));
    });
}


})();