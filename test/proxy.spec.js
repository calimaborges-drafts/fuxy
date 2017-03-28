import request from 'superagent';
import assert from 'assert';
import status from 'http-status';

import superagentProxy from 'superagent-proxy';
superagentProxy(request);

import { useServer, clientUrl } from './starter.lib';

useServer();

describe('proxy', function() {

    it('should redirect HTTP request to proxy server', (done) => {
        request.get("http://httpbin.org/ip").proxy(clientUrl).end( (err, res) => {
            assert.ifError(err);
            expect(res.status).toBe(status.OK);
            const result = JSON.parse(res.text);
            expect(result.hasOwnProperty('origin'));
            done();
        });
    });

    it('should redirect large HTTP request to proxy server', (done) => {
        request.get("http://httpbin.org/image/svg").proxy(clientUrl).end( (err, res) => {
            assert.ifError(err);
            expect(res.body.length).toBe(8984);
            done();
        });
    });

    xit('should redirect HTTPS request to proxy server', (done)  => {
        request.get("https://httpbin.org/ip").proxy(clientUrl).end( (err, res) => {
            assert.ifError(err);
            expect(res.status).toBe(status.OK);
            const result = JSON.parse(res.text);
            expect(result.hasOwnProperty('origin'));
            done();
        });
    });
});
