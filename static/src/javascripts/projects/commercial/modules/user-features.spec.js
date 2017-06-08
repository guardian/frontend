// @flow

import { addCookie, removeCookie, getCookie } from 'lib/cookies';
import fetchJson from 'lib/fetch-json';
import identity from 'common/modules/identity/api';
import { refresh } from './user-features.js';

jest.mock('projects/common/modules/identity/api', () => jest.fn());
jest.mock('lib/fetch-json', () => jest.fn());

const fetchJsonSpy: any = fetchJson;

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
            expect(fetchJsonSpy).toHaveBeenCalledTimes(1);
        });

        it('Performs an update if the user has expired data', () => {
            setAllFeaturesData({ isExpired: true });
            refresh();
            expect(fetchJsonSpy).toHaveBeenCalledTimes(1);
        });

        it('Does not delete the data just because it has expired', () => {
            setAllFeaturesData({ isExpired: true });
            refresh();
            expect(getCookie(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE)).toBe(
                'true'
            );
            expect(
                getCookie(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE)
            ).toEqual(expect.stringMatching(/\d{13}/));
            expect(getCookie(PERSISTENCE_KEYS.AD_FREE_USER_COOKIE)).toBe(
                'false'
            );
        });

        it('Does not perform update if user has fresh feature data', () => {
            setAllFeaturesData({ isExpired: false });
            refresh();
            expect(fetchJsonSpy).not.toHaveBeenCalled();
        });

        it('Performs an update if membership-frontend wipes just the paying-member cookie', () => {
            // Set everything except paying-member cookie
            setAllFeaturesData({ isExpired: true });
            removeCookie(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE);

            refresh();
            expect(fetchJsonSpy).toHaveBeenCalledTimes(1);
        });

        it('Performs an update if the ad-free state is missing', () => {
            // Set everything except the ad-free cookie
            setAllFeaturesData({ isExpired: true });
            removeCookie(PERSISTENCE_KEYS.AD_FREE_USER_COOKIE);

            refresh();
            expect(fetchJsonSpy).toHaveBeenCalledTimes(1);
        });
    });
});
