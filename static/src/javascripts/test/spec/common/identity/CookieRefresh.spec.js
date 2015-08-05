import Injector from 'helpers/injector';
import sinon from 'sinonjs';
/*eslint-disable no-unused-vars*/
import jasmineSinon from 'jasmine-sinon';
/*eslint-enable no-unused-vars*/

describe('Cookie refresh', function () {

    var injector = new Injector(),
        getStorageStub,
        Id, storage;

    beforeEach(function (done) {

        injector.mock('reqwest', reqwestStub);
        injector.test(['common/modules/identity/api',
                       'common/utils/storage'], function () {

                           Id = arguments[0];
                           storage = arguments[1];

                           getStorageStub = sinon.stub();
                           storage.local.get = getStorageStub;

                           done();
                       });
    });

    it('should return true for a user who has never refreshed cookies', function () {
        var cookieRefresh = new CookieRefresh().init();
        expect(cookieRefresh.shouldRefreshCookie(null)).toBe(true);
    });

    it('should return false for a user who has not refreshed within 30 days', function () {
        var cookieRefresh = new CookieRefresh().init();
        expect(cookieRefresh.shouldRefreshCookie(new Date().getTime() - 1000 * 86400 * 31, new Date().getTime())).toBe(true);
    });

    it('should return false for a user who has refreshed within 30 days', function () {
        var cookieRefresh = new CookieRefresh().init();
        expect(cookieRefresh.shouldRefreshCookie(new Date().getTime()  - 1000 * 86400 * 5, new Date().getTime())).toBe(false);
    });

});
