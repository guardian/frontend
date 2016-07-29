define([
    'common/utils/fetch-json'
], function (
    json
) {
    describe('Fetch JSON util', function () {
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
            json('error-path')
            .then(done.fail)
            .catch(function (ex) {
                expect(ex instanceof Error).toBe(true, 'rejects an error');
                expect(ex.message).toMatch(/fetch error/i);
            })
            .then(done)
            .catch(done.fail);

            this.requests[0].respond(0, {}, 'invalid');
        });

        it('returns a promise which rejects invalid json responses', function (done) {
            json('404-error-response')
            .catch(function (ex) {
                expect(ex instanceof Error).toBe(true, 'rejects an error');
                expect(ex.message).toMatch(/json/i);
            })
            .then(done)
            .catch(done.fail);

            this.requests[0].respond(200, {}, 'Plain text');
        });

        it('resolves a correct response in json', function (done) {
            json('correct-json')
            .then(function (response) {
                expect(response).toEqual({
                    json: true
                });
            })
            .then(done)
            .catch(done.fail);

            this.requests[0].respond(200, {}, '{"json":true}');
        });
    });
});
