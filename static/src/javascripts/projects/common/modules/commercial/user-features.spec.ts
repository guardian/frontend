import { getCookie } from '@guardian/libs';
import type { UserFeaturesResponse } from 'types/membership';
import config from '../../../../lib/config';
import { addCookie, removeCookie } from '../../../../lib/cookies';
import { fetchJson } from '../../../../lib/fetch-json';
import { isUserLoggedIn as isUserLoggedIn_ } from '../identity/api';
import {
	accountDataUpdateWarning,
	getDaysSinceLastOneOffContribution,
	getLastOneOffContributionTimestamp,
	getLastRecurringContributionDate,
	isAdFreeUser,
	isDigitalSubscriber,
	isPayingMember,
	isPostAskPauseOneOffContributor,
	isRecentOneOffContributor,
	isRecurringContributor,
	refresh,
	shouldNotBeShownSupportMessaging,
} from './user-features';

jest.mock('../../../../lib/raven');
jest.mock('projects/common/modules/identity/api', () => ({
	isUserLoggedIn: jest.fn(),
}));
jest.mock('../../../../lib/fetch-json', () => ({
	fetchJson: jest.fn(() => Promise.resolve()),
}));

const fetchJsonSpy = fetchJson as jest.MockedFunction<typeof fetchJson>;
const isUserLoggedIn = isUserLoggedIn_ as jest.MockedFunction<
	typeof isUserLoggedIn_
>;

const PERSISTENCE_KEYS = {
	USER_FEATURES_EXPIRY_COOKIE: 'gu_user_features_expiry',
	PAYING_MEMBER_COOKIE: 'gu_paying_member',
	RECURRING_CONTRIBUTOR_COOKIE: 'gu_recurring_contributor',
	AD_FREE_USER_COOKIE: 'GU_AF1',
	ACTION_REQUIRED_FOR_COOKIE: 'gu_action_required_for',
	DIGITAL_SUBSCRIBER_COOKIE: 'gu_digital_subscriber',
	SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE: 'gu.contributions.contrib-timestamp',
	ONE_OFF_CONTRIBUTION_DATE_COOKIE: 'gu_one_off_contribution_date',
	HIDE_SUPPORT_MESSAGING_COOKIE: 'gu_hide_support_messaging',
	SUPPORT_MONTHLY_CONTRIBUTION_COOKIE:
		'gu.contributions.recurring.contrib-timestamp.Monthly',
	SUPPORT_ANNUAL_CONTRIBUTION_COOKIE:
		'gu.contributions.recurring.contrib-timestamp.Annual',
};

const setAllFeaturesData = (opts: { isExpired: boolean }) => {
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
	addCookie(PERSISTENCE_KEYS.HIDE_SUPPORT_MESSAGING_COOKIE, 'true');
	addCookie(
		PERSISTENCE_KEYS.AD_FREE_USER_COOKIE,
		adFreeExpiryDate.getTime().toString(),
	);
	addCookie(
		PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE,
		expiryDate.getTime().toString(),
	);
	addCookie(PERSISTENCE_KEYS.ACTION_REQUIRED_FOR_COOKIE, 'test');
};

const setExpiredAdFreeData = () => {
	const currentTime = new Date().getTime();
	const msInOneDay = 24 * 60 * 60 * 1000;
	const expiryDate = new Date(currentTime - msInOneDay * 2);
	addCookie(
		PERSISTENCE_KEYS.AD_FREE_USER_COOKIE,
		expiryDate.getTime().toString(),
	);
};

const deleteAllFeaturesData = () => {
	removeCookie(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE);
	removeCookie(PERSISTENCE_KEYS.RECURRING_CONTRIBUTOR_COOKIE);
	removeCookie(PERSISTENCE_KEYS.DIGITAL_SUBSCRIBER_COOKIE);
	removeCookie(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE);
	removeCookie(PERSISTENCE_KEYS.AD_FREE_USER_COOKIE);
	removeCookie(PERSISTENCE_KEYS.ACTION_REQUIRED_FOR_COOKIE);
	removeCookie(PERSISTENCE_KEYS.HIDE_SUPPORT_MESSAGING_COOKIE);
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

		it('Performs an update if the user has missing data', async () => {
			deleteAllFeaturesData();
			await refresh();
			expect(fetchJsonSpy).toHaveBeenCalledTimes(1);
		});

		it('Performs an update if the user has expired data', async () => {
			setAllFeaturesData({ isExpired: true });
			await refresh();
			expect(fetchJsonSpy).toHaveBeenCalledTimes(1);
		});

		it('Does not delete the data just because it has expired', async () => {
			setAllFeaturesData({ isExpired: true });
			await refresh();
			expect(
				getCookie({ name: PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE }),
			).toBe('true');
			expect(
				getCookie({
					name: PERSISTENCE_KEYS.RECURRING_CONTRIBUTOR_COOKIE,
				}),
			).toBe('true');
			expect(
				getCookie({
					name: PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE,
				}),
			).toEqual(expect.stringMatching(/\d{13}/));
			expect(
				getCookie({ name: PERSISTENCE_KEYS.AD_FREE_USER_COOKIE }),
			).toEqual(expect.stringMatching(/\d{13}/));
		});

		it('Does not perform update if user has fresh feature data', async () => {
			setAllFeaturesData({ isExpired: false });
			await refresh();
			expect(fetchJsonSpy).not.toHaveBeenCalled();
		});

		it('Performs an update if membership-frontend wipes just the paying-member cookie', async () => {
			// Set everything except paying-member cookie
			setAllFeaturesData({ isExpired: true });
			removeCookie(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE);

			await refresh();
			expect(fetchJsonSpy).toHaveBeenCalledTimes(1);
		});

		it('Performs an update if the ad-free state is stale and strict expiry enforcement is enabled', async () => {
			// This is a slightly synthetic setup - the ad-free cookie is rewritten with every
			// refresh that happens as a result of expired features data, but we want to check
			// that a refresh could be triggered based on ad-free state alone if the strict
			// expiry enforcement switch is ON.
			// Set everything except the ad-free cookie
			setAllFeaturesData({ isExpired: false });
			setExpiredAdFreeData();

			await refresh();
			expect(fetchJsonSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('If user signed out', () => {
		beforeEach(() => {
			jest.resetAllMocks();
			isUserLoggedIn.mockReturnValue(false);
			fetchJsonSpy.mockReturnValue(Promise.resolve());
		});

		it('Does not perform update, even if feature data missing', async () => {
			deleteAllFeaturesData();
			await refresh();
			expect(fetchJsonSpy).not.toHaveBeenCalled();
		});

		it('Deletes leftover feature data', async () => {
			setAllFeaturesData({ isExpired: false });
			await refresh();
			expect(
				getCookie({ name: PERSISTENCE_KEYS.AD_FREE_USER_COOKIE }),
			).toBeNull();
			expect(
				getCookie({ name: PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE }),
			).toBeNull();
			expect(
				getCookie({
					name: PERSISTENCE_KEYS.RECURRING_CONTRIBUTOR_COOKIE,
				}),
			).toBeNull();
			expect(
				getCookie({ name: PERSISTENCE_KEYS.DIGITAL_SUBSCRIBER_COOKIE }),
			).toBeNull();
			expect(
				getCookie({
					name: PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE,
				}),
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

describe('The shouldNotBeShownSupportMessaging getter', () => {
	it('Returns false when the user is logged out', () => {
		jest.resetAllMocks();
		isUserLoggedIn.mockReturnValue(false);
		expect(shouldNotBeShownSupportMessaging()).toBe(false);
	});

	describe('When the user is logged in', () => {
		beforeEach(() => {
			jest.resetAllMocks();
			isUserLoggedIn.mockReturnValue(true);
		});

		it('Returns true when the user has a `true` hide support messaging cookie', () => {
			addCookie(PERSISTENCE_KEYS.HIDE_SUPPORT_MESSAGING_COOKIE, 'true');
			expect(shouldNotBeShownSupportMessaging()).toBe(true);
		});

		it('Returns false when the user has a `false` hide support messaging cookie', () => {
			addCookie(PERSISTENCE_KEYS.HIDE_SUPPORT_MESSAGING_COOKIE, 'false');
			expect(shouldNotBeShownSupportMessaging()).toBe(false);
		});

		it('Returns false when the user has no hide support messaging cookie', () => {
			removeCookie(PERSISTENCE_KEYS.HIDE_SUPPORT_MESSAGING_COOKIE);
			expect(shouldNotBeShownSupportMessaging()).toBe(false);
		});
	});
});

describe('Storing new feature data', () => {
	beforeEach(() => {
		const mockResponse: UserFeaturesResponse = {
			userId: 'abc',
			showSupportMessaging: false,
			contentAccess: {
				member: false,
				paidMember: false,
				recurringContributor: false,
				digitalPack: false,
				paperSubscriber: false,
				guardianWeeklySubscriber: false,
			},
		};

		jest.resetAllMocks();
		fetchJsonSpy.mockReturnValue(Promise.resolve(mockResponse));
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
			}),
		);
		return refresh().then(() => {
			expect(
				getCookie({ name: PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE }),
			).toBe('false');
			expect(
				getCookie({
					name: PERSISTENCE_KEYS.RECURRING_CONTRIBUTOR_COOKIE,
				}),
			).toBe('false');
			expect(
				getCookie({ name: PERSISTENCE_KEYS.DIGITAL_SUBSCRIBER_COOKIE }),
			).toBe('false');
			expect(
				getCookie({ name: PERSISTENCE_KEYS.AD_FREE_USER_COOKIE }),
			).toBeNull();
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
			}),
		);
		return refresh().then(() => {
			expect(
				getCookie({ name: PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE }),
			).toBe('true');
			expect(
				getCookie({
					name: PERSISTENCE_KEYS.RECURRING_CONTRIBUTOR_COOKIE,
				}),
			).toBe('true');
			expect(
				getCookie({ name: PERSISTENCE_KEYS.DIGITAL_SUBSCRIBER_COOKIE }),
			).toBe('true');
			expect(
				getCookie({ name: PERSISTENCE_KEYS.AD_FREE_USER_COOKIE }),
			).toBeTruthy();
			expect(
				Number.isNaN(
					parseInt(
						// @ts-expect-error -- we’re testing it
						getCookie({
							name: PERSISTENCE_KEYS.AD_FREE_USER_COOKIE,
						}),
						10,
					),
				),
			).toBe(false);
		});
	});

	it('Puts an expiry date in an accompanying cookie', () =>
		refresh().then(() => {
			const expiryDate = getCookie({
				name: PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE,
			});
			expect(expiryDate).toBeTruthy();
			// @ts-expect-error -- we’re testing it
			expect(Number.isNaN(parseInt(expiryDate, 10))).toBe(false);
		}));

	it('The expiry date is in the future', () =>
		refresh().then(() => {
			const expiryDateString = getCookie({
				name: PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE,
			});
			// @ts-expect-error -- we’re testing it
			const expiryDateEpoch = parseInt(expiryDateString, 10);
			const currentTimeEpoch = new Date().getTime();
			expect(currentTimeEpoch < expiryDateEpoch).toBe(true);
		}));
});

const setSupportFrontendOneOffContributionCookie = (value: string) =>
	addCookie(PERSISTENCE_KEYS.SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE, value);

const removeSupportFrontendOneOffContributionCookie = () =>
	removeCookie(PERSISTENCE_KEYS.SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE);

const setAttributesOneOffContributionCookie = (value: string) =>
	addCookie(PERSISTENCE_KEYS.ONE_OFF_CONTRIBUTION_DATE_COOKIE, value);

const removeAttributesOneOffContributionCookie = () =>
	removeCookie(PERSISTENCE_KEYS.ONE_OFF_CONTRIBUTION_DATE_COOKIE);

describe('getting the last one-off contribution date of a user', () => {
	beforeEach(() => {
		removeSupportFrontendOneOffContributionCookie();
		removeAttributesOneOffContributionCookie();
	});

	const contributionDate = '2018-01-06';
	const contributionDateTimeEpoch = Date.parse(contributionDate);

	it("returns null if the user hasn't previously contributed", () => {
		expect(getLastOneOffContributionTimestamp()).toBe(null);
	});

	it('return the correct date if the user support-frontend contribution cookie is set', () => {
		setSupportFrontendOneOffContributionCookie(
			contributionDateTimeEpoch.toString(),
		);
		expect(getLastOneOffContributionTimestamp()).toBe(
			contributionDateTimeEpoch,
		);
	});

	it('returns null if the cookie has been set with an invalid value', () => {
		setSupportFrontendOneOffContributionCookie('invalid value');
		expect(getLastOneOffContributionTimestamp()).toBe(null);
	});

	it('returns the correct date if cookie from attributes is set', () => {
		setAttributesOneOffContributionCookie(contributionDate.toString());
		expect(getLastOneOffContributionTimestamp()).toBe(
			contributionDateTimeEpoch,
		);
	});
});

const setMonthlyContributionCookie = (value: string) =>
	addCookie(PERSISTENCE_KEYS.SUPPORT_MONTHLY_CONTRIBUTION_COOKIE, value);

const setAnnualContributionCookie = (value: string) =>
	addCookie(PERSISTENCE_KEYS.SUPPORT_ANNUAL_CONTRIBUTION_COOKIE, value);

const removeMonthlyContributionCookie = () =>
	removeCookie(PERSISTENCE_KEYS.SUPPORT_MONTHLY_CONTRIBUTION_COOKIE);

const removeAnnualContributionCookie = () =>
	removeCookie(PERSISTENCE_KEYS.SUPPORT_ANNUAL_CONTRIBUTION_COOKIE);

describe('getting the last recurring contribution date of a user', () => {
	beforeEach(() => {
		removeMonthlyContributionCookie();
		removeAnnualContributionCookie();
	});

	const monthlyContributionTimestamp = 1556124724;
	const annualContributionTimestamp = 1556125286;

	it("returns null if the user isn't a recurring contributor", () => {
		expect(getLastRecurringContributionDate()).toBe(null);
	});

	it('return the correct date if the user is a monthly recurring contributor', () => {
		setMonthlyContributionCookie(monthlyContributionTimestamp.toString());
		expect(getLastRecurringContributionDate()).toBe(
			monthlyContributionTimestamp,
		);
	});

	it('return the correct date if the user is a annual recurring contributor', () => {
		setAnnualContributionCookie(annualContributionTimestamp.toString());
		expect(getLastRecurringContributionDate()).toBe(
			annualContributionTimestamp,
		);
	});

	it('return the correct date if the user is both annual and monthly recurring contributor', () => {
		setAnnualContributionCookie(annualContributionTimestamp.toString());
		setMonthlyContributionCookie(monthlyContributionTimestamp.toString());
		expect(getLastRecurringContributionDate()).toBe(
			annualContributionTimestamp,
		);
	});

	it('returns null if the cookie has been set with an invalid value', () => {
		setAnnualContributionCookie('not a date string one');
		setMonthlyContributionCookie('not a date string two');
		expect(getLastRecurringContributionDate()).toBe(null);
	});
});

describe('getting the days since last contribution', () => {
	beforeEach(() => {
		removeSupportFrontendOneOffContributionCookie();
		removeAttributesOneOffContributionCookie();
	});

	const contributionDateTimeEpoch = String(
		Date.parse('2018-08-01T12:00:30Z'),
	);

	it('returns null if the last one-off contribution date is null', () => {
		expect(getDaysSinceLastOneOffContribution()).toBe(null);
	});

	it('returns the difference in days between the last contribution date and now if the last contribution date is set', () => {
		global.Date.now = jest.fn(() => Date.parse('2018-08-07T10:50:34'));
		setSupportFrontendOneOffContributionCookie(contributionDateTimeEpoch);
		expect(getDaysSinceLastOneOffContribution()).toBe(5);
	});
});

describe('isRecentOneOffContributor', () => {
	beforeEach(() => {
		removeSupportFrontendOneOffContributionCookie();
		removeAttributesOneOffContributionCookie();
	});

	const contributionDateTimeEpoch = String(
		Date.parse('2018-08-01T12:00:30Z'),
	);

	it('returns false if there is no one-off contribution cookie', () => {
		expect(isRecentOneOffContributor()).toBe(false);
	});

	it('returns true if there are 5 days between the last contribution date and now', () => {
		global.Date.now = jest.fn(() => Date.parse('2018-08-07T10:50:34'));
		setSupportFrontendOneOffContributionCookie(contributionDateTimeEpoch);
		expect(isRecentOneOffContributor()).toBe(true);
	});

	it('returns true if there are 0 days between the last contribution date and now', () => {
		global.Date.now = jest.fn(() => Date.parse('2018-08-01T13:00:30'));
		setSupportFrontendOneOffContributionCookie(contributionDateTimeEpoch);
		expect(isRecentOneOffContributor()).toBe(true);
	});

	it('returns false if the one-off contribution was more than 3 months ago', () => {
		global.Date.now = jest.fn(() => Date.parse('2019-08-01T13:00:30'));
		setSupportFrontendOneOffContributionCookie(contributionDateTimeEpoch);
		expect(isRecentOneOffContributor()).toBe(false);
	});
});

describe('isPostAskPauseOneOffContributor', () => {
	beforeEach(() => {
		removeSupportFrontendOneOffContributionCookie();
		removeAttributesOneOffContributionCookie();
	});

	const contributionDateTimeEpoch = String(
		Date.parse('2018-08-01T12:00:30Z'),
	);

	it('returns false if there is no one-off contribution cookie', () => {
		expect(isPostAskPauseOneOffContributor()).toBe(false);
	});

	it('returns false if there are 5 days between the last contribution date and now', () => {
		global.Date.now = jest.fn(() => Date.parse('2018-08-07T10:50:34'));
		setSupportFrontendOneOffContributionCookie(contributionDateTimeEpoch);
		expect(isPostAskPauseOneOffContributor()).toBe(false);
	});

	it('returns true if the one-off contribution was more than 3 months ago', () => {
		global.Date.now = jest.fn(() => Date.parse('2019-02-01T13:00:30'));
		setSupportFrontendOneOffContributionCookie(contributionDateTimeEpoch);
		expect(isPostAskPauseOneOffContributor()).toBe(true);
	});
});
