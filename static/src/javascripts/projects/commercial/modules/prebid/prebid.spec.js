// @flow

import config from 'lib/config';
import { prebid } from 'commercial/modules/prebid/prebid';

jest.mock('commercial/modules/dfp/Advert', () =>
    jest.fn().mockImplementation(() => ({ advert: jest.fn() }))
);

jest.mock('commercial/modules/prebid/bid-config', () => ({
    bids: jest.fn(),
}));

describe('initialise', () => {
    beforeEach(() => {
        config.set('switches.enableConsentManagementService', true);
        config.set('switches.prebidS2sozone', true);
        config.set('switches.prebidSonobi', true);
        config.set('switches.prebidXaxis', true);
        window.pbjs.setConfig({ consentManagement: {} });
        window.pbjs.setConfig({ s2sConfig: {} });
    });

    test('should generate correct Prebid config when all switches on', () => {
        prebid.initialise();
        expect(window.pbjs.getConfig()).toEqual({
            _bidderSequence: 'random',
            _bidderTimeout: 1500,
            _cookieSyncDelay: 100,
            _customPriceBucket: {
                buckets: [
                    {
                        increment: 0.05,
                        max: 5,
                        min: 0,
                    },
                    {
                        increment: 0.1,
                        max: 10,
                        min: 5,
                    },
                    {
                        increment: 0.5,
                        max: 20,
                        min: 10,
                    },
                    {
                        increment: 10,
                        max: 40,
                        min: 20,
                    },
                ],
            },
            _debug: false,
            _mediaTypePriceGranularity: {},
            _priceGranularity: 'custom',
            _publisherDomain: 'null',
            _sendAllBids: true,
            _timoutBuffer: 200,
            bidderSequence: 'random',
            bidderTimeout: 1500,
            consentManagement: {
                allowAuctionWithoutConsent: true,
                cmpApi: 'iab',
                timeout: 200,
            },
            cookieSyncDelay: 100,
            customPriceBucket: {
                buckets: [
                    {
                        increment: 0.05,
                        max: 5,
                        min: 0,
                    },
                    {
                        increment: 0.1,
                        max: 10,
                        min: 5,
                    },
                    {
                        increment: 0.5,
                        max: 20,
                        min: 10,
                    },
                    {
                        increment: 10,
                        max: 40,
                        min: 20,
                    },
                ],
            },
            debug: false,
            enableSendAllBids: true,
            mediaTypePriceGranularity: {},
            priceGranularity: 'custom',
            publisherDomain: 'null',
            s2sConfig: {
                accountId: '1',
                adapter: 'prebidServer',
                bidders: ['appnexus', 'openx'],
                cookieSet: true,
                cookiesetUrl: 'https://acdn.adnxs.com/cookieset/cs.js',
                enabled: true,
                endpoint: 'https://elb.the-ozone-project.com/openrtb2/auction',
                is_debug: 'false',
                maxBids: 1,
                syncEndpoint: 'https://elb.the-ozone-project.com/cookie_sync',
                timeout: 1500,
            },
            timeoutBuffer: 200,
            userSync: {
                pixelEnabled: true,
                syncDelay: 3000,
                syncEnabled: true,
                syncsPerBidder: 5,
            },
        });
    });

    test('should generate correct Prebid config when consent management off', () => {
        config.set('switches.enableConsentManagementService', false);
        prebid.initialise();
        expect(window.pbjs.getConfig().consentManagement).toEqual({});
    });

    test('should generate correct Prebid config when Ozone off', () => {
        config.set('switches.prebidS2sozone', false);
        prebid.initialise();
        expect(window.pbjs.getConfig().s2sConfig).toEqual({
            adapter: 'prebidServer',
            enabled: false,
            maxBids: 1,
            timeout: 1000,
        });
    });

    test('should generate correct bidder settings', () => {
        prebid.initialise();
        expect(window.pbjs.bidderSettings.xhb).toHaveProperty(
            'adserverTargeting'
        );
    });

    test('should generate correct bidder settings when Xaxis off', () => {
        config.set('switches.prebidXaxis', false);
        prebid.initialise();
        expect(window.pbjs.bidderSettings).toEqual({});
    });
});
