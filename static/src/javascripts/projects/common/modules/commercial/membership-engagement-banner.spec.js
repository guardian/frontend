// @flow
import fakeMediator from 'lib/mediator';
import fakeConfig from 'lib/config';
import fakeOphan from 'ophan/ng';
import { commercialFeatures } from 'commercial/modules/commercial-features';
import { membershipEngagementBannerInit } from 'common/modules/commercial/membership-engagement-banner';
import fakeMembershipEngagementParameters from 'common/modules/commercial/membership-engagement-banner-parameters';
import fakeMembershipEngagementTests from 'common/modules/experiments/tests/membership-engagement-banner-tests';

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
    get: jest.fn(() => Promise.resolve('GB')),
}));
jest.mock('common/views/svgs', () => ({
    inlineSvg: jest.fn(() => ''),
}));
jest.mock(
    'common/modules/experiments/tests/membership-engagement-banner-tests',
    () => []
);
jest.mock('common/modules/experiments/acquisition-test-selector', () => []);
jest.mock(
    'common/modules/commercial/membership-engagement-banner-parameters',
    () => ({
        defaultParams: jest.fn(() => ({
            minArticles: 1,
            colourStrategy: jest.fn(() => ''),
        })),
        offerings: {},
    })
);
jest.mock('common/modules/experiments/test-can-run-checks', () => ({
    testCanBeRun: jest.fn(() => true),
}));
jest.mock('common/modules/experiments/segment-util', () => ({
    isInTest: jest.fn(() => true),
    variantFor: jest.fn(() => ({})),
}));
jest.mock('commercial/modules/commercial-features', () => ({
    commercialFeatures: {
        asynchronous: {
            canDisplayMembershipEngagementBanner: Promise.resolve(true),
        },
    },
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
        const fakeInteraction = {
            component: 'fake-interaction-component',
            value: 'fake-interaction-value',
        };
        let showBanner;
        let emitSpy;

        beforeEach(() => {
            fakeMembershipEngagementParameters.defaultParams.mockImplementationOnce(
                () => ({
                    minArticles: 1,
                    colourStrategy: jest.fn(() => 'fake-colour-class'),
                    interactionOnMessageShow: fakeInteraction,
                })
            );
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
        it('should record the interaction in ophan', () =>
            showBanner.then(() => {
                expect(fakeOphan.record).toHaveBeenCalledWith(fakeInteraction);
            }));
    });

    describe('If user already member', () => {
        beforeEach(() => {
            commercialFeatures.asynchronous.canDisplayMembershipEngagementBanner = Promise.resolve(
                false
            );
        });

        afterEach(() => {
            commercialFeatures.asynchronous.canDisplayMembershipEngagementBanner = Promise.resolve(
                true
            );
        });

        it('should not show any messages even to engaged readers', () =>
            membershipEngagementBannerInit().then(() => {
                fakeMediator.emit('modules:onwards:breaking-news:ready', false);
                expect(FakeMessage.prototype.show).not.toHaveBeenCalled();
            }));
    });

    describe('creates message with', () => {
        let showBanner;

        beforeEach(() => {
            fakeMembershipEngagementParameters.defaultParams.mockImplementationOnce(
                () => ({
                    minArticles: 1,
                    colourStrategy: jest.fn(() => 'fake-colour-class'),
                    offering: 'fake-membership-offering',
                })
            );
            fakeMembershipEngagementTests.push({
                campaignId: 'fake-campaign-id',
            });
            fakeMembershipEngagementParameters.offerings = {
                membership: 'fake-membership-offering',
                contributions: 'fake-contributions-offering',
            };
            fakeVariantFor.mockImplementationOnce(() => ({
                id: 'fake-user-variant-id',
                engagementBannerParams: {},
            }));
            showBanner = membershipEngagementBannerInit().then(() => {
                fakeMediator.emit('modules:onwards:breaking-news:ready', false);
            });
        });

        afterEach(() => {
            fakeMembershipEngagementParameters.offerings = {};
            fakeMembershipEngagementTests.pop();
        });

        it('correct campaign code', () =>
            showBanner.then(() => {
                expect(
                    FakeMessage.mock.calls[0][1].siteMessageComponentName
                ).toBe('mem_fake-campaign-id_fake-user-variant-id');
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
            fakeMembershipEngagementParameters.defaultParams.mockImplementationOnce(
                () => ({
                    minArticles: 1,
                    colourStrategy: jest.fn(() => 'fake-colour-class'),
                    messageText: 'fake-message-text',
                    linkUrl: 'fake-link-url',
                    buttonCaption: 'fake-button-caption',
                })
            );
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
