// @flow

import { bannerTemplate as subscriptionBannerTemplate } from './subscription-banner-template';
import { selectorName, createBannerShow } from './subscription-banner';

jest.mock('ophan/ng', () => null);
jest.mock('common/modules/commercial/user-features.js', () => jest.fn());
jest.mock('common/modules/commercial/contributions-utilities.js', () => ({
    getReaderRevenueRegion: jest.fn().mockReturnValue('united-kingdom'),
}));
jest.mock('common/modules/identity/api.js', () => ({
    isUserLoggedIn: jest.fn().mockReturnValue(true),
}));
jest.mock('lib/report-error', () => jest.fn());

describe('Subscription Banner', () => {
    const bannerSelector = selectorName('subscription-banner');
    const mockTracking = {
        signInUrl: 'signInUrl',
        gaTracking: jest.fn(),
        subscriptionUrl: 'subscriptionUrl',
        trackBannerView: jest.fn(),
        trackBannerClick: jest.fn(),
        trackCloseButtons: jest.fn(),
    };

    afterEach(() => {
        if (document.body) {
            document.body.innerHTML = '';
        }
    });

    it('Should append a Subscription Banner to the document', () => {
        const show = createBannerShow(
            mockTracking,
            subscriptionBannerTemplate,
            false
        );
        show();

        const banner = subscriptionBannerTemplate(
            mockTracking.subscriptionUrl,
            mockTracking.signInUrl,
            false
        );

        const appendedBanner = document.body
            ? document.body.innerHTML
            : 'Banner Not Appended';

        const div = document.createElement('div');
        div.insertAdjacentHTML('beforeend', banner);
        const htmlBanner = div.innerHTML;

        expect(htmlBanner).toEqual(appendedBanner);
    });

    describe('Button Clicks', () => {
        beforeEach(() => {
            const show = createBannerShow(
                mockTracking,
                subscriptionBannerTemplate,
                false
            );

            show();
        });

        it('Should remove banner when close button is clicked', () => {
            const closeButton: ?HTMLElement = document.querySelector(
                bannerSelector('close-button')
            );

            if (closeButton) {
                closeButton.click();
            }

            const appendedBanner = document.body
                ? document.body.innerHTML
                : 'Banner Not Appended';

            expect(appendedBanner.trim()).toEqual('');
        });

        it('should remove the banner when the "not now" button is clicked', () => {
            const notNowButton: ?HTMLElement = document.querySelector(
                bannerSelector('cta-dismiss')
            );

            if (notNowButton) {
                notNowButton.click();
            }

            const appendedBanner = document.body
                ? document.body.innerHTML
                : 'Banner Not Appended';

            expect(appendedBanner.trim()).toEqual('');
        });

        it('Should have "subscriptionUrl" as the cta href', () => {
            const ctaButton = document.querySelector(bannerSelector('cta'));

            const ctaButtonHref =
                ctaButton instanceof HTMLAnchorElement && ctaButton.href;

            expect(ctaButtonHref).toEqual(
                `http://testurl.theguardian.com/${mockTracking.subscriptionUrl}`
            );
        });

        it('Should have "signInUrl" as the signInLink href', () => {
            const signInLink = document.querySelector(
                bannerSelector('sign-in')
            );

            const signInLinkHref =
                signInLink instanceof HTMLAnchorElement && signInLink.href;

            expect(signInLinkHref).toEqual(
                `http://testurl.theguardian.com/${mockTracking.signInUrl}`
            );
        });
    });

    describe('Banner Tracking', () => {
        it('Should call trackCloseButtons when close button is clicked', () => {
            const mockTrackingSUT = {
                ...mockTracking,
                trackCloseButtons: jest.fn(),
            };

            const show = createBannerShow(
                mockTrackingSUT,
                subscriptionBannerTemplate,
                false
            );
            show();

            const closeButton: ?HTMLElement = document.querySelector(
                bannerSelector('close-button')
            );

            if (closeButton) {
                closeButton.click();
            }

            expect(mockTrackingSUT.trackCloseButtons).toHaveBeenCalled();
            expect(mockTrackingSUT.trackCloseButtons.mock.calls.length).toBe(1);
        });

        it('should call trackCloseButtons when "not now" button is clicked', () => {
            const mockTrackingSUT = {
                ...mockTracking,
                trackCloseButtons: jest.fn(),
            };

            const show = createBannerShow(
                mockTrackingSUT,
                subscriptionBannerTemplate,
                false
            );
            show();

            const notNowButton: ?HTMLElement = document.querySelector(
                bannerSelector('cta-dismiss')
            );

            if (notNowButton) {
                notNowButton.click();
            }

            expect(mockTrackingSUT.trackCloseButtons).toHaveBeenCalled();
            expect(mockTrackingSUT.trackCloseButtons.mock.calls.length).toBe(1);
        });

        it('should call trackBannerView for ophan tracking', () => {
            const mockTrackingSUT = {
                ...mockTracking,
                trackBannerView: jest.fn(),
            };

            const show = createBannerShow(
                mockTrackingSUT,
                subscriptionBannerTemplate,
                false
            );
            show();

            expect(mockTrackingSUT.trackBannerView).toHaveBeenCalled();
            expect(mockTrackingSUT.trackBannerView.mock.calls.length).toBe(1);
        });

        it('should call gaTracking for google analytics tracking', () => {
            const mockTrackingSUT = { ...mockTracking, gaTracking: jest.fn() };

            const show = createBannerShow(
                mockTrackingSUT,
                subscriptionBannerTemplate,
                false
            );
            show();

            expect(mockTrackingSUT.gaTracking).toHaveBeenCalled();
            expect(mockTrackingSUT.gaTracking.mock.calls.length).toBe(1);
        });

        it('should call trackBannerClick when cta ', () => {
            const mockTrackingSUT = {
                ...mockTracking,
                trackBannerClick: jest.fn(),
            };

            const show = createBannerShow(
                mockTrackingSUT,
                subscriptionBannerTemplate,
                false
            );
            show();

            const ctaButton = document.querySelector(bannerSelector('cta'));

            if (ctaButton) {
                ctaButton.click();
            }

            expect(mockTrackingSUT.trackBannerClick).toHaveBeenCalled();
            expect(mockTrackingSUT.trackBannerClick.mock.calls.length).toBe(1);
        });

        it('should call trackBannerClick when sign-in', () => {
            const mockTrackingSUT = {
                ...mockTracking,
                trackBannerClick: jest.fn(),
            };

            const show = createBannerShow(
                mockTrackingSUT,
                subscriptionBannerTemplate,
                false
            );
            show();

            const signInLink = document.querySelector(
                bannerSelector('sign-in')
            );

            if (signInLink) {
                signInLink.click();
            }

            expect(mockTrackingSUT.trackBannerClick).toHaveBeenCalled();
            expect(mockTrackingSUT.trackBannerClick.mock.calls.length).toBe(1);
        });

        it('should hide sign-in link if user is signed in', () => {
            const mockTrackingSUT = {
                ...mockTracking,
                trackBannerClick: jest.fn(),
            };
            const isUserSignedIn = true;

            const show = createBannerShow(
                mockTrackingSUT,
                subscriptionBannerTemplate,
                isUserSignedIn
            );
            show();

            const signInContainer = document.querySelector(
                '.site-message--subscription-banner__sign-in'
            );

            const hasSignedInClass: ?boolean =
                signInContainer &&
                signInContainer.classList.contains(
                    'site-message--subscription-banner__sign-in--already-signed-in'
                );

            expect(hasSignedInClass).toBe(true);
        });
    });
});
