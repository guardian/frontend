// @flow
/* eslint-disable no-new */
import config from 'lib/config';
import qwery from 'qwery';
import mediator from 'lib/mediator';
import { noop } from 'lib/noop';
import { init } from 'commercial/modules/article-aside-adverts';
import fastdom from 'lib/fastdom-promise';

jest.mock('common/modules/commercial/commercial-features', () => ({
    commercialFeatures: {
        articleAsideAdverts: true,
    },
}));

const fastdomReadSpy = jest.spyOn(fastdom, 'read');

jest.mock('lib/config', () => ({
    get: jest.fn(),
}));
const configSpy = jest.spyOn(config, 'get');

const sharedBeforeEach = (domSnippet: string) => () => {
    jest.resetAllMocks();

    if (document.body) {
        document.body.innerHTML = domSnippet;
    }

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
    expect.hasAssertions();
};

const sharedAfterEach = () => {
    if (document.body) {
        document.body.innerHTML = '';
    }
};

describe('Standard Article Aside Adverts', () => {
    const domSnippet = `
        <div class="js-content-main-column"></div>
        <div class="content__secondary-column js-secondary-column">
            <div class="ad-slot-container">
                <div id="dfp-ad--right" class="js-ad-slot ad-slot ad-slot--right ad-slot--mpu-banner-ad js-sticky-mpu ad-slot--rendered" data-link-name="ad slot right" data-name="right" data-mobile="1,1|2,2|160,600|300,250|300,274|300,600|fluid"></div>
            </div>
        </div>
    `;

    beforeEach(sharedBeforeEach(domSnippet));
    afterEach(sharedAfterEach);

    it('should exist', () => {
        expect(init).toBeDefined();
        expect(qwery('.ad-slot').length).toBe(1);
    });

    it('should have the correct size mappings and classes', done => {
        configSpy.mockReturnValueOnce(false);
        fastdomReadSpy.mockReturnValue(Promise.resolve([900000, 0]));
        mediator.once('page:defaultcommercial:right', adSlot => {
            expect(adSlot.classList).toContain('js-sticky-mpu');
            expect(adSlot.getAttribute('data-mobile')).toBe(
                '1,1|2,2|160,600|300,250|300,274|300,600|fluid'
            );
            done();
        });
        init(noop, noop);
    });

    it('should mutate the ad slot in short articles', done => {
        configSpy.mockReturnValueOnce(false);
        fastdomReadSpy.mockReturnValue(Promise.resolve([10, 0]));
        mediator.once('page:defaultcommercial:right', adSlot => {
            expect(adSlot.classList).not.toContain('js-sticky-mpu');
            expect(adSlot.getAttribute('data-mobile')).toBe(
                '1,1|2,2|300,250|300,274|fluid'
            );
            done();
        });
        init(noop, noop);
    });
});

describe('Immersive Article Aside Adverts', () => {
    const domSnippet = `
        <div class="js-content-main-column">
            <figure class="element element--immersive"></figure>
            <figure class="element element--immersive"></figure>
        </div>
        <div class="content__secondary-column js-secondary-column">
            <div class="ad-slot-container">
                <div id="dfp-ad--right" class="js-ad-slot ad-slot ad-slot--right ad-slot--mpu-banner-ad js-sticky-mpu ad-slot--rendered" data-link-name="ad slot right" data-name="right" data-mobile="1,1|2,2|160,600|300,250|300,274|300,600|fluid"></div>
            </div>
        </div>
    `;
    beforeEach(sharedBeforeEach(domSnippet));
    afterEach(sharedAfterEach);

    it('should have correct test elements', () => {
        expect(
            qwery('.js-content-main-column .element--immersive').length
        ).toBe(2);
    });

    it('should remove sticky and return all slot sizes when there is enough space', done => {
        fastdomReadSpy.mockReturnValueOnce(Promise.resolve([900001, 10000]));
        configSpy.mockReturnValueOnce(true);

        mediator.once('page:defaultcommercial:right', adSlot => {
            expect(adSlot.classList).not.toContain('js-sticky-mpu');
            const sizes = adSlot.getAttribute('data-mobile').split('|');
            expect(sizes).toContain('1,1');
            expect(sizes).toContain('2,2');
            expect(sizes).toContain('160,600');
            expect(sizes).toContain('300,250');
            expect(sizes).toContain('300,274');
            expect(sizes).toContain('300,600');
            expect(sizes).toContain('fluid');
            done();
        });
        init(noop, noop);
    });

    it('should remove sticky and return sizes that will fit when there is limited space', done => {
        fastdomReadSpy.mockReturnValueOnce(Promise.resolve([900002, 260]));
        configSpy.mockReturnValueOnce(true);

        mediator.once('page:defaultcommercial:right', adSlot => {
            expect(adSlot.classList).not.toContain('js-sticky-mpu');
            const sizes = adSlot.getAttribute('data-mobile').split('|');
            expect(sizes).toContain('1,1');
            expect(sizes).toContain('2,2');
            expect(sizes).toContain('300,250');
            expect(sizes).not.toContain('160,600');
            expect(sizes).not.toContain('300,274');
            expect(sizes).not.toContain('300,600');
            expect(sizes).not.toContain('fluid');
            done();
        });
        init(noop, noop);
    });
});

describe('Immersive Article (no immersive elements) Aside Adverts', () => {
    const domSnippet = `
        <div class="js-content-main-column"></div>
        <div class="content__secondary-column js-secondary-column">
            <div class="ad-slot-container">
                <div id="dfp-ad--right" class="js-ad-slot ad-slot ad-slot--right ad-slot--mpu-banner-ad js-sticky-mpu ad-slot--rendered" data-link-name="ad slot right" data-name="right" data-mobile="1,1|2,2|160,600|300,250|300,274|300,600|fluid"></div>
            </div>
        </div>
    `;
    beforeEach(sharedBeforeEach(domSnippet));
    afterEach(sharedAfterEach);

    it('should have the correct size mappings and classes (leaves it untouched)', done => {
        configSpy.mockReturnValueOnce(true);
        fastdomReadSpy.mockReturnValue(Promise.resolve([900000, 0]));
        mediator.once('page:defaultcommercial:right', adSlot => {
            expect(adSlot.classList).toContain('js-sticky-mpu');
            expect(adSlot.getAttribute('data-mobile')).toBe(
                '1,1|2,2|160,600|300,250|300,274|300,600|fluid'
            );
            done();
        });
        init(noop, noop);
    });
});
