// @flow
/* eslint-disable no-new*/
import qwery from 'qwery';
import mediator from 'lib/mediator';
import { noop } from 'lib/noop';
import { articleAsideAdvertsInit } from 'commercial/modules/article-aside-adverts';
import { commercialFeatures } from 'commercial/modules/commercial-features';
import fastdom from 'lib/fastdom-promise';

jest.mock('commercial/modules/commercial-features', () => ({
    commercialFeatures: {
        articleAsideAdverts: true,
    },
}));

const mockMainColHeight = (height: number) => {
    jest.spyOn(fastdom, 'read').mockReturnValue(Promise.resolve(height));
};

describe('Article Aside Adverts', () => {
    const domSnippet = `
        <div class="js-content-main-column"></div>
        <div class="content__secondary-column js-secondary-column">
            <div class="ad-slot-container">
                <div id="dfp-ad--right" class="js-ad-slot ad-slot ad-slot--right ad-slot--mpu-banner-ad js-sticky-mpu ad-slot--rendered" data-link-name="ad slot right" data-name="right" data-mobile="1,1|2,2|300,250|300,600|fluid"></div>
            </div>
        </div>
    `;

    beforeEach(() => {
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
    });

    afterEach(() => {
        if (document.body) {
            document.body.innerHTML = '';
        }
    });

    it('should exist', () => {
        expect(articleAsideAdvertsInit).toBeDefined();
        expect(qwery('.ad-slot').length).toBe(1);
    });

    it('should have the correct size mappings and classes', done => {
        mockMainColHeight(900000);
        mediator.once('page:defaultcommercial:right', adSlot => {
            expect(adSlot.classList).toContain('js-sticky-mpu');
            expect(adSlot.getAttribute('data-mobile')).toBe(
                '1,1|2,2|300,250|300,600|fluid'
            );
            done();
        });
        articleAsideAdvertsInit(noop, noop);
    });

    it('should mutate the ad slot in short articles', done => {
        mockMainColHeight(10);
        mediator.once('page:defaultcommercial:right', adSlot => {
            expect(adSlot.classList).not.toContain('js-sticky-mpu');
            expect(adSlot.getAttribute('data-mobile')).toBe(
                '1,1|2,2|300,250|fluid'
            );
            done();
        });
        articleAsideAdvertsInit(noop, noop);
    });

    it('should not do anything if disabled in commercial-feature-switches', done => {
        commercialFeatures.articleAsideAdverts = false;
        articleAsideAdvertsInit(noop, noop).then(returned => {
            expect(returned).toBe(false);
            done();
        });
    });
});
