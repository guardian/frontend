define([
    'squire',
    'common/utils/$'
], function (
    Squire,
    $
) {

    new Squire()
        .store(['common/utils/config', 'common/utils/mediator'])
        .require(['common/modules/preview/freshness-check', 'mocks'], function (freshness, mocks) {

            describe('Preview freshness check', function () {

                var lastModifiedDate = encodeURIComponent('2014-09-14T18:30:13.647+01:00'),
                    server;

                beforeEach(function() {
                    mocks.store['common/utils/config'].page = {
                        isContent: true,
                            pageId: 'foo/bar'
                    };
                    mocks.store['common/utils/config'].switches = {
                        pollPreviewForFreshContent: true
                    };
                    // set up fake server
                    server = sinon.fakeServer.create();
                    server.autoRespond = true;
                    server.autoRespondAfter = 20;
                });

                afterEach(function () {
                    server.restore();
                });

                it("should check that this is the latest version of the content", function (done) {

                    server.respondWith(
                        '/last-modified/foo/bar.json?last-modified=2014-09-14T18%3A30%3A13.647%2B01%3A00',
                        [200, {}, '{ "status": "fresh" }']
                    );

                    mocks.store['common/utils/mediator'].on('modules:freshness-check:fresh', function () {
                        expect($('.preview-refresh').length).toBe(0);
                        done();
                    });

                    freshness('last-modified=' + lastModifiedDate).check();
                });

                it("should display a message if the content is stale", function (done) {

                    server.respondWith(
                        '/last-modified/foo/bar.json?last-modified=2014-09-14T18%3A30%3A13.647%2B01%3A00',
                        [200, {}, '{ "status": "stale" }']
                    );

                    mocks.store['common/utils/mediator'].on('modules:freshness-check:stale', function () {
                        expect($('.preview-refresh').length).toBeGreaterThan(0);
                        done();
                    });

                    freshness('last-modified=' + lastModifiedDate).check();
                });

                it("should not be called if this is not content", function () {
                    mocks.store['common/utils/config'].page.isContent = false;
                    freshness('last-modified=' + lastModifiedDate).check();

                    expect(server.requests.length).toBe(0);
                });

                it("should not be called if this is not content", function () {
                    mocks.store['common/utils/config'].switches.pollPreviewForFreshContent = false;
                    freshness('last-modified=' + lastModifiedDate).check();


                    expect(server.requests.length).toBe(0);
                });

            });

        });

});
