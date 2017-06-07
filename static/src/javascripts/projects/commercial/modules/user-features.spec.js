// @flow

import { addCookie, removeCookie } from 'lib/cookies';
import identity from 'common/modules/identity/api';
import { refresh } from './user-features.js';

jest.mock('projects/common/modules/identity/api', () => jest.fn());
jest.mock('lib/fetch-json', () => jest.fn());
const fetchJsonSpy: any = require('lib/fetch-json');

jest.mock('lib/cookies', () => ({
    addCookie: jest.fn(),
    removeCookie: jest.fn(),
    getCookie: jest.fn(),
}));

const PERSISTENCE_KEYS = {
    USER_FEATURES_EXPIRY_COOKIE: 'gu_user_features_expiry',
    PAYING_MEMBER_COOKIE: 'gu_paying_member',
    AD_FREE_USER_COOKIE: 'GU_AFU',
};

const setAllFeaturesData = opts => {
    const currentTime = new Date().getTime();
    const msInOneDay = 24 * 60 * 60 * 1000;
    const expiryDate = opts.isExpired
        ? new Date(currentTime - msInOneDay)
        : new Date(currentTime + msInOneDay);

    addCookie(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE, 'true');
    addCookie(PERSISTENCE_KEYS.AD_FREE_USER_COOKIE, 'false');
    addCookie(
        PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE,
        expiryDate.getTime().toString()
    );
};

const deleteAllFeaturesData = () => {
    removeCookie(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE);
    removeCookie(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE);
    removeCookie(PERSISTENCE_KEYS.AD_FREE_USER_COOKIE);
};

describe('Refreshing the features data', () => {
    describe('If user signed in', () => {
        beforeEach(() => {
            identity.isUserLoggedIn = () => true;
            jest.resetAllMocks();
            fetchJsonSpy.mockReturnValue(Promise.resolve());
        });

        it('Performs an update if the user has missing data', () => {
            deleteAllFeaturesData();
            refresh();
            expect(fetchJsonSpy).toHaveBeenCalled();
        });

        it('Performs an update if the user has expired data', () => {
            setAllFeaturesData({ isExpired: true });
            refresh();
            expect(addCookie).toHaveBeenCalled();
        });

        it('Does not delete the data just because it has expired', () => {
            setAllFeaturesData({ isExpired: true });

            refresh();
            // need to clear mock here as function is called by deleteAllFeaturesData in previous test
            expect(removeCookie).not.toHaveBeenCalled();
        });
    });
});
