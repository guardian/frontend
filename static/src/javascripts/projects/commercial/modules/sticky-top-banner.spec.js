// @flow

import Chance from 'chance';
import { addEventListener as addEventListenerSpy } from 'lib/events';
import {
    initStickyTopBanner,
    update,
    resize,
    onScroll,
} from './sticky-top-banner';

jest.mock('lib/detect', () => ({
    isBreakpoint: jest.fn(() => true),
}));
jest.mock('commercial/modules/messenger', () => ({
    register: jest.fn(),
}));
jest.mock('commercial/modules/dfp/track-ad-render', () => () =>
    Promise.resolve(true)
);
jest.mock('lib/events', () => ({
    addEventListener: jest.fn(),
}));
jest.mock('commercial/modules/commercial-features', () => ({
    commercialFeatures: {
        stickyTopBannerAd: true,
    },
}));
jest.mock('commercial/modules/dfp/get-advert-by-id', () => ({
    getAdvertById: jest.fn(() => ({
        size: [0, 1],
    })),
}));
const registerSpy: any = require('commercial/modules/messenger').register;

describe('Sticky ad banner', () => {
    const scrollBySpy = jest.spyOn(window, 'scrollBy');
    const chance = new Chance();
    let header;
    let stickyBanner;

    beforeEach(() => {
        if (document.body) {
            document.body.innerHTML = `
                <div id="top-banner-parent">
                    <div id="dfp-ad--top-above-nav"></div>
                </div>
                <div id="header" style="height: 500px">
                    Things
                </div>
            `;
        }
        header = document.getElementById('header');
        stickyBanner = document.getElementById('top-banner-parent');
    });

    afterEach(() => {
        scrollBySpy.mockReset();
        window.pageYOffset = 0;
    });

    it('should add listeners and classes', done => {
        initStickyTopBanner()
            .then(() => {
                if (!header || !stickyBanner) {
                    done.fail('missing header or sticky banner element');
                } else {
                    expect(registerSpy.mock.calls.length).toBe(1);
                    expect(addEventListenerSpy).toHaveBeenCalled();
                    expect(header.classList.contains('l-header--animate')).toBe(
                        true
                    );
                    expect(
                        stickyBanner.classList.contains(
                            'sticky-top-banner-ad--animate'
                        )
                    ).toBe(true);
                }
            })
            .then(done)
            .catch(done.fail);
    });

    it('should not add classes when scrolled past the header', done => {
        window.pageYOffset = 501;
        initStickyTopBanner()
            .then(() => {
                if (!header || !stickyBanner) {
                    done.fail('missing header or sticky banner element');
                } else {
                    window.pageYOffset = 0;
                    expect(header.classList.contains('l-header--animate')).toBe(
                        false
                    );
                    expect(
                        stickyBanner.classList.contains(
                            'sticky-top-banner-ad--animate'
                        )
                    ).toBe(false);
                }
            })
            .then(done)
            .catch(done.fail);
    });

    it('should set the slot height and the header top margin', done => {
        const randomHeight = chance.integer({
            max: 500,
        });
        initStickyTopBanner()
            .then(() => resize(randomHeight))
            .then(() => {
                if (!header || !stickyBanner) {
                    done.fail('missing header or sticky banner element');
                } else {
                    expect(header.style.marginTop).toBe(`${randomHeight}px`);
                    expect(stickyBanner.style.height).toBe(`${randomHeight}px`);
                }
            })
            .then(done)
            .catch(done.fail);
    });

    it('should adjust the scroll position', done => {
        const randomHeight = chance.integer({
            max: 500,
        });
        window.pageYOffset = 501;
        initStickyTopBanner()
            .then(() => resize(randomHeight))
            .then(() => {
                window.pageYOffset = 0;
                expect(scrollBySpy).toHaveBeenCalled();
            })
            .then(done)
            .catch(done.fail);
    });

    it('should include height and paddings when setting the slot height', done => {
        const pt = chance.integer({
            max: 50,
        });
        const pb = chance.integer({
            max: 50,
        });
        const h = chance.integer({
            max: 500,
        });
        const topSlot = document.getElementById('dfp-ad--top-above-nav');

        if (topSlot) {
            topSlot.style.paddingTop = `${pt}px`;
            topSlot.style.paddingBottom = `${pb}px`;
        }
        initStickyTopBanner()
            .then(() => update(h))
            .then(() => {
                if (!stickyBanner) {
                    done.fail('missing sticky banner element');
                } else {
                    expect(stickyBanner.style.height).toBe(`${h + pt + pb}px`);
                }
            })
            .then(done)
            .catch(done.fail);
    });

    it('should reset the banner position and top styles at the top of the page', done => {
        onScroll()
            .then(() => {
                if (!stickyBanner) {
                    done.fail('missing header or sticky banner element');
                } else {
                    expect(stickyBanner.style.position).toBe('');
                    expect(stickyBanner.style.top).toBe('');
                }
            })
            .then(done)
            .catch(done.fail);
    });

    it('should position the banner absolutely past the header', done => {
        window.pageYOffset = 501;
        initStickyTopBanner()
            .then(onScroll)
            .then(() => {
                if (!stickyBanner) {
                    done.fail('missing header or sticky banner element');
                } else {
                    expect(stickyBanner.style.position).toBe('absolute');
                    expect(stickyBanner.style.top).toBe('500px');
                }
            })
            .then(done)
            .catch(done.fail);
    });
});
