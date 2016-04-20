define(['common/modules/identity/cookierefresh'], function (CookieRefresh) {
    describe('Cookie refresh', function () {
        it('should return true for a user who has never refreshed cookies', function () {
            var cookieRefresh = new CookieRefresh();
            expect(cookieRefresh.shouldRefreshCookie(null)).toBe(true);
        });

        it('should return false for a user who has not refreshed within 30 days', function () {
            var cookieRefresh = new CookieRefresh();
            expect(cookieRefresh.shouldRefreshCookie(new Date().getTime() - 1000 * 86400 * 31, new Date().getTime())).toBe(true);
        });

        it('should return false for a user who has refreshed within 30 days', function () {
            var cookieRefresh = new CookieRefresh();
            expect(cookieRefresh.shouldRefreshCookie(new Date().getTime()  - 1000 * 86400 * 5, new Date().getTime())).toBe(false);
        });

    });
});

