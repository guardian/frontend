define([
    'helpers/injector'
], function (
    Injector
) {

    return new Injector()
        .store(['common/utils/config', 'common/utils/mediator'])
        .require(['common/modules/onward/onward-content', 'mocks'], function (OnwardContent, mocks) {

            describe('Onward Content', function () {

                var server;

                beforeEach(function () {
                    mocks.store['common/utils/config'].page = {
                        shortUrl: 'http://gu.com/p/42zeg',
                        blogIds: 'global-development/poverty-matters',
                        seriesId: 'global-development/series/modern-day-slavery-in-focus'
                    };

                    // set up fake server
                    server = sinon.fakeServer.create();
                    server.autoRespond = true;
                    server.autoRespondAfter = 20;
                });

                afterEach(function () {
                    server.restore();
                });

                it('should exist', function () {
                    expect(OnwardContent).toBeDefined();
                });

                it('should use blog tag if first', function (done) {
                    mocks.store['common/utils/config'].page.nonKeywordTagIds =
                        'global-development/poverty-matters,global-development/series/modern-day-slavery-in-focus';
                    server.respondWith('/series/global-development/poverty-matters.json?shortUrl=http%3A%2F%2Fgu.com%2Fp%2F42zeg', [200, {}, '']);
                    new OnwardContent();

                    mocks.store['common/utils/mediator'].once('modules:onward:loaded', function () {
                        done();
                    });
                });

                it('should use series tag if first', function (done) {
                    mocks.store['common/utils/config'].page.nonKeywordTagIds =
                        'global-development/series/modern-day-slavery-in-focus,global-development/poverty-matters';
                    server.respondWith('/series/global-development/series/modern-day-slavery-in-focus.json?shortUrl=http%3A%2F%2Fgu.com%2Fp%2F42zeg', [200, {}, '']);
                    new OnwardContent();

                    mocks.store['common/utils/mediator'].once('modules:onward:loaded', function () {
                        done();
                    });
                });

            });

        });

});
