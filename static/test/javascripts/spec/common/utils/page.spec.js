define([
    'jasq'
], function () {

    describe('Page', {
        moduleName: 'common/utils/page',
        specify: function () {

            beforeEach(function () {
                window.guardian.config.page = {
                    tones: '',
                    series: '',
                    isLive: false,
                    isLiveBlog: false,
                    webPublicationDate: '2013-03-20T17:07:00.000Z'
                };
            });

            afterEach(function () {
                window.guardian.config.page = {};
            });

            describe ('isMatch', function() {

                it('should callback on match reports', function (page, deps) {
                    deps['common/utils/config'].referencesOfType = function() { return [34, 3] };
                    deps['common/utils/config'].page.tones = 'Match reports';
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

                it('should callback on minute by minute live blogs', function (page, deps) {
                    deps['common/utils/config'].referencesOfType = function() { return [33, 1] };
                    deps['common/utils/config'].page.isLiveBlog = true;
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

                it('should callback on match previews', function (page, deps) {
                    deps['common/utils/config'].referencesOfType = function() { return [1, 2] };
                    deps['common/utils/config'].page.series = 'Match previews';
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

                it('should not callback without two teams', function (page, deps) {
                    deps['common/utils/config'].referencesOfType = function() { return [1] };
                    deps['common/utils/config'].page.isLiveBlog = true;
                    var cb = sinon.spy();

                    // Report
                    page.isMatch(cb);

                    expect(cb).not.toHaveBeenCalled();
                });
            });


            describe('isClockwatch', function() {
                it ('should not callback on non-clockwatch series', function (page, deps) {
                    deps['common/utils/config'].page.series = 'Blogger of the week (Cities)';
                    var cb = sinon.spy();

                    page.isClockwatch(cb);

                    expect(cb).not.toHaveBeenCalled();
                });

                it ('should callback on clockwacth pages', function (page, deps) {
                    deps['common/utils/config'].page.series = 'Clockwatch';
                    var cb = sinon.spy();

                    page.isClockwatch(cb);

                    expect(cb).toHaveBeenCalled();
                });
            });

            describe('isLiveClockwatch', function() {
                it ('should not callback on non-live clockwatches', function (page, deps) {
                    deps['common/utils/config'].page.series = 'Clockwatch';
                    deps['common/utils/config'].page.isLive = false;
                    var cb = sinon.spy();

                    page.isLiveClockwatch(cb);

                    expect(cb).not.toHaveBeenCalled();
                });

                it ('should callback on live clockwatches', function (page, deps) {
                    deps['common/utils/config'].page.series = 'Clockwatch';
                    deps['common/utils/config'].page.isLive = true;
                    var cb = sinon.spy();

                    page.isLiveClockwatch(cb);

                    expect(cb).toHaveBeenCalled();
                });
            });

        }
    });

});
