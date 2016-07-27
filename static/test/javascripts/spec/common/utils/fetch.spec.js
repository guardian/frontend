define([
    'common/utils/fetch'
], function (
    fetch
) {
    describe('Fetch util', function () {
        beforeEach(function () {
            this.xhr = sinon.useFakeXMLHttpRequest();
            var requests = this.requests = [];
            this.xhr.onCreate = function (xhr) {
                requests.push(xhr);
            };
        });
        afterEach(function () {
            this.xhr.restore();
        });

        it('returns a promise which rejects on network errors', function (done) {
            fetch('error-path')
            .then(done.fail)
            .catch(function (ex) {
                expect(ex instanceof Error).toBe(true, 'rejects an error');
                expect(ex.message).toMatch(/fetch error/i);
                done();
            })
            .catch(done.fail);

            this.requests[0].respond(0, {}, 'invalid');
        });

        it('returns a promise which resolves on error responses', function (done) {
            fetch('404-error-response')
            .then(function (resp) {
                expect(resp.ok).toBe(false, 'resp.ok');
                expect(resp.status).toBe(404, 'resp.status');
                expect(resp.statusText).toBe('Not Found', 'resp.statusText');

                return resp.text();
            })
            .then(function (responseText) {
                expect(responseText).toBe('Error response');
            })
            .then(done)
            .catch(done.fail);

            this.requests[0].respond(404, {}, 'Error response');
        });

        it('rejects if response is not correct json', function (done) {
            fetch('invalid-json')
            .then(function (resp) {
                expect(resp.ok).toBe(true, 'resp.ok');
                expect(resp.status).toBe(200, 'resp.status');
                expect(resp.statusText).toBe('OK', 'resp.statusText');

                return resp.json();
            })
            .then(done.fail)
            .catch(function (ex) {
                expect(ex instanceof Error).toBe(true, 'rejects an error');
                expect(ex.message).toMatch(/json/i);
                done();
            })
            .catch(done.fail);

            this.requests[0].respond(200, {}, 'Plain text');
        });

        it('rejects if trying to consume the body multiple times', function (done) {
            fetch('multiple-body')
            .then(function (resp) {
                return Promise.all([
                    resp.text(),
                    resp.json()
                ]);
            })
            .then(done.fail)
            .catch(function (ex) {
                expect(ex instanceof TypeError).toBe(true, 'rejects an error');
                expect(ex.message).toBe('Already read');
                done();
            })
            .catch(done.fail);

            this.requests[0].respond(200, {}, '{}');
        });

        it('resolves a correct response in plain text', function (done) {
            fetch('correct-json')
            .then(function (resp) {
                expect(resp.ok).toBe(true, 'resp.ok');
                expect(resp.status).toBe(200, 'resp.status');
                expect(resp.statusText).toBe('OK', 'resp.statusText');

                return resp.text();
            })
            .then(function (responseText) {
                expect(responseText).toBe('{"json":true}');
            })
            .then(done)
            .catch(done.fail);

            this.requests[0].respond(200, {}, '{"json":true}');
        });

        it('resolves a correct response in json', function (done) {
            fetch('correct-json')
            .then(function (resp) {
                expect(resp.ok).toBe(true, 'resp.ok');
                expect(resp.status).toBe(200, 'resp.status');
                expect(resp.statusText).toBe('OK', 'resp.statusText');

                return resp.json();
            })
            .then(function (json) {
                expect(json).toEqual({
                    json: true
                });
            })
            .then(done)
            .catch(done.fail);

            this.requests[0].respond(200, {}, '{"json":true}');
        });
    });
});
