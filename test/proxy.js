var server = require("../server");
var client = require("../client");
var request = require('superagent');
var assert = require('assert');
var status = require('http-status');

require('superagent-proxy')(request);

describe('proxy', function() {
    var proxyServer;
    var proxyClient;
    var proxyClientPort;
    var proxyServerPort;
    var proxyClientHost;
    var proxyClientHost

    before(function() {
        proxyServerPort = 8887;
        proxyClientPort = 8889;
        proxyClientHost = "127.0.0.1";
        proxyServerHost = "127.0.0.1";

        // proxyServerPort = 80; //heroku
        // proxyServerHost = "kali-xypro.herokuapp.com"; //heroku

        proxyServer = server(proxyServerPort);
        proxyClient = client(proxyServerHost, proxyServerPort, proxyClientPort);
    });

    after(function() {
        proxyServer.close();
        proxyClient.close();
    });

    it('should redirect HTTP request to proxy server', function(done) {
        request.get("http://test.carlosborg.es/")
            .proxy("http://" + proxyClientHost + ":" + proxyClientPort)
            .end(function(err, res) {
                assert.ifError(err);
                assert.equal(res.status, status.OK);
                var result = JSON.parse(res.text);
                assert.deepEqual( { status: 'active' }, result );
                done();
            });
    });

    it('should redirect large HTTP request to proxy server', function(done) {
        request.get("http://carlosborg.es/carlos-borges-escrita-baixo-logo.svg")
            .proxy("http://" + proxyClientHost + ":" + proxyClientPort)
            .end(function(err, res) {
                assert.ifError(err);
                console.log(res.text);
                // assert.equal(res.status, status.OK);

                // assert.deepEqual( { status: 'active' }, result );
                done();
            });
    });

    // it('should redirect HTTPS request to proxy server', function(done) {
    //     request.get("https://test.carlosborg.es/")
    //         .proxy("http://" + proxyClientHost + ":" + proxyClientPort)
    //         .end(function(err, res) {
    //             assert.ifError(err);
    //             assert.equal(res.status, status.OK);
    //             var result = JSON.parse(res.text);
    //             assert.deepEqual( { status: 'active' }, result );
    //             done();
    //         });
    // });
});
