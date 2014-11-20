/**
 * copy from https://tinypng.com/developers/reference
 * something modified to meet our requires
 */

var https = require("https");
var fs = require("fs");

var convertOne = function(key, inputFilePath, outputFilePath, overwriteFlg){

//	var key = "870geOAm7KL4y4ExPUgdUrVQnwd4efiw";
	var input = fs.createReadStream(inputFilePath);
	var output = fs.createWriteStream(outputFilePath);

	/* Uncomment below if you have trouble validating our SSL certificate.
		Download cacert.pem from: http://curl.haxx.se/ca/cacert.pem */
	var boundaries = /-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----\n/g
	var certs = fs.readFileSync(__dirname + "/cacert.pem").toString()
	https.globalAgent.options.ca = certs.match(boundaries);

	var options = require("url").parse("https://api.tinypng.com/shrink");
	options.auth = "api:" + key;
	options.method = "POST";

	var request = https.request(options, function(response) {
		if (response.statusCode === 201) {
			/* Compression was successful, retrieve output from Location header. */
			https.get(response.headers.location, function(response) {
				response.pipe(output);
			});

			if(overwriteFlg){
				fs.unlinkSync(inputFilePath);
				fs.rename(outputFilePath, inputFilePath);
			}
			console.log("success one -- ", inputFilePath);
		} else {
			/* Something went wrong! You can parse the JSON body for details. */
			console.log("Compression failed : " + inputFilePath);
		}
	});

	input.pipe(request);
};

exports.convertOne = convertOne;