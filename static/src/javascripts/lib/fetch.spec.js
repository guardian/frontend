// @flow

import fetch from 'lib/fetch';
import sinon from 'sinon';

let xhr;
let requests;

describe('Fetch util', () => {
    beforeEach(() => {
        requests = [];
        xhr = sinon.useFakeXMLHttpRequest();
        xhr.onCreate = req => requests.push(req);
    });

    afterEach(() => {
        xhr.restore();
    });

    it('returns a promise which rejects on network errors', done => {
        fetch('error-path')
            .then(done.fail)
            .catch(ex => {
                expect(ex instanceof Error).toBe(true);
                expect(ex.message).toMatch(/fetch error/i);
                done();
            })
            .catch(done.fail);

        requests[0].error();
    });

    it('returns a promise which resolves on error responses', done => {
        fetch('404-error-response')
            .then(resp => {
                expect(resp.ok).toBe(false);
                expect(resp.status).toBe(404);
                expect(resp.statusText).toBe('Not Found');

                return resp.text();
            })
            .then(responseText => {
                expect(responseText).toBe('Error response');
            })
            .then(done)
            .catch(done.fail);

        requests[0].respond(404, {}, 'Error response');
    });

    it('rejects if response is not correct json', done => {
        fetch('invalid-json')
            .then(resp => {
                expect(resp.ok).toBe(true);
                expect(resp.status).toBe(200);
                expect(resp.statusText).toBe('OK');

                return resp.json();
            })
            .then(done.fail)
            .catch(ex => {
                expect(ex instanceof Error).toBe(true);
                expect(ex.message).toMatch(/json/i);
                done();
            })
            .catch(done.fail);

        requests[0].respond(200, {}, 'Plain text');
    });

    it('rejects if trying to consume the body multiple times', done => {
        fetch('multiple-body')
            .then(resp => Promise.all([resp.text(), resp.json()]))
            .then(done.fail)
            .catch(ex => {
                expect(ex instanceof TypeError).toBe(true);
                expect(ex.message).toBe('Already read');
                done();
            })
            .catch(done.fail);

        requests[0].respond(200, {}, '{}');
    });

    it('resolves a correct response in plain text', done => {
        fetch('correct-json')
            .then(resp => {
                expect(resp.ok).toBe(true);
                expect(resp.status).toBe(200);
                expect(resp.statusText).toBe('OK');

                return resp.text();
            })
            .then(responseText => {
                expect(responseText).toBe('{"json":true}');
            })
            .then(done)
            .catch(done.fail);

        requests[0].respond(200, {}, '{"json":true}');
    });

    it('resolves a correct response in json', done => {
        fetch('correct-json')
            .then(resp => {
                expect(resp.ok).toBe(true);
                expect(resp.status).toBe(200);
                expect(resp.statusText).toBe('OK');

                return resp.json();
            })
            .then(json => {
                expect(json).toEqual({
                    json: true,
                });
            })
            .then(done)
            .catch(done.fail);

        requests[0].respond(200, {}, '{"json":true}');
    });
});
