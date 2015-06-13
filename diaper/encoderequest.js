var iconv = require("iconv-lite");
var request = require("request");

/**
 * send request in har format
 *
 * @param har the har
 * @param cb1 response callback , can read response header from here
 * @param cb2 response callback , can get response html from here
 * @param charset encoding character of response html
 */
function encodeRequest(params, cb1, cb2, charset){
    charset = charset || "utf8";
    var convertStream = iconv.decodeStream(charset);
    convertStream.on("data", function(response){
        if(cb2){
            cb2(response);
        }
    });
    
    params.rejectUnauthorized = false;
    params.followRedirect = false;

    request(params)
    .on("error", function(err){
        console.log("encode request error - ", err);
    }).on("response", function(response){
        if(cb1){
            cb1(response);
        }
    }).pipe(convertStream);
}

module.exports = encodeRequest;