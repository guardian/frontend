define([
    'helpers/injector'
], function (
    Injector
) {
    describe('Page', function () {

        var injector = new Injector(),
            page, config;

        beforeEach(function (done) {
            injector.require(['common/utils/page', 'common/utils/config'], function () {
                page = arguments[0];
                config = arguments[1];

                config.page = {
                    tones: '',
                    series: '',
                    isLive: false,
                    isLiveBlog: false,
                    webPublicationDate: '2013-03-20T17:07:00.000Z'
                };

                done();
            });
        });

        describe('isMatch', function () {

            it('should callback on match reports', function () {
                config.referencesOfType = function () { return [34, 3]; };
                config.page.tones = 'Match reports';

                var cb = sinon.spy();
                // Report
                page.isMatch(cb);

                expect(cb).toHaveBeenCalledWith({
                    date: '2013/03/20',
                    teams: [34, 3],
                    pageType: 'report',
                    isLive: false
                });
            });

            it('should callback on minute by minute live blogs', function () {
                config.referencesOfType = function () { return [33, 1]; };
                config.page.isLiveBlog = true;

                var cb = sinon.spy();

                // Report
                page.isMatch(cb);

                expect(cb).toHaveBeenCalledWith({
                    date: '2013/03/20',
                    teams: [33, 1],
                    pageType: 'minbymin',
                    isLive: false
                });
            });

            it('should callback on match previews', function () {
                config.referencesOfType = function () { return [1, 2]; };
                config.page.series = 'Match previews';

                var cb = sinon.spy();

                // Report
                page.isMatch(cb);

                expect(cb).toHaveBeenCalledWith({
                    date: '2013/03/20',
                    teams: [1, 2],
                    pageType: 'preview',
                    isLive: false
                });
            });

            it('should not callback without two teams', function () {
                config.referencesOfType = function () { return [1]; };
                config.page.isLiveBlog = true;

                var cb = sinon.spy();

                // Report
                page.isMatch(cb);

                expect(cb).not.toHaveBeenCalled();
            });
        });


        describe('isClockwatch', function () {
            it('should not callback on non-clockwatch series', function () {
                config.page.series = 'Blogger of the week (Cities)';

                var cb = sinon.spy();

                page.isClockwatch(cb);

                expect(cb).not.toHaveBeenCalled();
            });

            it('should callback on clockwacth pages', function () {
                config.page.series = 'Clockwatch';

                var cb = sinon.spy();

                page.isClockwatch(cb);

                expect(cb).toHaveBeenCalled();
            });
        });

        describe('isLiveClockwatch', function () {
            it('should not callback on non-live clockwatches', function () {
                config.page.series = 'Clockwatch';
                config.page.isLive = false;

                var cb = sinon.spy();

                page.isLiveClockwatch(cb);

                expect(cb).not.toHaveBeenCalled();
            });

            it('should callback on live clockwatches', function () {
                config.page.series = 'Clockwatch';
                config.page.isLive = true;

                var cb = sinon.spy();

                page.isLiveClockwatch(cb);

                expect(cb).toHaveBeenCalled();
            });
        });

    });
});
