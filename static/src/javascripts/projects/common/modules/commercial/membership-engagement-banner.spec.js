// @flow
import FakeMessage from 'common/modules/ui/message';
import fakeMediator from 'lib/mediator';
import { commercialFeatures } from 'commercial/modules/commercial-features';
import { membershipEngagementBannerInit } from 'common/modules/commercial/membership-engagement-banner';

jest.mock('lib/mediator');
jest.mock('lib/storage', () => ({
    local: {
        get: jest.fn(() => 10), // gu.alreadyVisited
        set: jest.fn(),
        isAvailable: jest.fn(),
    },
}));
jest.mock('lib/url', () => ({
    constructQuery: jest.fn(() => 'fake-query-parameters'),
}));
jest.mock('lib/geolocation', () => ({
    get: jest.fn(() => Promise.resolve('GB')),
}));
jest.mock('common/views/svgs', () => ({
    inlineSvg: jest.fn(() => 'fake-button-svg'),
}));
jest.mock(
    'common/modules/experiments/tests/membership-engagement-banner-tests',
    () => [
        {
            campaignId: 'fake-campaign-id',
        },
    ]
);
jest.mock('common/modules/experiments/acquisition-test-selector', () => []);
jest.mock(
    'common/modules/commercial/membership-engagement-banner-parameters',
    () => ({
        defaultParams: jest.fn(() => ({
            minArticles: 1,
            colourStrategy: jest.fn(() => 'fake-colour-class'),
            messageText: 'fake-message-text',
            linkUrl: 'fake-link-url',
            buttonCaption: 'fake-button-caption',
            offering: 'fake-membership-offering',
        })),
        offerings: {
            membership: 'fake-membership-offering',
            contributions: 'fake-contributions-offering',
        },
    })
);
jest.mock('common/modules/experiments/test-can-run-checks', () => ({
    testCanBeRun: jest.fn(() => true),
}));
jest.mock('common/modules/experiments/segment-util', () => ({
    isInTest: jest.fn(() => true),
    variantFor: jest.fn(() => ({
        id: 'fake-user-variant-id',
        engagementBannerParams: {},
    })),
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
jest.mock('common/modules/ui/message', () => jest.fn());
jest.mock('ophan/ng', () => ({
    record: jest.fn(),
}));
jest.mock('lib/config', () => ({
    get: jest.fn(() => 'fake-paypal-and-credit-card-image'),
}));

beforeEach(() => {
    if (document.body) {
        document.body.innerHTML = `
            <div id="header" class="l-header"></div>
            <div class="js-site-message is-hidden">
                <div class="js-site-message-copy">...</div>
                <button class="site-message__close"></button>
            </div>
            <div class="site-message--footer is-hidden js-footer-message">
                <div class="site-message__copy js-footer-site-message-copy u-cf"></div>
            </div>
        `;
    }

    FakeMessage.mockReset();
    FakeMessage.prototype.show = jest.fn();
});
afterEach(() => {
    FakeMessage.prototype.show.mockRestore();
    fakeMediator.removeAllListeners();
});

describe('Membership engagement banner', () => {
    describe('If breaking news banner', () => {
        it('has shown, should not show the membership engagement banner', () =>
            membershipEngagementBannerInit().then(() => {
                fakeMediator.emit('modules:onwards:breaking-news:ready', true);
                expect(FakeMessage.prototype.show).not.toHaveBeenCalled();
            }));

        it('has not shown, should show the membership engagement banner', () =>
            membershipEngagementBannerInit().then(() => {
                fakeMediator.emit('modules:onwards:breaking-news:ready', false);
                expect(FakeMessage.prototype.show).toHaveBeenCalledTimes(1);
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

    describe('renders message with', () => {
        let showBanner;

        beforeEach(() => {
            showBanner = membershipEngagementBannerInit().then(() => {
                fakeMediator.emit('modules:onwards:breaking-news:ready', false);
            });
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
