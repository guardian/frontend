// @flow

import { bannerTemplate as subscripionBannerTemplate } from './subscription-banner-template';
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

const removeAllSpaces = (str: string) => str.replace(/\s/g, '');

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
        let appendedBanner = 'Banner Not Appended';

        const show = createBannerShow(
            mockTracking,
            subscripionBannerTemplate,
            false
        );
        show();

        const banner = subscripionBannerTemplate(
            mockTracking.subscriptionUrl,
            mockTracking.signInUrl,
            false
        );

        if (document.body) {
            appendedBanner = document.body.innerHTML;
        }

        // removeAllSpaces is used because toEqual compares all tabs, spaces and new lines
        expect(removeAllSpaces(banner)).toEqual(
            removeAllSpaces(appendedBanner)
        );
    });

    describe('Button Clicks', () => {
        beforeEach(() => {
            const show = createBannerShow(
                mockTracking,
                subscripionBannerTemplate,
                false
            );

            show();
        });

        it('Should remove banner when close button is clicked', () => {
            let appendedBanner = 'Banner Not Appended';

            const closeButton: ?HTMLElement = document.querySelector(
                bannerSelector('close-button')
            );

            if (closeButton) {
                closeButton.click();
            }

            if (document.body) {
                appendedBanner = document.body.innerHTML;
            }

            expect(appendedBanner.trim()).toEqual('');
        });

        it('should remove the banner when the "not now" button is clicked', () => {
            let appendedBanner = 'Banner Not Appended';

            const notNowButton: ?HTMLElement = document.querySelector(
                bannerSelector('cta-dismiss')
            );

            if (notNowButton) {
                notNowButton.click();
            }

            if (document.body) {
                appendedBanner = document.body.innerHTML;
            }

            expect(appendedBanner.trim()).toEqual('');
        });

        it('Should have "subscriptionUrl" as the cta href', () => {
            let ctaButtonHref;

            const ctaButton = document.querySelector(bannerSelector('cta'));

            if (ctaButton instanceof HTMLAnchorElement) {
                ctaButtonHref = ctaButton.href;
            }

            expect(ctaButtonHref).toEqual(
                `http://test-url.com/${mockTracking.subscriptionUrl}`
            );
        });

        it('Should have "signInUrl" as the signInLink href', () => {
            let signInLinkHref;

            const signInLink = document.querySelector(
                bannerSelector('sign-in')
            );

            if (signInLink instanceof HTMLAnchorElement) {
                signInLinkHref = signInLink.href;
            }

            expect(signInLinkHref).toEqual(
                `http://test-url.com/${mockTracking.signInUrl}`
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
                subscripionBannerTemplate,
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
                subscripionBannerTemplate,
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
                subscripionBannerTemplate,
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
                subscripionBannerTemplate,
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
                subscripionBannerTemplate,
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
                subscripionBannerTemplate,
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
            let hasSignedInClass: ?boolean = null;

            const show = createBannerShow(
                mockTrackingSUT,
                subscripionBannerTemplate,
                isUserSignedIn
            );
            show();

            const signInContainer = document.querySelector(
                '.site-message--subscription-banner__sign-in'
            );

            if (signInContainer) {
                hasSignedInClass = signInContainer.classList.contains(
                    'site-message--subscription-banner__sign-in--already-signed-in'
                );
            }

            expect(hasSignedInClass).toBe(true);
        });
    });
});
