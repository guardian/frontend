// @flow
/* global jsdom */

import {
    getUserFromApi,
    init,
    decodeBase64,
    getUserFromCookie,
    reset,
    getUserOrSignIn,
    shouldAutoSigninInUser,
} from 'common/modules/identity/api.js';
import config from 'lib/config';
import { getCookie as getCookie_ } from 'lib/cookies';
import { ajax as ajax_ } from 'lib/ajax';
import { local } from 'lib/storage';

jest.mock('lib/storage');
jest.mock('lib/config');
jest.mock('lib/ajax', () => ({
    ajax: jest.fn(),
}));
jest.mock('lib/cookies', () => ({
    getCookie: jest.fn(),
}));
jest.mock('common/modules/async-call-merger', () => ({
    mergeCalls(callback) {
        callback.reset = jest.fn();

        return callback;
    },
}));

const getCookieStub: any = getCookie_;
const ajax: any = ajax_;

const originalAssign = window.location.assign;

describe('Identity API', () => {
    beforeEach(() => {
        config.page = {
            idApiUrl: 'https://idapi.theguardian.com',
            idUrl: 'https://profile.theguardian.com',
        };
        getCookieStub.mockImplementation(
            () =>
                'WyIyMzEwOTU5IiwiamdvcnJpZUBnbWFpbC5jb20iLCJBbSVDMyVBOWxpZSBKJUMzJUI0c2UiLCI1MzQiLDEzODI5NTMwMzE1OTEsMV0' +
                '.MC0CFBsFwIEITO91EGONK4puyO2ZgGQcAhUAqRa7PVDCoAjrbnJNYYvMFec4fAY'
        );

        window.location.assign = (url: string) => {
            jsdom.reconfigure({
                url,
            });
        };
    });

    afterEach(() => {
        reset();
        jest.resetAllMocks();

        window.location.assign = originalAssign;
    });

    it('gets user from cookie', () => {
        const user = getUserFromCookie();
        const displayName = user && user.displayName;

        expect(displayName).toBe('Amélie Jôse');
    });

    it('decodes a base64 string', () => {
        const string = 'sammandoo';
        const encodedString = window.btoa(string);
        const decodedString = decodeBase64(encodedString);

        expect(decodedString).toBe(string);
    });

    it('gets user from the idapi', done => {
        const expectedUser = {};
        const apiCallback = user => {
            expect(user).toBe(expectedUser);
            expect(ajax).toHaveBeenCalledWith({
                url: 'https://idapi.theguardian.com/user/me',
                type: 'jsonp',
                crossOrigin: true,
            });
            done();
        };

        ajax.mockImplementationOnce(() =>
            Promise.resolve({
                status: 'ok',
                user: expectedUser,
            })
        );

        init();
        getUserFromApi(apiCallback);
    });

    it('should not call api if the cookie does not exist', done => {
        getCookieStub.mockImplementationOnce(() => null);

        const apiCallback = user => {
            expect(user).toBe(null);
            expect(ajax).not.toHaveBeenCalled();
            done();
        };

        getUserFromApi(apiCallback);
    });

    it('should redirect to sign in when user is not signed in', () => {
        const origHref = window.location.href;

        const returnUrl = 'https://theguardian.com/uk';
        window.location.assign(returnUrl);

        getCookieStub.mockImplementationOnce(() => null);
        getUserOrSignIn();

        expect(window.location.href).toBe(
            `${config.page.idUrl}/signin?returnUrl=${encodeURIComponent(
                returnUrl
            )}`
        );

        window.location.assign(origHref);
    });

    it('should not redirect to sign in when user is already signed in', () => {
        const user = getUserOrSignIn();
        const displayName = user && user.displayName;

        expect(displayName).toBe('Amélie Jôse');
    });

    it('should redirect with return URL when given', () => {
        const origHref = window.location.href;
        const returnUrl = 'http://www.theguardian.com/foo';

        getCookieStub.mockImplementationOnce(() => null);
        getUserOrSignIn(returnUrl);

        expect(window.location.href).toBe(
            `${config.page.idUrl}/signin?returnUrl=${encodeURIComponent(
                returnUrl
            )}`
        );

        window.location.assign(origHref);
    });

    it('should attempt to autosigin an user who is not currently signed in and has not previously signed out', () => {
        getCookieStub
            .mockImplementationOnce(() => null) // GU_U
            .mockImplementationOnce(() => null); // GU_SO
        local.set('gu.id.nextFbCheck', 'blah|blah');

        expect(shouldAutoSigninInUser()).toBe(false);

        local.remove('gu.id.nextFbCheck');
    });

    it('should not attempt to autosigin a user who is not currently signed in, has not previously signed out, before the facebook check overlaps', () => {
        getCookieStub
            .mockImplementationOnce(() => null) // GU_U
            .mockImplementationOnce(() => null); // GU_SO

        expect(shouldAutoSigninInUser()).toBe(true);
    });

    it('should not attempt to autosignin a signed in user', () => {
        expect(shouldAutoSigninInUser()).toBe(false);
    });

    it('should attempt to autosignin a user who has signed out more than 24 hours ago after the facebook check has ellapsed', () => {
        const today = new Date();
        const theDayBeforeYesterday = new Date();

        theDayBeforeYesterday.setDate(today.getDate() - 2);

        const timeStampInSeconds = theDayBeforeYesterday.getTime() / 1000;

        getCookieStub
            .mockImplementationOnce(() => null) // GU_U
            .mockImplementationOnce(() => timeStampInSeconds.toString()); // GU_SO

        expect(shouldAutoSigninInUser()).toBe(true);
    });

    it('should not attempt to autosignin a user who has signed out more than 24 hours ago before the facebook check has ellapsed', () => {
        const theDayBeforeYesterday = new Date();

        theDayBeforeYesterday.setDate(new Date().getDate() - 2);

        const timeStampInSeconds = theDayBeforeYesterday.getTime() / 1000;

        getCookieStub
            .mockImplementationOnce(() => null) // GU_U
            .mockImplementationOnce(() => timeStampInSeconds.toString()); // GU_SO
        local.set('gu.id.nextFbCheck', 'blah|blah');

        expect(shouldAutoSigninInUser()).toBe(false);

        local.remove('gu.id.nextFbCheck');
    });

    it('should not attempt to autosignin a user who has signed out within the last 24 hours', () => {
        const fourHoursAgo = new Date();

        fourHoursAgo.setHours(new Date().getHours() - 4);

        const timeStampInSeconds = fourHoursAgo.getTime() / 1000;

        getCookieStub
            .mockImplementationOnce(() => null) // GU_U
            .mockImplementationOnce(() => timeStampInSeconds.toString()); // GU_SO

        expect(shouldAutoSigninInUser()).toBe(false);
    });
});
