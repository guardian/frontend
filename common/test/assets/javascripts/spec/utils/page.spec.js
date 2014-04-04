define([
    'common/utils/config',
    'common/utils/page'
], function(
    config,
    page
) {

    describe('Page', function() {
        var cb;
        function reset() {
            cb = sinon.spy();
            config.page.tones = '';
            config.page.series = '';
            config.isLiveBlog = false;
        }
        beforeEach(reset);

        describe ('isMatch', function() {
            beforeEach(reset);

            it('should callback on match reports', function() {
                // Report
                config.referencesOfType = function() { return [34, 3] };
                config.page.tones = 'Match reports';
                page.isMatch(cb);
                expect(cb.calledWith({
                    date: '2013/03/20',
                    teams: [34, 3],
                    pageType: 'report'
                })).toBe(true);
            });

            it('should callback on minute by minute live blogs', function() {
                // Report
                config.referencesOfType = function() { return [33, 1] };
                config.page.isLiveBlog = true;
                page.isMatch(cb);
                expect(cb.calledWith({
                    date: '2013/03/20',
                    teams: [33, 1],
                    pageType: 'minbymin'
                })).toBe(true);
                config.page.isLiveBlog = false;
            });

            it('should callback on match previews', function() {
                // Report
                config.referencesOfType = function() { return [1, 2] };
                config.page.series = 'Match previews';
                page.isMatch(cb);
                expect(cb.calledWith({
                    date: '2013/03/20',
                    teams: [1, 2],
                    pageType: 'preview'
                })).toBe(true);
            });

            it('should not callback without two teams', function() {
                // Report
                config.referencesOfType = function() { return [1] };
                config.page.isLiveBlog = true;
                page.isMatch(cb);
                expect(cb.called).toBe(false);
            });
        });


        describe('isClockwatch', function() {
            beforeEach(reset);

            it ('should not callback on non-clockwatch series', function() {
                config.page.series = 'Blogger of the week (Cities)';
                page.isClockwatch(cb);
                expect(cb.called).toBe(false);
            });

            it ('should callback on clockwacth pages', function() {
                config.page.series = 'Clockwatch';
                page.isClockwatch(cb);
                expect(cb.called).toBe(true);
            });
        });

        describe('isLiveClockwatch', function() {
            beforeEach(reset);

            it ('should not callback on non-live clockwatches', function() {
                config.page.series = 'Clockwatch';
                config.page.isLive = false;
                page.isLiveClockwatch(cb);
                expect(cb.called).toBe(false);
            });

            it ('should callback on live clockwatches', function() {
                config.page.series = 'Clockwatch';
                config.page.isLive = true;
                page.isLiveClockwatch(cb);
                expect(cb.called).toBe(true);
            });
        });

        xdescribe('isCompetition'); // this isn't implemented properly, so left out for now
    });

});
