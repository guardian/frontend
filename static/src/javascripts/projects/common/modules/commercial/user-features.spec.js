// @flow

import { addCookie, removeCookie, getCookie } from 'lib/cookies';
import fetchJson from 'lib/fetch-json';
import { isUserLoggedIn as isUserLoggedIn_ } from 'common/modules/identity/api';
import {
    refresh,
    isAdFreeUser,
    isPayingMember,
    isRecurringContributor,
} from './user-features.js';

jest.mock('projects/common/modules/identity/api', () => ({
    isUserLoggedIn: jest.fn(),
}));
jest.mock('lib/fetch-json', () => jest.fn(() => Promise.resolve()));

jest.mock('lib/config', () => ({
    switches: {
        adFreeSubscriptionTrial: true,
        adFreeStrictExpiryEnforcement: true,
    },
    page: {
        userAttributesApiUrl: '',
    },
}));

const fetchJsonSpy: any = fetchJson;
const isUserLoggedIn: any = isUserLoggedIn_;

const PERSISTENCE_KEYS = {
    USER_FEATURES_EXPIRY_COOKIE: 'gu_user_features_expiry',
    PAYING_MEMBER_COOKIE: 'gu_paying_member',
    RECURRING_CONTRIBUTOR_COOKIE: 'gu_recurring_contributor',
    AD_FREE_USER_COOKIE: 'GU_AF1',
};

const setAllFeaturesData = opts => {
    const currentTime = new Date().getTime();
    const msInOneDay = 24 * 60 * 60 * 1000;
    const expiryDate = opts.isExpired
        ? new Date(currentTime - msInOneDay)
        : new Date(currentTime + msInOneDay);
    const adFreeExpiryDate = opts.isExpired
        ? new Date(currentTime - msInOneDay * 2)
        : new Date(currentTime + msInOneDay * 2);
    addCookie(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE, 'true');
    addCookie(PERSISTENCE_KEYS.RECURRING_CONTRIBUTOR_COOKIE, 'true');
    addCookie(
        PERSISTENCE_KEYS.AD_FREE_USER_COOKIE,
        adFreeExpiryDate.getTime().toString()
    );
    addCookie(
        PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE,
        expiryDate.getTime().toString()
    );
};

const setExpiredAdFreeData = () => {
    const currentTime = new Date().getTime();
    const msInOneDay = 24 * 60 * 60 * 1000;
    const expiryDate = new Date(currentTime - msInOneDay * 2);
    addCookie(
        PERSISTENCE_KEYS.AD_FREE_USER_COOKIE,
        expiryDate.getTime().toString()
    );
};

const deleteAllFeaturesData = () => {
    removeCookie(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE);
    removeCookie(PERSISTENCE_KEYS.RECURRING_CONTRIBUTOR_COOKIE);
    removeCookie(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE);
    removeCookie(PERSISTENCE_KEYS.AD_FREE_USER_COOKIE);
};

describe('Refreshing the features data', () => {
    describe('If user signed in', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            isUserLoggedIn.mockReturnValue(true);
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
                getCookie(PERSISTENCE_KEYS.RECURRING_CONTRIBUTOR_COOKIE)
            ).toBe('true');
            expect(
                getCookie(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE)
            ).toEqual(expect.stringMatching(/\d{13}/));
            expect(getCookie(PERSISTENCE_KEYS.AD_FREE_USER_COOKIE)).toEqual(
                expect.stringMatching(/\d{13}/)
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

        it('Performs an update if the ad-free state is stale and strict expiry enforcement is enabled', () => {
            // This is a slightly synthetic setup - the ad-free cookie is rewritten with every
            // refresh that happens as a result of expired features data, but we want to check
            // that a refresh could be triggered based on ad-free state alone if the strict
            // expiry enforcement switch is ON.
            // Set everything except the ad-free cookie
            setAllFeaturesData({ isExpired: false });
            setExpiredAdFreeData();

            refresh();
            expect(fetchJsonSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('If user signed out', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            isUserLoggedIn.mockReturnValue(false);
            fetchJsonSpy.mockReturnValue(Promise.resolve());
        });

        it('Does not perform update, even if feature data missing', () => {
            deleteAllFeaturesData();
            refresh();
            expect(fetchJsonSpy).not.toHaveBeenCalled();
        });

        it('Deletes leftover feature data', () => {
            setAllFeaturesData({ isExpired: false });
            refresh();
            expect(getCookie(PERSISTENCE_KEYS.AD_FREE_USER_COOKIE)).toBeNull();
            expect(getCookie(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE)).toBeNull();
            expect(
                getCookie(PERSISTENCE_KEYS.RECURRING_CONTRIBUTOR_COOKIE)
            ).toBeNull();
            expect(
                getCookie(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE)
            ).toBeNull();
        });
    });
});

describe('The isAdFreeUser getter', () => {
    it('Is false when the user is logged out', () => {
        jest.resetAllMocks();
        isUserLoggedIn.mockReturnValue(false);
        expect(isAdFreeUser()).toBe(false);
    });
});

describe('The isPayingMember getter', () => {
    it('Is false when the user is logged out', () => {
        jest.resetAllMocks();
        isUserLoggedIn.mockReturnValue(false);
        expect(isPayingMember()).toBe(false);
    });

    describe('When the user is logged in', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            isUserLoggedIn.mockReturnValue(true);
        });

        it('Is true when the user has a `true` paying member cookie', () => {
            addCookie(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE, 'true');
            expect(isPayingMember()).toBe(true);
        });

        it('Is false when the user has a `false` paying member cookie', () => {
            addCookie(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE, 'false');
            expect(isPayingMember()).toBe(false);
        });

        it('Is true when the user has no paying member cookie', () => {
            // If we don't know, we err on the side of caution, rather than annoy paying users
            removeCookie(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE);
            expect(isPayingMember()).toBe(true);
        });
    });
});

describe('The isRecurringContributor getter', () => {
    it('Is false when the user is logged out', () => {
        jest.resetAllMocks();
        isUserLoggedIn.mockReturnValue(false);
        expect(isRecurringContributor()).toBe(false);
    });

    describe('When the user is logged in', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            isUserLoggedIn.mockReturnValue(true);
        });

        it('Is true when the user has a `true` recurring contributor cookie', () => {
            addCookie(PERSISTENCE_KEYS.RECURRING_CONTRIBUTOR_COOKIE, 'true');
            expect(isRecurringContributor()).toBe(true);
        });

        it('Is false when the user has a `false` recurring contributor cookie', () => {
            addCookie(PERSISTENCE_KEYS.RECURRING_CONTRIBUTOR_COOKIE, 'false');
            expect(isRecurringContributor()).toBe(false);
        });

        it('Is true when the user has no recurring contributor cookie', () => {
            // If we don't know, we err on the side of caution, rather than annoy paying users
            removeCookie(PERSISTENCE_KEYS.RECURRING_CONTRIBUTOR_COOKIE);
            expect(isRecurringContributor()).toBe(true);
        });
    });
});

describe('Storing new feature data', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        fetchJsonSpy.mockReturnValue(Promise.resolve());
        deleteAllFeaturesData();
        isUserLoggedIn.mockReturnValue(true);
    });

    it('Puts the paying-member state and ad-free state in appropriate cookie', () => {
        fetchJsonSpy.mockReturnValueOnce(
            Promise.resolve({
                contentAccess: {
                    paidMember: false,
                    recurringContributor: false,
                },
                adFree: false,
            })
        );
        return refresh().then(() => {
            expect(getCookie(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE)).toBe(
                'false'
            );
            expect(
                getCookie(PERSISTENCE_KEYS.RECURRING_CONTRIBUTOR_COOKIE)
            ).toBe('false');
            expect(getCookie(PERSISTENCE_KEYS.AD_FREE_USER_COOKIE)).toBeNull();
        });
    });

    it('Puts the paying-member state and ad-free state in appropriate cookie', () => {
        fetchJsonSpy.mockReturnValueOnce(
            Promise.resolve({
                contentAccess: {
                    paidMember: true,
                    recurringContributor: true,
                },
                adFree: true,
            })
        );
        return refresh().then(() => {
            expect(getCookie(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE)).toBe(
                'true'
            );
            expect(
                getCookie(PERSISTENCE_KEYS.RECURRING_CONTRIBUTOR_COOKIE)
            ).toBe('true');
            expect(
                getCookie(PERSISTENCE_KEYS.AD_FREE_USER_COOKIE)
            ).toBeTruthy();
            expect(
                Number.isNaN(
                    parseInt(
                        getCookie(PERSISTENCE_KEYS.AD_FREE_USER_COOKIE),
                        10
                    )
                )
            ).toBe(false);
        });
    });

    it('Puts an expiry date in an accompanying cookie', () =>
        refresh().then(() => {
            const expiryDate = getCookie(
                PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE
            );
            expect(expiryDate).toBeTruthy();
            expect(Number.isNaN(parseInt(expiryDate, 10))).toBe(false);
        }));

    it('The expiry date is in the future', () =>
        refresh().then(() => {
            const expiryDateString = getCookie(
                PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE
            );
            const expiryDateEpoch = parseInt(expiryDateString, 10);
            const currentTimeEpoch = new Date().getTime();
            expect(currentTimeEpoch < expiryDateEpoch).toBe(true);
        }));
});
