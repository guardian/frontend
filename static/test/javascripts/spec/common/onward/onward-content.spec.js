define([
    'helpers/injector'
], function (
    Injector
) {
    describe('Onward Content', function () {

        var server,
            injector = new Injector(),
            OnwardContent, config, mediator;

        beforeEach(function (done) {
            injector.require(['common/modules/onward/onward-content', 'common/utils/config', 'common/utils/mediator'], function () {
                OnwardContent = arguments[0];
                config = arguments[1];
                mediator = arguments[2];

                config.page = {
                    shortUrl: 'http://gu.com/p/42zeg',
                    blogIds: 'global-development/poverty-matters',
                    seriesId: 'global-development/series/modern-day-slavery-in-focus'
                };

                // set up fake server
                server = sinon.fakeServer.create();
                server.autoRespond = true;
                server.autoRespondAfter = 20;

                done();
            });
        });

        afterEach(function () {
            server.restore();
        });

        it('should exist', function () {
            expect(OnwardContent).toBeDefined();
        });

        it('should use blog tag if first', function (done) {
            config.page.nonKeywordTagIds =
                'global-development/poverty-matters,global-development/series/modern-day-slavery-in-focus';
            server.respondWith('/series/global-development/poverty-matters.json?shortUrl=http%3A%2F%2Fgu.com%2Fp%2F42zeg', [200, {}, '']);
            /*eslint-disable no-new*/
            new OnwardContent();
            /*eslint-enable no-new*/

            mediator.once('modules:onward:loaded', function () {
                done();
            });
        });

        it('should use series tag if first', function (done) {
            config.page.nonKeywordTagIds =
                'global-development/series/modern-day-slavery-in-focus,global-development/poverty-matters';
            server.respondWith('/series/global-development/series/modern-day-slavery-in-focus.json?shortUrl=http%3A%2F%2Fgu.com%2Fp%2F42zeg', [200, {}, '']);
            /*eslint-disable no-new*/
            new OnwardContent();
            /*eslint-enable no-new*/

            mediator.once('modules:onward:loaded', function () {
                done();
            });
        });

    });
});
