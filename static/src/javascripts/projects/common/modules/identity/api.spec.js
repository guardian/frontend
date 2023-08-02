/* global jsdom */
import {
    getUserFromApi,
    init,
    decodeBase64,
    getUserFromCookie,
    reset,
    shouldAutoSigninInUser,
} from 'common/modules/identity/api';
import { fetchJson as fetchJson_ } from 'lib/fetch-json';
import { removeCookie, setCookie, storage } from '@guardian/libs';

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
