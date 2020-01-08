// @flow

import config from 'lib/config';
import prebid from 'commercial/modules/prebid/prebid';
import 'prebid.js/build/dist/prebid';
import { getAdvertById as getAdvertById_ } from 'commercial/modules/dfp/get-advert-by-id';

const getAdvertById: any = getAdvertById_;

jest.mock('lib/raven');

jest.mock('commercial/modules/dfp/Advert', () =>
    jest.fn().mockImplementation(() => ({ advert: jest.fn() }))
);

jest.mock('commercial/modules/prebid/bid-config', () => ({
    bids: jest.fn(),
}));

jest.mock('commercial/modules/dfp/get-advert-by-id', () => ({
    getAdvertById: jest.fn(),
}));

jest.mock('common/modules/experiments/ab', () => ({
    isInVariantSynchronous: jest.fn(
        (testId, variantId) => variantId === 'variant'
    ),
}));

describe('initialise', () => {
    beforeEach(() => {
        config.set('switches.enableConsentManagementService', true);
        config.set('switches.prebidUserSync', true);
        config.set('switches.prebidAppNexus', true);
        config.set('switches.prebidS2sozone', true);
        config.set('switches.prebidSonobi', true);
        config.set('switches.prebidXaxis', true);
        window.pbjs.setConfig({ consentManagement: {} });
        window.pbjs.setConfig({ s2sConfig: {} });
        getAdvertById.mockReset();
    });

    test('should generate correct Prebid config when all switches on', () => {
        prebid.initialise(window);
        expect(window.pbjs.getConfig()).toEqual({
            _bidderSequence: 'random',
            _bidderTimeout: 1500,
            _customPriceBucket: {
                buckets: [
                    {
                        increment: 0.01,
                        max: 100,
                        min: 0,
                    },
                    {
                        increment: 1,
                        max: 500,
                        min: 100,
                    },
                ],
            },
            _debug: false,
            _disableAjaxTimeout: false,
            _mediaTypePriceGranularity: {},
            _priceGranularity: 'custom',
            _publisherDomain: 'http://localhost',
            _sendAllBids: true,
            _timeoutBuffer: 400,
            _useBidCache: false,
            bidderSequence: 'random',
            bidderTimeout: 1500,
            consentManagement: {
                allowAuctionWithoutConsent: true,
                cmpApi: 'iab',
                timeout: 200,
            },
            customPriceBucket: {
                buckets: [
                    {
                        increment: 0.01,
                        max: 100,
                        min: 0,
                    },
                    {
                        increment: 1,
                        max: 500,
                        min: 100,
                    },
                ],
            },
            debug: false,
            disableAjaxTimeout: false,
            enableSendAllBids: true,
            mediaTypePriceGranularity: {},
            priceGranularity: 'custom',
            publisherDomain: 'http://localhost',
            s2sConfig: {
                accountId: '1',
                adapter: 'prebidServer',
                adapterOptions: {},
                bidders: ['appnexus', 'openx', 'pangaea'],
                cookieSet: true,
                cookiesetUrl: 'https://acdn.adnxs.com/cookieset/cs.js',
                enabled: true,
                endpoint: 'https://elb.the-ozone-project.com/openrtb2/auction',
                is_debug: 'false',
                maxBids: 1,
                syncEndpoint: 'https://elb.the-ozone-project.com/cookie_sync',
                syncUrlModifier: {},
                timeout: 1500,
            },
            timeoutBuffer: 400,
            useBidCache: false,
            userSync: {
                pixelEnabled: true,
                syncDelay: 3000,
                syncEnabled: true,
                syncsPerBidder: 999,
                auctionDelay: 0,
                filterSettings: {
                    all: {
                        bidders: '*',
                        filter: 'include',
                    },
                },
            },
        });
    });

    test('should generate correct Prebid config when consent management off', () => {
        config.set('switches.enableConsentManagementService', false);
        prebid.initialise(window);
        expect(window.pbjs.getConfig().consentManagement).toEqual({});
    });
    test('should generate correct Prebid config when Ozone off', () => {
        config.set('switches.prebidS2sozone', false);
        prebid.initialise(window);
        expect(window.pbjs.getConfig().s2sConfig).toEqual({
            adapter: 'prebidServer',
            adapterOptions: {},
            enabled: false,
            maxBids: 1,
            syncUrlModifier: {},
            timeout: 1000,
        });
    });

    test('should generate correct bidder settings', () => {
        prebid.initialise(window);
        expect(window.pbjs.bidderSettings.xhb).toHaveProperty(
            'adserverTargeting'
        );
    });

    test('should generate correct bidder settings when Xaxis off', () => {
        config.set('switches.prebidXaxis', false);
        prebid.initialise(window);
        expect(window.pbjs.bidderSettings).toEqual({});
    });

    test('should generate correct Prebid config when user-sync off', () => {
        config.set('switches.prebidUserSync', false);
        prebid.initialise(window);
        expect(window.pbjs.getConfig().userSync.syncEnabled).toEqual(false);
    });

    test('should respond to prebid.js bidWon event', () => {
        let bidWonEventName;
        let bidWonEventHandler: ?() => void;
        const dummyAdvert = {
            size: [200, 200],
            hasPrebidSize: false,
        };

        window.pbjs.onEvent = jest.fn((eventName, eventHandler) => {
            bidWonEventName = eventName;
            bidWonEventHandler = eventHandler;
        });

        getAdvertById.mockImplementation(() => dummyAdvert);

        prebid.initialise(window);

        expect(bidWonEventName).toBe('bidWon');
        expect(window.pbjs.onEvent).toHaveBeenCalledTimes(1);

        if (bidWonEventHandler) {
            bidWonEventHandler({
                height: 100,
                width: 100,
                adUnitCode: 'foo',
            });
        }

        expect(getAdvertById).toHaveBeenCalledTimes(1);
        expect(getAdvertById).toHaveBeenCalledWith('foo');
        expect(dummyAdvert.size).toMatchObject([100, 100]);
        expect(dummyAdvert.hasPrebidSize).toBe(true);
    });

    test('should not respond to prebid.js bidWon event if height missing from prebid data', () => {
        let bidWonEventName;
        let bidWonEventHandler: ?() => void;

        window.pbjs.onEvent = jest.fn((eventName, eventHandler) => {
            bidWonEventName = eventName;
            bidWonEventHandler = eventHandler;
        });

        prebid.initialise(window);

        expect(bidWonEventName).toBe('bidWon');
        expect(window.pbjs.onEvent).toHaveBeenCalledTimes(1);

        if (bidWonEventHandler) {
            bidWonEventHandler({
                width: 100,
                adUnitCode: 'foo',
            });
        }

        expect(getAdvertById).not.toHaveBeenCalled();
    });

    test('should not respond to prebid.js bidWon event if width missing from prebid data', () => {
        let bidWonEventName;
        let bidWonEventHandler: ?() => void;

        window.pbjs.onEvent = jest.fn((eventName, eventHandler) => {
            bidWonEventName = eventName;
            bidWonEventHandler = eventHandler;
        });

        prebid.initialise(window);

        expect(bidWonEventName).toBe('bidWon');
        expect(window.pbjs.onEvent).toHaveBeenCalledTimes(1);

        if (bidWonEventHandler) {
            bidWonEventHandler({
                height: 100,
                adUnitCode: 'foo',
            });
        }

        expect(getAdvertById).not.toHaveBeenCalled();
    });

    test('should not respond to prebid.js bidWon event if adUnitCode missing from prebid data', () => {
        let bidWonEventName;
        let bidWonEventHandler: ?() => void;

        window.pbjs.onEvent = jest.fn((eventName, eventHandler) => {
            bidWonEventName = eventName;
            bidWonEventHandler = eventHandler;
        });

        prebid.initialise(window);

        expect(bidWonEventName).toBe('bidWon');
        expect(window.pbjs.onEvent).toHaveBeenCalledTimes(1);

        if (bidWonEventHandler) {
            bidWonEventHandler({
                height: 100,
                width: 100,
            });
        }

        expect(getAdvertById).not.toHaveBeenCalled();
    });
});
