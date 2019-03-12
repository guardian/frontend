// @flow

import { addCookie, removeCookie, getCookie } from 'lib/cookies';
import fetchJson from 'lib/fetch-json';
import { isUserLoggedIn as isUserLoggedIn_ } from 'common/modules/identity/api';
import config from 'lib/config';
import {
    refresh,
    isAdFreeUser,
    isPayingMember,
    isRecurringContributor,
    accountDataUpdateWarning,
    isDigitalSubscriber,
    getLastOneOffContributionDate,
    getDaysSinceLastOneOffContribution,
    isRecentOneOffContributor,
} from './user-features.js';

jest.mock('lib/raven');
jest.mock('projects/common/modules/identity/api', () => ({
    isUserLoggedIn: jest.fn(),
}));
jest.mock('lib/fetch-json', () => jest.fn(() => Promise.resolve()));

const fetchJsonSpy: any = fetchJson;
const isUserLoggedIn: any = isUserLoggedIn_;

const PERSISTENCE_KEYS = {
    USER_FEATURES_EXPIRY_COOKIE: 'gu_user_features_expiry',
    PAYING_MEMBER_COOKIE: 'gu_paying_member',
    RECURRING_CONTRIBUTOR_COOKIE: 'gu_recurring_contributor',
    AD_FREE_USER_COOKIE: 'GU_AF1',
    ACTION_REQUIRED_FOR_COOKIE: 'gu_action_required_for',
    DIGITAL_SUBSCRIBER_COOKIE: 'gu_digital_subscriber',
    SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE: 'gu.contributions.contrib-timestamp',
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
    addCookie(PERSISTENCE_KEYS.DIGITAL_SUBSCRIBER_COOKIE, 'true');
    addCookie(
        PERSISTENCE_KEYS.AD_FREE_USER_COOKIE,
        adFreeExpiryDate.getTime().toString()
    );
    addCookie(
        PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE,
        expiryDate.getTime().toString()
    );
    addCookie(PERSISTENCE_KEYS.ACTION_REQUIRED_FOR_COOKIE, 'test');
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
    removeCookie(PERSISTENCE_KEYS.DIGITAL_SUBSCRIBER_COOKIE);
    removeCookie(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE);
    removeCookie(PERSISTENCE_KEYS.AD_FREE_USER_COOKIE);
    removeCookie(PERSISTENCE_KEYS.ACTION_REQUIRED_FOR_COOKIE);
};

beforeAll(() => {
    config.set('switches.adFreeStrictExpiryEnforcement', true);
    config.set('page.userAttributesApiUrl', '');
});

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
                getCookie(PERSISTENCE_KEYS.DIGITAL_SUBSCRIBER_COOKIE)
            ).toBeNull();
            expect(
                getCookie(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE)
            ).toBeNull();
        });
    });
});

describe('The account data update warning getter', () => {
    it('Is not set when the user is logged out', () => {
        jest.resetAllMocks();
        isUserLoggedIn.mockReturnValue(false);
        expect(accountDataUpdateWarning()).toBe(null);
    });

    describe('When the user is logged in', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            isUserLoggedIn.mockReturnValue(true);
        });

        it('Is the same when the user has an account data update link cookie', () => {
            addCookie(PERSISTENCE_KEYS.ACTION_REQUIRED_FOR_COOKIE, 'the-same');
            expect(accountDataUpdateWarning()).toBe('the-same');
        });

        it('Is null when the user does not have an account data update link cookie', () => {
            removeCookie(PERSISTENCE_KEYS.ACTION_REQUIRED_FOR_COOKIE);
            expect(accountDataUpdateWarning()).toBe(null);
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

describe('The isDigitalSubscriber getter', () => {
    it('Is false when the user is logged out', () => {
        jest.resetAllMocks();
        isUserLoggedIn.mockReturnValue(false);
        expect(isDigitalSubscriber()).toBe(false);
    });

    describe('When the user is logged in', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            isUserLoggedIn.mockReturnValue(true);
        });

        it('Is true when the user has a `true` digital subscriber cookie', () => {
            addCookie(PERSISTENCE_KEYS.DIGITAL_SUBSCRIBER_COOKIE, 'true');
            expect(isDigitalSubscriber()).toBe(true);
        });

        it('Is false when the user has a `false` digital subscriber cookie', () => {
            addCookie(PERSISTENCE_KEYS.DIGITAL_SUBSCRIBER_COOKIE, 'false');
            expect(isDigitalSubscriber()).toBe(false);
        });

        it('Is false when the user has no digital subscriber cookie', () => {
            removeCookie(PERSISTENCE_KEYS.DIGITAL_SUBSCRIBER_COOKIE);
            expect(isDigitalSubscriber()).toBe(false);
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
                    digitalPack: false,
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
            expect(getCookie(PERSISTENCE_KEYS.DIGITAL_SUBSCRIBER_COOKIE)).toBe(
                'false'
            );
            expect(getCookie(PERSISTENCE_KEYS.AD_FREE_USER_COOKIE)).toBeNull();
        });
    });

    it('Puts the paying-member state and ad-free state in appropriate cookie', () => {
        fetchJsonSpy.mockReturnValueOnce(
            Promise.resolve({
                contentAccess: {
                    paidMember: true,
                    recurringContributor: true,
                    digitalPack: true,
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
            expect(getCookie(PERSISTENCE_KEYS.DIGITAL_SUBSCRIBER_COOKIE)).toBe(
                'true'
            );
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

const setOneOffContributionCookie = (value: any): void =>
    addCookie(PERSISTENCE_KEYS.SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE, value);

const removeOneOffContributionCookie = (): void =>
    removeCookie(PERSISTENCE_KEYS.SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE);

describe('getting the last one-off contribution date of a user', () => {
    beforeEach(() => {
        removeOneOffContributionCookie();
    });

    const contributionDateTimeISO8601 = '2018-01-06T09:30:14Z';
    const contributionDateTimeEpoch = Date.parse(contributionDateTimeISO8601);

    it("returns null if the user hasn't previously contributed", () => {
        expect(getLastOneOffContributionDate()).toBe(null);
    });

    it('returns the correct date if the user last contributed on contributions frontend', () => {
        setOneOffContributionCookie(contributionDateTimeISO8601);
        expect(getLastOneOffContributionDate()).toBe(contributionDateTimeEpoch);
    });

    it('return the correct date if the user last contributed on support frontend', () => {
        setOneOffContributionCookie(contributionDateTimeEpoch.toString());
        expect(getLastOneOffContributionDate()).toBe(contributionDateTimeEpoch);
    });

    it('returns null if the cookie has been set with an invalid value', () => {
        setOneOffContributionCookie('invalid value');
        expect(getLastOneOffContributionDate()).toBe(null);
    });
});

describe('getting the days since last contribution', () => {
    beforeEach(() => {
        removeOneOffContributionCookie();
    });

    const contributionDateTimeEpoch = Date.parse('2018-08-01T12:00:30Z');

    it('returns null if the last one-off contribution date is null', () => {
        expect(getDaysSinceLastOneOffContribution()).toBe(null);
    });

    it('returns the difference in days between the last contribution date and now if the last contribution date is set', () => {
        global.Date.now = jest.fn(() => Date.parse('2018-08-07T10:50:34'));
        setOneOffContributionCookie(contributionDateTimeEpoch);
        expect(getDaysSinceLastOneOffContribution()).toBe(5);
    });
});

describe('isRecentOneOffContributor', () => {
    beforeEach(() => {
        removeOneOffContributionCookie();
    });

    const contributionDateTimeEpoch = Date.parse('2018-08-01T12:00:30Z');

    it('returns false if there is no one-off contribution cookie', () => {
        expect(isRecentOneOffContributor()).toBe(false);
    });

    it('returns true if there are 5 days between the last contribution date and now', () => {
        global.Date.now = jest.fn(() => Date.parse('2018-08-07T10:50:34'));
        setOneOffContributionCookie(contributionDateTimeEpoch);
        expect(isRecentOneOffContributor()).toBe(true);
    });

    it('returns true if there are 0 days between the last contribution date and now', () => {
        global.Date.now = jest.fn(() => Date.parse('2018-08-01T13:00:30'));
        setOneOffContributionCookie(contributionDateTimeEpoch);
        expect(isRecentOneOffContributor()).toBe(true);
    });

    it('returns false if the one-off contribution was more than 6 months ago', () => {
        global.Date.now = jest.fn(() => Date.parse('2019-08-01T13:00:30'));
        setOneOffContributionCookie(contributionDateTimeEpoch);
        expect(isRecentOneOffContributor()).toBe(false);
    });
});
