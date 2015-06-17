import Injector from 'helpers/injector';
import sinon from 'sinonjs';
import jasmineSinon from 'jasmine-sinon';

describe('Get user data', function () {

    var reqwestStub = {
          __useDefault: true,
          default: sinon.stub()
        },
        reqwestReturn = {
            then: sinon.stub()
        };
    reqwestStub.default.returns(reqwestReturn);

    var injector = new Injector(),
        getCookieStub, getStorageStub,
        Id, config, cookies, storage;

    beforeEach(function (done) {

        injector.mock('reqwest', reqwestStub);
        injector.test(['common/modules/identity/api',
                       'common/utils/config',
                       'common/utils/cookies',
                       'common/utils/storage'], function () {

            Id = arguments[0];
            config = arguments[1];
            cookies = arguments[2];
            storage = arguments[3];

            config.page = {
                idApiUrl: 'https://idapi.theguardian.com',
                idUrl:    'https://profile.theguardian.com'
            };
            getCookieStub = sinon.stub();
            getCookieStub.withArgs('GU_U').returns(
                'WyIyMzEwOTU5IiwiamdvcnJpZUBnbWFpbC5jb20iLCJqYW1lc2dvcnJpZSIsIjUzNCIsMTM4Mjk1MzAzMT' +
                'U5MSwxXQ.MC0CFBsFwIEITO91EGONK4puyO2ZgGQcAhUAqRa7PVDCoAjrbnJNYYvMFec4fAY'
            );
            cookies.get = getCookieStub;
            getStorageStub = sinon.stub();
            storage.local.get = getStorageStub;
            reqwestStub.default.reset();

            done();
        });
    });

    afterEach(function () {
        Id.reset();
    });

    it('gets user from cookie', function () {
        expect(Id.getUserFromCookie().displayName).toBe('jamesgorrie');
    });

    it('decodes a base64 string', function () {
        var string        = 'sammandoo',
            encodedString = window.btoa(string),
            decodedString = Id.decodeBase64(encodedString);

        expect(decodedString).toBe(string);
    });

    it('gets user from the idapi', function () {
        var apiCallback  = sinon.spy(),
            expectedUser = {};

        reqwestReturn.then.callsArgWith(
            0,
            {
                'status' : 'ok',
                'user' : expectedUser
            }
        );

        Id.init();
        Id.getUserFromApi(apiCallback);

        expect(apiCallback).toHaveBeenCalledWith(expectedUser);
        expect(reqwestStub.default).toHaveBeenCalledWith({
            url:         'https://idapi.theguardian.com/user/me',
            type:        'jsonp',
            crossOrigin: true
        });
    });

    it('should not call api if the cookie does not exist', function () {
        cookies.get.withArgs('GU_U').returns(null);
        var apiCallback = sinon.spy();

        Id.getUserFromApi(apiCallback);

        expect(apiCallback).toHaveBeenCalledWith(null);
        expect(reqwestStub.default).not.toHaveBeenCalled();
    });

    it('should redirect to sign in when user is not signed in', function () {
        getCookieStub.withArgs('GU_U').returns(null);
        var redirectSpy = sinon.stub(Id, 'redirectTo');

        Id.getUserOrSignIn();

        expect(redirectSpy).toHaveBeenCalled();
        Id.redirectTo.restore();
    });

    it('should not redirect to sign in when user is already signed in', function () {
        var redirectSpy = sinon.stub(Id, 'redirectTo'),
            user        = Id.getUserOrSignIn();

        expect(user.displayName).toBe('jamesgorrie');
        expect(redirectSpy).not.toHaveBeenCalled();
        Id.redirectTo.restore();
    });

    it('should redirect with return URL when given', function () {
        getCookieStub.withArgs('GU_U').returns(null);
        var redirectSpy = sinon.stub(Id, 'redirectTo'),
            returnUrl   = 'http://www.theguardian.com/foo';

        Id.getUserOrSignIn(returnUrl);

        expect(redirectSpy.getCall(0).args[0]).toContain(encodeURIComponent(returnUrl));
        Id.redirectTo.restore();
    });

    it('should attempt to autosigin an user who is not currently signed in and has not previously signed out', function () {
        getCookieStub.withArgs('GU_U').returns(null);
        getCookieStub.withArgs('GU_SO').returns(null);
        getStorageStub.withArgs('gu.id.nextFbCheck').returns('blah|blah');

        expect(Id.shouldAutoSigninInUser()).toBe(false);
    });

    it('should not attempt to autosigin a user who is not currently signed in, has not previously signed out, before the facebook check overlaps', function () {
        getCookieStub.withArgs('GU_U').returns(null);
        getCookieStub.withArgs('GU_SO').returns(null);

        expect(Id.shouldAutoSigninInUser()).toBe(true);
    });

    it('should not attempt to autosignin a signed in user', function () {
        expect(Id.shouldAutoSigninInUser()).toBe(false);
    });

    it('should attempt to autosignin a user who has signed out more than 24 hours ago after the facebook check has ellapsed', function () {
        var today                 = new Date(),
            theDayBeforeYesterday = new Date();

        theDayBeforeYesterday.setDate(today.getDate() - 2);

        var timeStampInSeconds = theDayBeforeYesterday.getTime() / 1000;
        getCookieStub.withArgs('GU_U').returns(null);
        getCookieStub.withArgs('GU_SO').returns(timeStampInSeconds.toString);

        expect(Id.shouldAutoSigninInUser()).toBe(true);
    });

    it('should not attempt to autosignin a user who has signed out more than 24 hours ago before the facebook check has ellapsed', function () {
        var theDayBeforeYesterday = new Date();
        theDayBeforeYesterday.setDate(new Date().getDate() - 2);

        var timeStampInSeconds = theDayBeforeYesterday.getTime() / 1000;

        getCookieStub.withArgs('GU_U').returns(null);
        getCookieStub.withArgs('GU_SO').returns(timeStampInSeconds.toString);
        getStorageStub.withArgs('gu.id.nextFbCheck').returns('blah|blah');

        expect(Id.shouldAutoSigninInUser()).toBe(false);
    });

    it('should not attempt to autosignin a user who has signed out within the last 24 hours', function () {
        var fourHoursAgo = new Date();
        fourHoursAgo.setHours(new Date().getHours() - 4);

        var timeStampInSeconds = fourHoursAgo.getTime() / 1000;

        getCookieStub.withArgs('GU_U').returns(null);
        getCookieStub.withArgs('GU_SO').returns(timeStampInSeconds.toString());

        expect(Id.shouldAutoSigninInUser()).toBe(false);
    });

    it('should return true for a user who has never refreshed cookies', function () {
        expect(Id.shouldRefreshCookie(null)).toBe(true);
    });

    it('should return false for a user who has not refreshed within 30 days', function () {
        expect(Id.shouldRefreshCookie(new Date().getTime() - 1000 * 86400 * 31, new Date().getTime())).toBe(true);
    });

    it('should return false for a user who has refreshed within 30 days', function () {
        expect(Id.shouldRefreshCookie(new Date().getTime()  - 1000 * 86400 * 5, new Date().getTime())).toBe(false);
    });

});
