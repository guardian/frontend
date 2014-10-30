define([
    'common/utils/$',
    'jasq'
], function (
    $
) {

    describe('Preview freshness check', {
        moduleName: 'common/modules/preview/freshness-check',
        mock: function () {
            return {
                'common/utils/config': function () {
                    return {
                        page: {
                            isContent: true,
                            pageId: 'foo/bar'
                        },
                        switches: {
                            pollPreviewForFreshContent: true
                        }
                    };
                }
            }
        },
        specify: function () {

            var lastModifiedDate = encodeURIComponent('2014-09-14T18:30:13.647+01:00'),
                server;

            beforeEach(function() {
                // set up fake server
                server = sinon.fakeServer.create();
                server.autoRespond = true;
                server.autoRespondAfter = 20;
            });

            afterEach(function () {
                server.restore();
            });

            it("should check that this is the latest version of the content", function (freshness, deps, done) {

                server.respondWith(
                    '/last-modified/foo/bar.json?last-modified=2014-09-14T18%3A30%3A13.647%2B01%3A00',
                    [200, {}, '{ "status": "fresh" }']
                );

                deps['common/utils/mediator'].on('modules:freshness-check:fresh', function () {
                    expect($('.preview-refresh').length).toBe(0);
                    done();
                });

                freshness('last-modified=' + lastModifiedDate).check();
            });

            it("should display a message if the content is stale", function (freshness, deps, done) {

                server.respondWith(
                    '/last-modified/foo/bar.json?last-modified=2014-09-14T18%3A30%3A13.647%2B01%3A00',
                    [200, {}, '{ "status": "stale" }']
                );

                deps['common/utils/mediator'].on('modules:freshness-check:stale', function () {
                    expect($('.preview-refresh').length).toBeGreaterThan(0);
                    done();
                });

                freshness('last-modified=' + lastModifiedDate).check();
            });

            it("should not be called if this is not content", function (freshness, deps) {
                deps['common/utils/config'].page.isContent = false;
                freshness('last-modified=' + lastModifiedDate).check();

                expect(server.requests.length).toBe(0);
            });

            it("should not be called if this is not content", function (freshness, deps) {
                deps['common/utils/config'].switches.pollPreviewForFreshContent = false;
                freshness('last-modified=' + lastModifiedDate).check();

                expect(server.requests.length).toBe(0);
            });

        }
    });

});
