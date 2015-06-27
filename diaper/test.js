var request = require("request");
var erequest = require("./encoderequest");
var har = require("./har_v.json");

var url = "https://aksale.advs.jp/cp/akachan_sale_pc/mail_confirm.cgi";

function p1(){
  request.post({
  "url": url,
  form: {
//      "sbmt": "%91%97%90M",
      "mail1": "yisuren8%40hotmail.com",
      "mail2": "yisuren8%40hotmail.com",
      "event_id" : "8914200399",
      "event_type": "7"
  }
}, function(error, response, body){
  console.log(body);
});

}

function p2(){
    var h = har[2];
    console.log("-----------");
    console.log(h);
    request.post({
      "url": url,
      headers: {
          "Transfer-Encoding": "Shift_JIS"
      },
      
      form: {
          "sbmt": "%91%97%90M",
          "mail1": "yisuren8@hotmail.com",
          "mail2": "yisuren8@hotmail.com",
          "event_id" : "8914200399",
          "event_type": "7"
      },
      har: h
    }, function(error, response, body){
//      console.log(body);
    });
}

function p3(){
    var StringDecoder = require('string_decoder').StringDecoder;
    var decoder = new StringDecoder('SJIS');

    var s = "%8E%9F%82%D6";
    var cent = new Buffer(s);
    console.log(decoder.write(cent));
}

/**
 * https://cnodejs.org/topic/51c4e1f273c638f3706ee888
 */
function p4(){
    var iconv=require('iconv-lite');
    var a = '%91%97%90M';
    a=a.replace(/%([a-zA-Z0-9]{2})/g,function(_,code){
//        return parseInt(code,16);
        return String.fromCharCode(parseInt(code,16));
    });
//    console.log(a);
    var buff=new Buffer(a,'binary');
    var result=iconv.decode(buff,'Shift_Jis');
    console.log(result);
}

function p5(){
    request({
        har: {
            url: "http://www.baidu.com",
            method: "GET",
            headers: [{
                "name": "Cookie",
                "value": "sess=111"
            }],
            Cookies: [{
                "name": "sess",
                "value": "222"
            }]
        }
    });
}

function p6(){
    erequest({
        url: "https://aksale.advs.jp/cp/akachan_sale_pc/form_card_no.cgi",
        method: "POST",
        headers: {
            "cookie": "sess=625b2030bb98e6e2782f10abedc3b7f6"
        },
        form: {
            "card_no": "2800054542024"
        },
//        har: {
//            "method": "POST",
//            "url": "https://aksale.advs.jp/cp/akachan_sale_pc/form_card_no.cgi",
//            "httpVersion": "HTTP/1.1",
//            "headers": [
//              {
//                "name": "Pragma",
//                "value": "no-cache"
//              },
//              {
//                "name": "Origin",
//                "value": "https://aksale.advs.jp"
//              },
//              {
//                "name": "Accept-Encoding",
//                "value": "gzip, deflate"
//              },
//              {
//                "name": "Host",
//                "value": "aksale.advs.jp"
//              },
//              {
//                "name": "Accept-Language",
//                "value": "zh-CN,zh;q=0.8,en;q=0.6,ja;q=0.4"
//              },
//              {
//                "name": "User-Agent",
//                "value": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.101 Safari/537.36"
//              },
//              {
//                "name": "Content-Type",
//                "value": "application/x-www-form-urlencoded"
//              },
//              {
//                "name": "Accept",
//                "value": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
//              },
//              {
//                "name": "Cache-Control",
//                "value": "no-cache"
//              },
//              {
//                "name": "Referer",
//                "value": "https://aksale.advs.jp/cp/akachan_sale_pc/_reg_form.cgi?id=K6qor8vx9U2kTwXhNVPITojFNUjMHHyS"
//              },
//              {
//                "name": "Cookie",
//                "value": "sess=625b2030bb98e6e2782f10abedc3b7f6; _gat=1; _ga=GA1.2.1930524045.1431846055"
//              },
//              {
//                "name": "Connection",
//                "value": "keep-alive"
//              },
//              {
//                "name": "Content-Length",
//                "value": "39"
//              }
//            ],
//            "postData": {
//              "params": [
//                {
//                  "name": "card_no",
//                  "value": "2800054542024"
//                }
//              ]
//            }
//          }
    },null, function(body){
        console.log(body);
    },"Shift_JIS");
}

var fs = require("fs");
function p7(){
    fs.createWriteStream("log.log", {
        flags: "a"
    }).write("bbb");
}

p7();