import Chance from 'chance';
import { addEventListener as addEventListenerSpy } from 'lib/events';
import { _, init } from './sticky-top-banner';

const { resizeStickyBanner, update, onScroll } = _;

jest.mock('lib/detect', () => ({
    isBreakpoint: jest.fn(() => true),
}));
jest.mock('commercial/modules/messenger', () => ({
    register: jest.fn(),
}));
jest.mock('commercial/modules/dfp/track-ad-render', () => ({
    trackAdRender: () => Promise.resolve(true),
}));
jest.mock('lib/events', () => ({
    addEventListener: jest.fn(),
}));
jest.mock('common/modules/commercial/commercial-features', () => ({
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

Element.prototype.getBoundingClientRect = jest.fn(() => ({ height: 500 }));

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
                <div id="header"></div>
            `;
        }
        header = document.getElementById('header');
        stickyBanner = document.getElementById('top-banner-parent');
        expect.hasAssertions();
    });

    afterEach(() => {
        scrollBySpy.mockReset();
        window.pageYOffset = 0;
    });

    it('should add listeners and classes', () =>
        init().then(() => {
            if (!header || !stickyBanner) {
                throw Error('missing header or sticky banner element');
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
        }));

    it('should not add classes when scrolled past the header', () => {
        window.pageYOffset = 501;

        return init().then(() => {
            if (!header || !stickyBanner) {
                throw Error('missing header or sticky banner element');
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
        });
    });

    it('should set the slot height and the header top margin', () => {
        const randomHeight = chance.integer({
            max: 500,
        });

        return init()
            .then(() => _.whenFirstRendered)
            .then(() => resizeStickyBanner(randomHeight))
            .then(() => {
                if (!header || !stickyBanner) {
                    throw Error('missing header or sticky banner element');
                } else {
                    expect(header.style.marginTop).toBe(`${randomHeight}px`);
                    expect(stickyBanner.style.height).toBe(`${randomHeight}px`);
                }
            });
    });

    it('should adjust the scroll position', () => {
        const randomHeight = chance.integer({
            max: 500,
        });
        window.pageYOffset = 501;

        return init()
            .then(() => resizeStickyBanner(randomHeight))
            .then(() => {
                window.pageYOffset = 0;
                expect(scrollBySpy).toHaveBeenCalled();
            });
    });

    it('should include height and paddings when setting the slot height', () => {
        const padingTop = chance.integer({
            max: 50,
        });
        const paddingBottom = chance.integer({
            max: 50,
        });
        const height = chance.integer({
            max: 500,
        });
        const topSlot = document.getElementById('dfp-ad--top-above-nav');

        if (topSlot) {
            topSlot.style.paddingTop = `${padingTop}px`;
            topSlot.style.paddingBottom = `${paddingBottom}px`;
        }

        return init()
            .then(() => update(height))
            .then(() => {
                if (!stickyBanner) {
                    throw Error('missing sticky banner element');
                } else {
                    expect(stickyBanner.style.height).toBe(
                        `${height + padingTop + paddingBottom}px`
                    );
                }
            });
    });

    it('should reset the banner position and top styles at the top of the page', () =>
        onScroll().then(() => {
            if (!stickyBanner) {
                throw Error('missing header or sticky banner element');
            } else {
                expect(stickyBanner.style.position).toBe('');
                expect(stickyBanner.style.top).toBe('');
            }
        }));

    it('should position the banner absolutely past the header', () => {
        window.pageYOffset = 501;

        return init()
            .then(onScroll)
            .then(() => {
                if (!stickyBanner) {
                    throw Error('missing header or sticky banner element');
                } else {
                    expect(stickyBanner.style.position).toBe('absolute');
                    expect(stickyBanner.style.top).toBe('500px');
                }
            });
    });
});
