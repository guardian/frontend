/* global jsdom */

import {
    getUserFromApi,
    init,
    decodeBase64,
    getUserFromCookie,
    reset,
    getUserOrSignIn,
    shouldAutoSigninInUser,
} from 'common/modules/identity/api';
import { fetchJson as fetchJson_ } from 'lib/fetch-json';
import { removeCookie, setCookie, storage } from '@guardian/libs';

const defaultConfig = {
	page: {
		idApiUrl: 'https://idapi.theguardian.com',
		idUrl: 'https://profile.theguardian.com',
	},
};
jest.mock('lib/config', () => {
	return Object.assign({}, defaultConfig, {
		get: (path = '', defaultValue) =>
			path
				.replace(/\[(.+?)]/g, '.$1')
				.split('.')
				.reduce((o, key) => o[key], defaultConfig) || defaultValue,
	});
});
jest.mock('lib/fetch-json', () => ({ fetchJson: jest.fn() }));
jest.mock('common/modules/async-call-merger', () => ({
    mergeCalls(callback) {
        callback.reset = jest.fn();

        return callback;
    },
}));

const fetchJson = fetchJson_;

const originalLocation = window.location;

describe('Identity API', () => {

    beforeEach(() => {
        setCookie({
			name: 'GU_U',
			value:
				'WyIyMzEwOTU5IiwiamdvcnJpZUBnbWFpbC5jb20iLCJBbSVDMyVBOWxpZSBKJUMzJUI0c2UiLCI1MzQiLDEzODI5NTMwMzE1OTEsMV0' +
				'.MC0CFBsFwIEITO91EGONK4puyO2ZgGQcAhUAqRa7PVDCoAjrbnJNYYvMFec4fAY',
		});
		removeCookie({
			name: 'GU_SO',
		});
        delete window.location;
        window.location = Object.defineProperties(
            {},
            {
                ...Object.getOwnPropertyDescriptors(originalLocation),
                assign: {
                    configurable: true,
                    value: (url) => jsdom.reconfigure({ url }),
                },
            },
        );
    });

    afterEach(() => {
        reset();
        jest.resetAllMocks();
    });

    it('gets user from cookie', () => {
        const user = getUserFromCookie();
        const displayName = user && user.publicFields && user.publicFields.displayName;

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
			expect(fetchJson).toHaveBeenCalledWith(
				'https://idapi.theguardian.com/user/me',
				{
					mode: 'cors',
					credentials: 'include',
				},
			);
            done();
        };

        fetchJson.mockImplementationOnce(() =>
            Promise.resolve({
                status: 'ok',
                user: expectedUser,
            })
        );

        getUserFromApi(apiCallback);
    });

    it('should not call api if the cookie does not exist', done => {
        removeCookie({ name: 'GU_U' });

        const apiCallback = user => {
            expect(user).toBe(null);
            expect(fetchJson).not.toHaveBeenCalled();
            done();
        };

        getUserFromApi(apiCallback);
    });

    it('should redirect to sign in when user is not signed in', () => {
        const origHref = window.location.href;

        const returnUrl = 'https://theguardian.com/uk';
        window.location.assign(returnUrl);

        removeCookie({ name: 'GU_U' });
        getUserOrSignIn('email_sign_in_banner');

        expect(window.location.href).toBe(
            `${defaultConfig.page.idUrl}/signin?returnUrl=${encodeURIComponent(
                returnUrl
            )}&componentEventParams=componentType%3Didentityauthentication%26componentId%3Demail_sign_in_banner`
        );

        window.location.assign(origHref);
    });

    it('should not redirect to sign in when user is already signed in', () => {
        const user = getUserOrSignIn('email_sign_in_banner');
        const displayName = user && user.publicFields && user.publicFields.displayName;

        expect(displayName).toBe('Amélie Jôse');
    });

    it('should redirect with return URL when given', () => {
        const origHref = window.location.href;
        const returnUrl = 'http://www.theguardian.com/foo';

        removeCookie({ name: 'GU_U' });
        getUserOrSignIn('email_sign_in_banner', returnUrl);

        expect(window.location.href).toBe(
            `${defaultConfig.page.idUrl}/signin?returnUrl=${encodeURIComponent(
                returnUrl
            )}&componentEventParams=componentType%3Didentityauthentication%26componentId%3Demail_sign_in_banner`
        );

        window.location.assign(origHref);
    });

    it('should attempt to autosigin an user who is not currently signed in and has not previously signed out', () => {
        removeCookie({ name: 'GU_U' });
		removeCookie({ name: 'GU_SO' });
            storage.local.set('gu.id.nextFbCheck', 'blah|blah');

        expect(shouldAutoSigninInUser()).toBe(false);

        storage.local.remove('gu.id.nextFbCheck');
    });

    it('should not attempt to autosigin a user who is not currently signed in, has not previously signed out, before the facebook check overlaps', () => {
        removeCookie({ name: 'GU_U' });
		removeCookie({ name: 'GU_SO' });

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

        removeCookie({ name: 'GU_U' });
		setCookie({ name: 'GU_SO', value: timeStampInSeconds.toString() });

        expect(shouldAutoSigninInUser()).toBe(true);
    });

    it('should not attempt to autosignin a user who has signed out more than 24 hours ago before the facebook check has ellapsed', () => {
        const theDayBeforeYesterday = new Date();

        theDayBeforeYesterday.setDate(new Date().getDate() - 2);

        const timeStampInSeconds = theDayBeforeYesterday.getTime() / 1000;

        removeCookie({ name: 'GU_U' });
		setCookie({ name: 'GU_SO', value: timeStampInSeconds.toString() });
            storage.local.set('gu.id.nextFbCheck', 'blah|blah');

        expect(shouldAutoSigninInUser()).toBe(false);

        storage.local.remove('gu.id.nextFbCheck');
    });

    it('should not attempt to autosignin a user who has signed out within the last 24 hours', () => {
        const fourHoursAgo = new Date();

        fourHoursAgo.setHours(new Date().getHours() - 4);

        const timeStampInSeconds = fourHoursAgo.getTime() / 1000;

        removeCookie({ name: 'GU_U' });
		setCookie({ name: 'GU_SO', value: timeStampInSeconds.toString() });

        expect(shouldAutoSigninInUser()).toBe(false);
    });
});
