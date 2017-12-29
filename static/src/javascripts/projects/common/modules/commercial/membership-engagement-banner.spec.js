// @flow
import fakeMediator from 'lib/mediator';
import fakeConfig from 'lib/config';
import fakeOphan from 'ophan/ng';
import { engagementBannerParams as engagementBannerParams_ } from 'common/modules/commercial/membership-engagement-banner-parameters';
import { membershipEngagementBannerInit } from 'common/modules/commercial/membership-engagement-banner';
import { shouldShowReaderRevenue } from 'common/modules/commercial/contributions-utilities';

const engagementBannerParams: any = engagementBannerParams_;

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
}));
jest.mock('common/views/svgs', () => ({
    inlineSvg: jest.fn(() => ''),
}));

jest.mock('common/modules/experiments/acquisition-test-selector', () => ({
    getTest: jest.fn(() => ({
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
        canRun: () => true,
        componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    })),
}));

jest.mock(
    'common/modules/experiments/tests/membership-engagement-banner-tests',
    () => ({
        membershipEngagementBannerTests: [
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
                        options: {
                            engagementBannerParams: {},
                        },
                    },
                ],
                canRun: () => true,
                componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
            },
        ],
    })
);

jest.mock(
    'common/modules/commercial/membership-engagement-banner-parameters',
    () => ({
        engagementBannerParams: jest.fn(() => ({
            minArticles: 1,
            products: ['CONTRIBUTION'],
            colourStrategy: jest.fn(() => ''),
            linkUrl: 'fake-link-url',
        })),
    })
);
jest.mock('common/modules/experiments/test-can-run-checks', () => ({
    testCanBeRun: jest.fn(() => true),
}));
jest.mock('common/modules/experiments/segment-util', () => ({
    isInTest: jest.fn(() => true),
    variantFor: jest.fn(() => ({ id: 'fake-variant-id' })),
}));
jest.mock(
    'common/modules/commercial/membership-engagement-banner-block',
    () => ({
        isBlocked: jest.fn(() => false),
    })
);
jest.mock('common/modules/ui/message', () => ({
    Message: jest.fn(),
}));
jest.mock('ophan/ng', () => ({
    record: jest.fn(),
}));
jest.mock('lib/config', () => ({
    get: jest.fn(() => ''),
}));
jest.mock('lib/detect', () => ({
    adblockInUse: Promise.resolve(false)
}));
jest.mock('common/modules/commercial/contributions-utilities', () => ({
    shouldShowReaderRevenue: jest.fn(() => true)
}));

const FakeMessage: any = require('common/modules/ui/message').Message;
const fakeVariantFor: any = require('common/modules/experiments/segment-util')
    .variantFor;
const fakeConstructQuery: any = require('lib/url').constructQuery;
const fakeInlineSvg: any = require('common/views/svgs').inlineSvg;

beforeEach(() => {
    FakeMessage.mockReset();
    FakeMessage.prototype.show = jest.fn(() => true);
});
afterEach(() => {
    FakeMessage.prototype.show.mockRestore();
    fakeMediator.removeAllListeners();
    fakeOphan.record.mockReset();
});

describe('Membership engagement banner', () => {
    describe('If breaking news banner has show', () => {
        it('should not show the membership engagement banner', () =>
            membershipEngagementBannerInit().then(() => {
                fakeMediator.emit('modules:onwards:breaking-news:ready', true);
                expect(FakeMessage.prototype.show).not.toHaveBeenCalled();
            }));
    });

    describe('If breaking news banner has not shown', () => {
        let showBanner;
        let emitSpy;

        beforeEach(() => {
            engagementBannerParams.mockImplementationOnce(() => ({
                minArticles: 1,
                products: ['CONTRIBUTION'],
                colourStrategy: jest.fn(() => 'fake-colour-class'),
                campaignCode: 'fake-campaign-code',
                linkUrl: 'fake-link-url',
            }));
            emitSpy = jest.spyOn(fakeMediator, 'emit');
            showBanner = membershipEngagementBannerInit().then(() => {
                fakeMediator.emit('modules:onwards:breaking-news:ready', false);
            });
        });
        afterEach(() => {
            emitSpy.mockRestore();
        });

        it('should show the membership engagement banner', () =>
            showBanner.then(() => {
                expect(FakeMessage.prototype.show).toHaveBeenCalledTimes(1);
            }));
        it('should emit a display event', () =>
            showBanner.then(() => {
                expect(emitSpy).toHaveBeenCalledWith(
                    'membership-message:display'
                );
            }));
        it('should record the component event in ophan with a/b test info', () =>
            showBanner.then(() => {
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
                });
            }));
    });

    describe('If user already member', () => {
        it('should not show any messages even to engaged readers', () => {
            (shouldShowReaderRevenue: any).mockImplementationOnce(() => false);
            membershipEngagementBannerInit().then(() => {
                fakeMediator.emit('modules:onwards:breaking-news:ready', false);
                expect(FakeMessage.prototype.show).not.toHaveBeenCalled();
            });
        })
    });

    describe('creates message with', () => {
        let showBanner;

        beforeEach(() => {
            engagementBannerParams.mockImplementationOnce(() => ({
                minArticles: 1,
                colourStrategy: jest.fn(() => 'fake-colour-class'),
                linkUrl: 'fake-link-url',
            }));
            fakeVariantFor.mockImplementationOnce(() => ({
                id: 'fake-variant-id',
                options: {
                    // This being empty is what lets the campaign
                    // code default to the test campaignId plus variant id
                    engagementBannerParams: {},
                },
            }));
            showBanner = membershipEngagementBannerInit().then(() => {
                fakeMediator.emit('modules:onwards:breaking-news:ready', false);
            });
        });

        it('correct campaign code', () =>
            showBanner.then(() => {
                expect(
                    FakeMessage.mock.calls[0][1].siteMessageComponentName
                ).toBe('fake-campaign-id_fake-variant-id');
            }));
        it('correct CSS modifier class', () =>
            showBanner.then(() => {
                expect(FakeMessage.mock.calls[0][1].cssModifierClass).toBe(
                    'fake-colour-class'
                );
            }));
    });

    describe('renders message with', () => {
        let showBanner;

        beforeEach(() => {
            engagementBannerParams.mockImplementationOnce(() => ({
                minArticles: 1,
                colourStrategy: jest.fn(() => 'fake-colour-class'),
                messageText: 'fake-message-text',
                linkUrl: 'fake-link-url',
                buttonCaption: 'fake-button-caption',
            }));
            fakeConfig.get.mockImplementationOnce(
                () => 'fake-paypal-and-credit-card-image'
            );
            fakeInlineSvg.mockImplementationOnce(() => 'fake-button-svg');
            fakeConstructQuery.mockImplementationOnce(
                () => 'fake-query-parameters'
            );
            showBanner = membershipEngagementBannerInit().then(() => {
                fakeMediator.emit('modules:onwards:breaking-news:ready', false);
            });
        });

        it('message text', () =>
            showBanner.then(() => {
                expect(FakeMessage.prototype.show.mock.calls[0][0]).toMatch(
                    /fake-message-text/
                );
            }));
        it('paypal and credit card image', () =>
            showBanner.then(() => {
                expect(FakeMessage.prototype.show.mock.calls[0][0]).toMatch(
                    /fake-paypal-and-credit-card-image/
                );
            }));
        it('colour class', () =>
            showBanner.then(() => {
                expect(FakeMessage.prototype.show.mock.calls[0][0]).toMatch(
                    /fake-colour-class/
                );
            }));
        it('link URL', () =>
            showBanner.then(() => {
                expect(FakeMessage.prototype.show.mock.calls[0][0]).toMatch(
                    /fake-link-url\?fake-query-parameters/
                );
            }));
        it('button caption', () =>
            showBanner.then(() => {
                expect(FakeMessage.prototype.show.mock.calls[0][0]).toMatch(
                    /fake-button-caption/
                );
            }));
        it('button SVG', () =>
            showBanner.then(() => {
                expect(FakeMessage.prototype.show.mock.calls[0][0]).toMatch(
                    /fake-button-svg/
                );
            }));
    });
});
