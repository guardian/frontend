import prebid from 'commercial/modules/header-bidding/prebid/prebid';
import config from 'lib/config';
import 'prebid.js/build/dist/prebid';
import { getAdvertById as getAdvertById_ } from 'commercial/modules/dfp/get-advert-by-id';

const getAdvertById: any = getAdvertById_;

jest.mock('lib/raven');

jest.mock('commercial/modules/dfp/Advert', () =>
    jest.fn().mockImplementation(() => ({ advert: jest.fn() }))
);

jest.mock('commercial/modules/header-bidding/prebid/bid-config', () => ({
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
        config.set('switches.consentManagement', true);
        config.set('switches.prebidUserSync', true);
        config.set('switches.prebidAppNexus', true);
        config.set('switches.prebidSonobi', true);
        config.set('switches.prebidXaxis', true);
        window.pbjs.setConfig({ consentManagement: {} });
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
                    },
                    {
                        increment: 1,
                        max: 500,
                    },
                ],
            },
            _debug: false,
            _deviceAccess: true,
            _disableAjaxTimeout: false,
            _mediaTypePriceGranularity: {},
            _priceGranularity: 'custom',
            _publisherDomain: 'http://testurl.theguardian.com',
            _sendAllBids: true,
            _timeoutBuffer: 400,
            _useBidCache: false,
            bidderSequence: 'random',
            bidderTimeout: 1500,
            consentManagement: {
                gdpr: {
                    allowAuctionWithoutConsent: true,
                    cmpApi: 'iab',
                    timeout: 200,
                },
                usp: {
                    timeout: 1500,
                },
            },
            customPriceBucket: {
                buckets: [
                    {
                        increment: 0.01,
                        max: 100,
                    },
                    {
                        increment: 1,
                        max: 500,
                    },
                ],
            },
            debug: false,
            deviceAccess: true,
            disableAjaxTimeout: false,
            enableSendAllBids: true,
            mediaTypePriceGranularity: {},
            priceGranularity: 'custom',
            publisherDomain: 'http://testurl.theguardian.com',
            s2sConfig: {
                adapter: 'prebidServer',
                adapterOptions: {},
                enabled: false,
                maxBids: 1,
                syncUrlModifier: {},
                timeout: 1000,
            },
            timeoutBuffer: 400,
            useBidCache: false,
            userSync: {
                syncDelay: 3000,
                syncEnabled: true,
                syncsPerBidder: 0,
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
        config.set('switches.consentManagement', false);
        prebid.initialise(window);
        expect(window.pbjs.getConfig().consentManagement).toEqual({});
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
        let bidWonEventHandler: () => void | null | undefined;
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
        let bidWonEventHandler: () => void | null | undefined;

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
        let bidWonEventHandler: () => void | null | undefined;

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
        let bidWonEventHandler: () => void | null | undefined;

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
