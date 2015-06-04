var Imap = require('imap');
var inspect = require('util').inspect;
var iconv = require('iconv-lite');
//iconv.extendNodeEncodings();

var imap = new Imap({
    user : 'yisurenali@aliyun.com',
    password : 'a198338aa',
    host : 'imap.aliyun.com',
    port : 993,
    tls : true
});

function openInbox(cb) {
    imap.openBox('INBOX', true, cb);
}

imap.once('ready', function() {
    openInbox(function(err, box) {
        if (err)
            throw err;
        var f = imap.seq.fetch(box.messages.total + ':*', {
            bodies : [ 'HEADER.FIELDS (FROM)', 'TEXT' ]
        });
        f.on('message', function(msg, seqno) {
            console.log('Message #%d', seqno);
            var prefix = '(#' + seqno + ') ';
            msg.on('body', function(stream, info) {
                if (info.which === 'TEXT')
                    console.log(prefix + 'Body [%s] found, %d total bytes', inspect(info.which), info.size);
                var buffer = '', count = 0;
                stream.on('data', function(chunk) {
                    count += chunk.length;
                    buffer += chunk;
                    if (info.which === 'TEXT'){
                        console.log(prefix + 'Body [%s] (%d/%d)', inspect(info.which), count, info.size);
                        console.log(iconv.decode(buffer, 'Shift_JISX0213'));
                    }
                    
                });
                stream.once('end', function() {
                    if (info.which !== 'TEXT')
                        console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
                    else
                        console.log(prefix + 'Body [%s] Finished', inspect(info.which));
                });
            });
            msg.once('attributes', function(attrs) {
                console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
            });
            msg.once('end', function() {
                console.log(prefix + 'Finished');
            });
        });
        f.once('error', function(err) {
            console.log('Fetch error: ' + err);
        });
        f.once('end', function() {
            console.log('Done fetching all messages!');
            imap.end();
        });
    });
});

imap.once('error', function(err) {
    console.log(err);
});

imap.once('end', function() {
    console.log('Connection ended');
});

imap.connect();