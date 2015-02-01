function ChatLog(){
    this.log = function (data, callback){
        
        console.log(" -- in log ");
        console.log("data", data);
    };
}

exports.log = new ChatLog(); 