var net = require("net");
var request = require('superagent');
var url = require("url");

var proxyUrl = process.env.http_proxy;

var debugfunc = function(name) {
    return function() {
        console.log("Amount of arguments for " + name + ": " + arguments.length);
    };
};

var httpInfoFromString = function(data) {
    var pattern = /(\S+)\s+(\S+)\s+(\S+)/i
    var matches = pattern.exec(data);

    return {
        method: matches[1],
        uri: matches[2],
        version: matches[3]
    };
};

var hostFromUrl = function(uri) {
    uri = url.parse(uri);

    return uri.hostname;
};

var portFromUrl = function(uri) {
    uri = url.parse(uri);

    if(!uri.port) {
        var protocol = uri.protocol.substring(0, uri.protocol.length - 1);
        switch (protocol) {
            case 'http': return 80;
            case 'https': return 443;
            default: return 80;
        }
    }

    return uri.port;
}

module.exports = function(serverHost, serverPort, port) {
    var server = net.createServer( function(socket) {
        var i = 0;
        socket.on('connect', debugfunc('connect'));
        socket.on('close', function() {
            console.log("Connection closed with proxy client");
        });
        socket.on('data', function(data) {
            console.log("Data " + i++);
            console.log(data.toString());
            var httpInfo = httpInfoFromString(data);
            var uri = httpInfo.uri;
            if (httpInfo.method == 'CONNECT') {
                uri = "connect://" + uri;
            }

            var message = {
                type: 'data',
                host: hostFromUrl(uri),
                port: portFromUrl(uri),
                content: data.toString('base64')
            }

            var req = request.post("http://" + serverHost + ":" + serverPort);

            if (proxyUrl) {
                req.proxy(proxyUrl);
            }

            req.send(message)
                .end(function(err, res) {
                    if (err) {
                        socket.end('ERROR: Proxy failed');
                    }
                    var response = JSON.parse(res.text);
                    socket.write(new Buffer(response.content, 'base64').toString('ascii'));
                });
        });
        socket.on('drain', debugfunc('drain'));
        socket.on('end', debugfunc('end'));
        socket.on('error', function (error) {
            console.log(error);
        });
        socket.on('lookup', debugfunc('lookup'));
        socket.on('timeout', debugfunc('timeout'));
    } );

    console.log("Proxy client up on port " + port + " connecting to " +
            serverHost + ":" + serverPort + " ...");
    return server.listen(port);
}
