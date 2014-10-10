define([
    'common/modules/preview/freshness-check',
    'common/utils/mediator',
    'common/utils/$',
    'common/utils/ajax'
], function(
    freshness,
    mediator,
    $,
    ajax
) {

    describe("Preview freshness check", function() {

        var lastModifiedDate = encodeURIComponent('2014-09-14T18:30:13.647+01:00');

        var server;

        var config;

        beforeEach(function() {

            config = {
                page: { isContent: true, pageId: 'foo/bar' },
                switches: { pollPreviewForFreshContent: true }
            };

            ajax.init({page: {
                ajaxUrl: "",
                edition: "UK"
            }});

            // set up fake server
            server = sinon.fakeServer.create();
            server.autoRespond = true;
            server.autoRespondAfter = 20;
        });

        afterEach(function () {
            server.restore();
        });

        it("should check that this is the latest version of the content", function(){

            server.respondWith('/last-modified/foo/bar.json?last-modified=2014-09-14T18%3A30%3A13.647%2B01%3A00' , [200, {}, '{ "status": "fresh" }']);

            callback = sinon.stub();
            mediator.on('modules:freshness-check:fresh', callback);

            runs(function() {
                freshness(config, 'last-modified=' + lastModifiedDate).check();
            });

            waitsFor(function () {
                return callback.calledOnce === true;
            }, 'last-modified never called back', 500);

            runs(function(){
                expect($('.preview-refresh').length).toBe(0);
            });
        });

        it("should display a message if the content is stale", function(){

            server.respondWith('/last-modified/foo/bar.json?last-modified=2014-09-14T18%3A30%3A13.647%2B01%3A00' , [200, {}, '{ "status": "stale" }']);

            callback = sinon.stub();
            mediator.on('modules:freshness-check:stale', callback);

            runs(function() {
                freshness(config, 'last-modified=' + lastModifiedDate).check();
            });

            waitsFor(function () {
                return callback.calledOnce === true;
            }, 'last-modified never called back', 500);

            runs(function(){
                expect($('.preview-refresh').length).toBeGreaterThan(0);
            });
        });

        it("should not be called if this is not content", function(){
            runs(function() {
                config.page.isContent = false;
                freshness(config, 'last-modified=' + lastModifiedDate).check();
                expect(server.requests.length).toBe(0);
            });

        });

        it("should not be called if this is not content", function(){
            runs(function() {
                config.switches.pollPreviewForFreshContent = false;
                freshness(config, 'last-modified=' + lastModifiedDate).check();
                expect(server.requests.length).toBe(0);
            });

        });
    });
});
