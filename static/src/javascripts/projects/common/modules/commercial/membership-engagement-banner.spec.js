// @flow
import fakeMediator from 'lib/mediator';
import fakeConfig from 'lib/config';
import fakeOphan from 'ophan/ng';
import fetchJson from 'lib/fetch-json';
import userPrefs from 'common/modules/user-prefs';
import { defaultEngagementBannerParams as defaultEngagementBannerParams_ } from 'common/modules/commercial/membership-engagement-banner-parameters';
import {
    membershipEngagementBanner,
    deriveBannerParams as deriveBannerParams_,
} from 'common/modules/commercial/membership-engagement-banner';
import { pageShouldHideReaderRevenue } from 'common/modules/commercial/contributions-utilities';

const defaultEngagementBannerParams: any = defaultEngagementBannerParams_;
const deriveBannerParams: any = deriveBannerParams_;

jest.mock('lib/raven');
jest.mock('lib/mediator');
jest.mock('lib/storage', () => ({
    local: {
        get: jest.fn(() => 10), // gu.alreadyVisited
        set: jest.fn(),
        isAvailable: jest.fn(),
    },
}));
jest.mock('lib/url', () => ({
    constructQuery: jest.fn(() => ''),
}));
jest.mock('lib/geolocation', () => ({
    getSync: jest.fn(() => 'GB'),
    getLocalCurrencySymbol: () => '£',
}));
jest.mock('common/modules/experiments/ab-core', () => ({
    firstRunnableTest: jest.fn(() => ({
        campaignId: 'fake-campaign-id',
        id: 'fake-test-id',
        start: '2017-01-01',
        expiry: '2027-01-01',
        author: 'fake-author',
        description: 'fake-description',
        audience: 1,
        audienceOffset: 0,
        successMeasure: 'fake success measure',
        audienceCriteria: 'fake audience criteria',
        variants: [{ id: 'fake-variant-id' }],
        variantToRun: { id: 'fake-variant-id' },
        canRun: () => true,
        componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    })),
}));
jest.mock('common/modules/experiments/ab-tests', () => ({
    engagementBannerTests: [
        {
            campaignId: 'fake-campaign-id',
            id: 'fake-test-id',
            start: '2017-01-01',
            expiry: '2027-01-01',
            author: 'fake-author',
            description: 'fake-description',
            audience: 1,
            audienceOffset: 0,
            successMeasure: 'fake success measure',
            audienceCriteria: 'fake audience criteria',
            variants: [
                {
                    id: 'fake-variant-id',
                    engagementBannerParams: {},
                },
            ],
            canRun: () => true,
            componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
        },
    ],
}));
jest.mock('common/modules/experiments/ab', () => ({
    getEngagementBannerTestToRun: jest.fn(() => Promise.resolve(null)),
}));
jest.mock(
    'common/modules/commercial/membership-engagement-banner-parameters',
    () => ({
        defaultEngagementBannerParams: jest.fn(() => ({
            products: ['CONTRIBUTION'],
            linkUrl: 'fake-link-url',
        })),
        deriveBannerParams: jest.fn(() =>
            Promise.resolve({
                buttonCaption: 'test-button-caption',
                linkUrl: 'test-link-url',
                messageText: 'test-message-text',
                ctaText: 'test-cta-text',
            })
        ),
    })
);
jest.mock(
    'common/modules/commercial/membership-engagement-banner-block',
    () => ({
        isBlocked: jest.fn(() => false),
    })
);
jest.mock('common/modules/ui/message', () => ({
    Message: jest.fn(),
    hasUserAcknowledgedBanner: jest.fn(() => false),
}));
jest.mock('ophan/ng', () => ({
    record: jest.fn(),
}));
jest.mock('lib/config', () => ({
    get: jest.fn(() => true),
}));
jest.mock('common/modules/commercial/contributions-utilities', () => ({
    pageShouldHideReaderRevenue: jest.fn(() => false),
    getReaderRevenueRegion: jest.fn(() => 'united-kingdom'),
}));
jest.mock('common/modules/commercial/user-features', () => ({
    userIsSupporter: jest.fn(() => false),
}));
jest.mock('lib/fetch-json', () => jest.fn());
jest.mock('common/modules/user-prefs', () => ({
    get: jest.fn(() => ({ 'united-kingdom': '2018-07-24T17:05:46+0000' })),
}));

const FakeMessage: any = require('common/modules/ui/message').Message;

const fakeConstructQuery: any = require('lib/url').constructQuery;
const fakeIsBlocked: any = require('common/modules/commercial/membership-engagement-banner-block')
    .isBlocked;
const fakeGet: any = require('lib/storage').local.get;
const fakeShouldHideReaderRevenue: any = require('common/modules/commercial/contributions-utilities')
    .pageShouldHideReaderRevenue;

const fetchJsonMock: JestMockFn<*, *> = (fetchJson: any);
const fakeUserPrefs: JestMockFn<*, *> = (userPrefs.get: any);

beforeEach(() => {
    FakeMessage.mockReset();
    FakeMessage.prototype.show = jest.fn(() => true);
    fakeIsBlocked.mockClear();
    fakeGet.mockClear();
    fakeShouldHideReaderRevenue.mockClear();
    fakeConfig.get.mockClear();
    fetchJsonMock.mockImplementation(() =>
        Promise.resolve({ time: '2018-07-25T17:05:46+0000' })
    );
});

afterEach(() => {
    FakeMessage.prototype.show.mockRestore();
    fakeMediator.removeAllListeners();
    fakeOphan.record.mockReset();
    fetchJsonMock.mockReset();
});

describe('Membership engagement banner', () => {
    describe('canShow returns false', () => {
        it('should return false if membershipEngagementBanner switch off', () => {
            fakeConfig.get.mockImplementationOnce(() => false);
            return membershipEngagementBanner.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });

        it('should return false if the engagement banner is blocked', () => {
            fakeIsBlocked.mockReturnValueOnce(true);

            return membershipEngagementBanner.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });

        it('should return false user variant is blocked for test', () =>
            membershipEngagementBanner.canShow().then(canShow => {
                expect(canShow).toBe(false);
            }));

        it('should return false user visit count less than minArticles for banner', () => {
            fakeGet.mockReturnValueOnce(0); // gu.alreadyVisited

            return membershipEngagementBanner.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });

        it('should return false if pageShouldHideReaderRevenue true', () => {
            fakeShouldHideReaderRevenue.mockReturnValueOnce(true);

            return membershipEngagementBanner.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });

        it('should return false if new redeploy before last closed', () => {
            // mock fetching old timestamp
            fakeUserPrefs.mockReturnValueOnce('2018-07-26T17:05:46+0000');
            // mock fetching new timestamp
            fakeUserPrefs.mockReturnValueOnce({
                'united-kingdom': '2018-07-26T17:05:46+0000',
            });

            return membershipEngagementBanner.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });

        it('should return false if old redeploy before last closed', () => {
            // mock fetching old timestamp
            fakeUserPrefs.mockReturnValueOnce('2018-07-26T17:05:46+0000');
            // mock fetching new timestamp
            fakeUserPrefs.mockReturnValueOnce(null);

            return membershipEngagementBanner.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });
    });

    describe('canShow returns true', () => {
        let emitSpy;

        beforeEach(() => {
            defaultEngagementBannerParams.mockImplementationOnce(() => ({
                products: ['CONTRIBUTION'],
                campaignCode: 'fake-campaign-code',
                linkUrl: 'fake-link-url',
            }));
            emitSpy = jest.spyOn(fakeMediator, 'emit');
        });

        afterEach(() => {
            emitSpy.mockRestore();
        });

        it('should show the membership engagement banner', () => {
            membershipEngagementBanner
                .show()
                .then(() =>
                    expect(FakeMessage.prototype.show).toHaveBeenCalledTimes(1)
                );
        });

        it('should emit a display event', () => {
            membershipEngagementBanner
                .show()
                .then(() =>
                    expect(emitSpy).toHaveBeenCalledWith(
                        'membership-message:display'
                    )
                );
        });

        it('should record the component event in ophan with a/b test info', () =>
            membershipEngagementBanner.show().then(() =>
                expect(fakeOphan.record).toHaveBeenCalledWith({
                    componentEvent: {
                        component: {
                            componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
                            products: ['CONTRIBUTION'],
                            id: 'fake-campaign-id_fake-variant-id',
                            campaignCode: 'fake-campaign-id_fake-variant-id',
                        },
                        action: 'INSERT',
                        abTest: {
                            name: 'fake-test-id',
                            variant: 'fake-variant-id',
                        },
                    },
                })
            ));
    });

    describe('If user already member', () => {
        it('should not show any messages even to engaged readers', () => {
            (pageShouldHideReaderRevenue: any).mockImplementationOnce(
                () => true
            );

            return membershipEngagementBanner.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });
    });

    describe('creates message with', () => {
        beforeEach(() => {
            defaultEngagementBannerParams.mockImplementationOnce(() => ({
                linkUrl: 'fake-link-url',
            }));
            deriveBannerParams.mockImplementationOnce(() =>
                Promise.resolve({
                    id: 'fake-variant-id',
                    engagementBannerParams: {},
                })
            );
        });

        it('correct campaign code', () =>
            membershipEngagementBanner
                .show()
                .then(() =>
                    expect(
                        FakeMessage.mock.calls[0][1].siteMessageComponentName
                    ).toBe('fake-campaign-id_fake-variant-id')
                ));

        it('correct CSS modifier class', () =>
            membershipEngagementBanner
                .show()
                .then(() =>
                    expect(FakeMessage.mock.calls[0][1].cssModifierClass).toBe(
                        'engagement-banner'
                    )
                ));
    });

    describe('renders message with', () => {
        beforeEach(() => {
            defaultEngagementBannerParams.mockImplementationOnce(() => ({
                messageText: 'fake-message-text',
                linkUrl: 'fake-link-url',
                buttonCaption: 'fake-button-caption',
            }));
            deriveBannerParams.mockImplementationOnce(() =>
                Promise.resolve({})
            );
            fakeConfig.get.mockImplementationOnce(() => true);
            fakeConstructQuery.mockImplementationOnce(
                () => 'fake-query-parameters'
            );
        });

        it('message text', () =>
            membershipEngagementBanner
                .show()
                .then(() =>
                    expect(FakeMessage.prototype.show.mock.calls[0][0]).toMatch(
                        /fake-message-text/
                    )
                ));

        it('colour class', () =>
            membershipEngagementBanner
                .show()
                .then(() =>
                    expect(FakeMessage.prototype.show.mock.calls[0][0]).toMatch(
                        /engagement-banner/
                    )
                ));

        it('link URL', () =>
            membershipEngagementBanner
                .show()
                .then(() =>
                    expect(FakeMessage.prototype.show.mock.calls[0][0]).toMatch(
                        /fake-link-url\?fake-query-parameters/
                    )
                ));

        it('button caption', () =>
            membershipEngagementBanner
                .show()
                .then(() =>
                    expect(FakeMessage.prototype.show.mock.calls[0][0]).toMatch(
                        /fake-button-caption/
                    )
                ));
    });
});
