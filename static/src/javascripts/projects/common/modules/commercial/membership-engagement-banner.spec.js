// @flow
import FakeMessage from 'common/modules/ui/message';
import fakeMediator from 'lib/mediator';
import { commercialFeatures } from 'commercial/modules/commercial-features';
import { membershipEngagementBannerInit } from 'common/modules/commercial/membership-engagement-banner';

jest.mock('lib/storage', () => ({
    local: {
        get: jest.fn(() => 10), // gu.alreadyVisited
        set: jest.fn(),
        isAvailable: jest.fn(),
    },
}));
jest.mock('lib/url', () => ({
    constructQuery: jest.fn(),
}));
jest.mock('lib/geolocation', () => ({
    get: jest.fn(() => Promise.resolve('GB')),
}));
jest.mock('lib/mediator', () => {
    let events = {};

    return {
        on(eventName, callback) {
            events[eventName] = callback;
        },
        emit(eventName, params) {
            if (events[eventName]) {
                events[eventName](params);
            }
        },
        removeAllListeners() {
            events = {};
        },
    };
});
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
            colourStrategy: jest.fn(() => 'foo'),
        })),
        offerings: {},
    })
);
jest.mock('common/modules/experiments/test-can-run-checks', () => ({
    testCanBeRun: jest.fn(() => true),
}));
jest.mock('common/modules/experiments/segment-util', () => ({
    isInTest: jest.fn(() => true),
    variantFor: jest.fn(() => {}),
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
jest.mock('common/modules/ui/message', () => class Message {});
jest.mock('ophan/ng', () => ({
    record: jest.fn(),
}));
jest.mock('lib/config', () => ({}));

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
});
