// @flow
import $ from 'lib/$';
import { noop } from 'lib/noop';
import { getBreakpoint as getBreakpoint_ } from 'lib/detect';
import config from 'lib/config';

import prepareGoogletag from 'commercial/modules/dfp/prepare-googletag';
import getAdverts from 'commercial/modules/dfp/get-adverts';
import getCreativeIDs from 'commercial/modules/dfp/get-creative-ids';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { commercialFeatures } from 'commercial/modules/commercial-features';
import loadAdvert from 'commercial/modules/dfp/load-advert';

const getBreakpoint: any = getBreakpoint_;

jest.mock('common/modules/identity/api', () => ({
    isUserLoggedIn: () => true,
    getUserFromCookie: jest.fn(),
}));
jest.mock('common/modules/analytics/beacon', () => {});
jest.mock('commercial/modules/dfp/refresh-on-resize', () => {});
jest.mock('lib/detect', () => ({
    hasCrossedBreakpoint: jest.fn(),
    getBreakpoint: jest.fn(),
    getViewport: jest.fn(),
    hasPushStateSupport: jest.fn(),
    getReferrer: jest.fn(() => ''),
    breakpoints: [
        {
            name: 'mobile',
            isTweakpoint: false,
            width: 0,
        },
        {
            name: 'tablet',
            isTweakpoint: false,
            width: 740,
        },
        {
            name: 'desktop',
            isTweakpoint: false,
            width: 980,
        },
        {
            name: 'wide',
            isTweakpoint: false,
            width: 1300,
        },
    ],
}));
jest.mock('common/modules/analytics/google', () => () => {});
jest.mock('commercial/modules/dfp/display-lazy-ads', () => ({
    displayLazyAds: jest.fn(),
}));

jest.mock('commercial/modules/commercial-features', () => ({
    commercialFeatures: {
        dfpAdvertising: true,
    },
}));
jest.mock('commercial/modules/dfp/apply-creative-template', () => ({
    applyCreativeTemplate: () => Promise.resolve(true),
}));
jest.mock('lib/load-script', () => ({
    loadScript: jest.fn(() => Promise.resolve()),
}));
jest.mock('lodash/functions/once', () => fn => fn);
jest.mock('commercial/modules/dfp/performance-logging', () => ({
    setListeners: jest.fn(),
    addTag: jest.fn(),
    updateAdvertMetric: jest.fn(),
}));
jest.mock('commercial/modules/dfp/refresh-on-resize', () => jest.fn());
jest.mock('common/modules/analytics/beacon', () => ({ fire: jest.fn() }));
jest.mock('commercial/modules/sticky-mpu', () => jest.fn());
jest.mock('common/modules/onward/geo-most-popular', () => ({
    geoMostPopular: { render: jest.fn() },
}));
jest.mock('commercial/modules/third-party-tags/outbrain', () => ({
    getOutbrainComplianceTargeting: () => Promise.resolve(),
}));
jest.mock('commercial/modules/dfp/load-advert', () => jest.fn());

let $style;
const makeFakeEvent = (creativeId, id) => ({
    creativeId,
    slot: {
        getSlotElementId() {
            return id;
        },
    },
    size: ['300', '250'],
});

const reset = () => {
    dfpEnv.advertIds = {};
    dfpEnv.adverts = [];
    dfpEnv.advertsToRefresh = [];
    dfpEnv.advertsToLoad = [];
};

describe('DFP', () => {
    const domSnippet = `
        <div id="dfp-ad-html-slot" class="js-ad-slot" data-name="html-slot" data-mobile="300,50"></div>
        <div id="dfp-ad-script-slot" class="js-ad-slot" data-name="script-slot" data-mobile="300,50|320,50" data-refresh="false"></div>
        <div id="dfp-ad-already-labelled" class="js-ad-slot ad-label--showing" data-name="already-labelled" data-mobile="300,50|320,50"  data-tablet="728,90"></div>
        <div id="dfp-ad-dont-label" class="js-ad-slot" data-label="false" data-name="dont-label" data-mobile="300,50|320,50"  data-tablet="728,90" data-desktop="728,90|900,250|970,250"></div>
    `;

    beforeEach(() => {
        config.switches = {
            commercial: true,
            sonobiHeaderBidding: false,
        };
        config.page = {
            adUnit: '/123456/theguardian.com/front',
            contentType: 'Article',
            edition: 'us',
            isFront: true,
            keywordIds: 'world/korea,world/ukraine',
            pageId: 'world/uk',
            section: 'news',
            seriesId: 'learning/series/happy-times',
            sharedAdTargeting: {
                ct: 'Article',
                edition: 'us',
                k: ['korea', 'ukraine'],
                se: ['happy-times'],
            },
        };
        config.images = {
            commercial: {},
        };
        config.ophan = {
            pageViewId: 'dummyOphanPageViewId',
        };

        if (document.body) {
            document.body.innerHTML = domSnippet;
        }

        $style = $.create('<style type="text/css"></style>')
            .html(`body:after{ content: "wide"}`)
            .appendTo('head');
        const pubAds = {
            listeners: [],
            addEventListener: jest.fn(function(eventName, callback) {
                this.listeners[eventName] = callback;
            }),
            setTargeting: jest.fn(),
            enableSingleRequest: jest.fn(),
            collapseEmptyDivs: jest.fn(),
            refresh: jest.fn(),
        };
        const sizeMapping = {
            sizes: [],
            addSize: jest.fn(function(width, sizes) {
                this.sizes.unshift([width, sizes]);
            }),
            build: jest.fn(function() {
                const tmp = this.sizes;
                this.sizes = [];
                return tmp;
            }),
        };
        window.googletag = {
            cmd: {
                push(...args) {
                    args.forEach(command => {
                        command();
                    });
                },
            },
            pubads() {
                return pubAds;
            },
            sizeMapping() {
                return sizeMapping;
            },
            defineSlot: jest.fn(() => window.googletag),
            defineOutOfPageSlot: jest.fn(() => window.googletag),
            addService: jest.fn(() => window.googletag),
            defineSizeMapping: jest.fn(() => window.googletag),
            setTargeting: jest.fn(() => window.googletag),
            enableServices: jest.fn(),
            display: jest.fn(),
        };
        // eslint-disable-next-line no-underscore-dangle
        window.__switch_zero = false;

        commercialFeatures.dfpAdvertising = true;
    });

    afterEach(() => {
        reset();
        if (document.body) {
            document.body.innerHTML = '';
        }
        $style.remove();
        window.googletag = null;
    });

    it('should exist', () => {
        expect(prepareGoogletag).toBeDefined();
        expect(getAdverts).toBeDefined();
        expect(getCreativeIDs).toBeDefined();
    });

    it('hides all ad slots when all DFP advertising is disabled', () => {
        commercialFeatures.dfpAdvertising = false;
        return new Promise(resolve => {
            prepareGoogletag.init(noop, resolve);
        }).then(() => {
            const remainingAdSlots = document.querySelectorAll('.js-ad-slot');
            expect(remainingAdSlots.length).toBe(0);
        });
    });

    it('should get the slots', () => {
        config.page.hasPageSkin = true;
        return new Promise(resolve => {
            prepareGoogletag.init(noop, resolve);
        }).then(() => {
            expect(Object.keys(getAdverts(true)).length).toBe(4);
        });
    });

    it('should not get hidden ad slots', () => {
        $('.js-ad-slot')
            .first()
            .css('display', 'none');
        return new Promise(resolve => {
            prepareGoogletag.init(noop, resolve);
        }).then(() => {
            const slots = getAdverts(true);
            expect(Object.keys(slots).length).toBe(3);
            Object.keys(slots).forEach(slotId => {
                expect(slotId).toBeTruthy();
                expect(slotId).not.toBe('dfp-ad-html-slot');
            });
        });
    });

    it('should set listeners', () =>
        new Promise(resolve => {
            prepareGoogletag.init(noop, resolve);
        }).then(() => {
            expect(
                window.googletag.pubads().addEventListener
            ).toHaveBeenCalledWith('slotRenderEnded', expect.anything());
        }));

    it('should define slots', () =>
        new Promise(resolve => {
            prepareGoogletag.init(noop, resolve);
        }).then(() => {
            [
                [
                    'dfp-ad-html-slot',
                    [[300, 50]],
                    [[[0, 0], [[300, 50]]]],
                    'html-slot',
                ],
                [
                    'dfp-ad-script-slot',
                    [[300, 50], [320, 50]],
                    [[[0, 0], [[300, 50], [320, 50]]]],
                    'script-slot',
                ],
                [
                    'dfp-ad-already-labelled',
                    [[728, 90], [300, 50], [320, 50]],
                    [[[740, 0], [[728, 90]]], [[0, 0], [[300, 50], [320, 50]]]],
                    'already-labelled',
                ],
                [
                    'dfp-ad-dont-label',
                    [[728, 90], [900, 250], [970, 250], [300, 50], [320, 50]],
                    [
                        [[980, 0], [[728, 90], [900, 250], [970, 250]]],
                        [[740, 0], [[728, 90]]],
                        [[0, 0], [[300, 50], [320, 50]]],
                    ],
                    'dont-label',
                ],
            ].forEach(data => {
                expect(window.googletag.defineSlot).toHaveBeenCalledWith(
                    '/123456/theguardian.com/front',
                    data[1],
                    data[0]
                );
                expect(window.googletag.addService).toHaveBeenCalledWith(
                    window.googletag.pubads()
                );
                data[2].forEach(size => {
                    expect(
                        window.googletag.sizeMapping().addSize
                    ).toHaveBeenCalledWith(size[0], size[1]);
                });
                expect(window.googletag.defineSizeMapping).toHaveBeenCalledWith(
                    data[2]
                );
                expect(window.googletag.setTargeting).toHaveBeenCalledWith(
                    'slot',
                    data[3]
                );
            });
        }));

    it('should display ads', () => {
        config.page.hasPageSkin = true;
        getBreakpoint.mockReturnValue('wide');
        return new Promise(resolve => {
            prepareGoogletag.init(noop, resolve);
        }).then(() => {
            expect(
                window.googletag.pubads().enableSingleRequest
            ).toHaveBeenCalled();
            expect(
                window.googletag.pubads().collapseEmptyDivs
            ).toHaveBeenCalled();
            expect(window.googletag.enableServices).toHaveBeenCalled();
            expect(loadAdvert).toHaveBeenCalled();
        });
    });

    it('should be able to create "out of page" ad slot', () => {
        $('.js-ad-slot')
            .first()
            .attr('data-out-of-page', true);
        return new Promise(resolve => {
            prepareGoogletag.init(noop, resolve);
        }).then(() => {
            expect(window.googletag.defineOutOfPageSlot).toHaveBeenCalled();
        });
    });

    it('should expose ads IDs', () => {
        const fakeEventOne = makeFakeEvent('1', 'dfp-ad-html-slot');
        const fakeEventTwo = makeFakeEvent('2', 'dfp-ad-script-slot');

        return new Promise(resolve => {
            prepareGoogletag.init(noop, resolve);
        }).then(() => {
            window.googletag.pubads().listeners.slotRenderEnded(fakeEventOne);
            window.googletag.pubads().listeners.slotRenderEnded(fakeEventTwo);

            const result = getCreativeIDs();

            expect(result.length).toBe(2);
            expect(result[0]).toEqual('1');
            expect(result[1]).toEqual('2');
        });
    });

    describe('pageskin loading', () => {
        it('should lazy load ads when there is no pageskin', () => {
            config.page.hasPageSkin = false;
            expect(dfpEnv.shouldLazyLoad()).toBe(true);
        });

        it('should not lazy load ads when there is a pageskin', () => {
            config.page.hasPageSkin = true;
            expect(dfpEnv.shouldLazyLoad()).toBe(false);
        });
    });

    describe('keyword targeting', () => {
        it('should send page level keywords', () =>
            new Promise(resolve => {
                prepareGoogletag.init(noop, resolve);
            }).then(() => {
                expect(
                    window.googletag.pubads().setTargeting
                ).toHaveBeenCalledWith('k', ['korea', 'ukraine']);
            }));
    });
});
