// @flow
import $ from 'lib/$';
import fakeMediator from 'lib/mediator';
import fastdom from 'lib/fastdom-promise';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import { isUserLoggedIn as isUserLoggedIn_ } from 'common/modules/identity/api';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { initCommentAdverts, _ } from 'commercial/modules/comment-adverts';
import { refreshAdvert as refreshAdvert_ } from 'commercial/modules/dfp/load-advert';
import { getAdvertById as getAdvertById_ } from 'commercial/modules/dfp/get-advert-by-id';
import { getBreakpoint as getBreakpoint_ } from 'lib/detect';

// Workaround to fix issue where dataset is missing from jsdom, and solve the
// 'cannot set property [...] which has only a getter' TypeError
Object.defineProperty(HTMLElement.prototype, 'dataset', {
    writable: true,
    value: {},
});

jest.mock('lib/mediator');
jest.mock('lib/config', () => ({ page: {}, get: () => false }));

jest.mock('commercial/modules/dfp/add-slot', () => ({
    addSlot: jest.fn(),
}));

jest.mock('commercial/modules/dfp/load-advert', () => ({
    refreshAdvert: jest.fn(),
}));

jest.mock('commercial/modules/dfp/get-advert-by-id', () => ({
    getAdvertById: jest.fn(),
}));

jest.mock('lib/detect', () => ({
    getBreakpoint: jest.fn(),
}));

jest.mock('common/modules/commercial/commercial-features', () => ({
    commercialFeatures: {
        commentAdverts: true,
    },
}));

jest.mock('common/modules/identity/api', () => ({
    isUserLoggedIn: jest.fn(),
}));

const { createCommentSlots, runSecondStage, maybeUpgradeSlot } = _;
const commercialFeaturesMock: any = commercialFeatures;
const isUserLoggedIn: any = isUserLoggedIn_;
const getAdvertById: any = getAdvertById_;
const getBreakpoint: any = getBreakpoint_;
const refreshAdvert: any = refreshAdvert_;

const mockHeight = (height: number) => {
    jest.spyOn(fastdom, 'measure').mockReturnValue(Promise.resolve(height));
};

const generateInnerHtmlWithAdSlot = () => {
    if (document.body) {
        document.body.innerHTML = `
            <div class="js-comments">
                <div class="content__main-column">
                    <div class="js-discussion__ad-slot">
                        <div id="dfp-ad--comments"
                            class="js-ad-slot ad-slot ad-slot--comments js-sticky-mpu
                            data-mobile="1,1|2,2|300,250|300,274|fluid"
                            data-desktop="1,1|2,2|300,250|300,274|fluid">
                        </div>
                    </div>
                </div>
            </div>`;
    }
};

describe('createCommentSlots', () => {
    beforeEach(() => {
        isUserLoggedIn.mockReturnValue(false);
        commercialFeaturesMock.commentAdverts = true;
        if (document.body) {
            document.body.innerHTML = `<div class="js-comments">
            <div class="content__main-column">
                <div class="js-discussion__ad-slot"></div></div></div>`;
        }
    });

    afterEach(() => {
        if (document.body) {
            document.body.innerHTML = '';
        }
        jest.resetAllMocks();
        fakeMediator.removeAllListeners();
    });

    it('should return an ad slot with the correct sizes', () => {
        const commentMpu: HTMLElement = createCommentSlots(false)[0];
        const commentDmpu: HTMLElement = createCommentSlots(true)[0];
        expect(commentMpu.getAttribute('data-desktop')).toBe(
            '1,1|2,2|300,250|300,274|620,1|620,350|550,310|fluid'
        );
        expect(commentMpu.getAttribute('data-mobile')).toBe(
            '1,1|2,2|300,197|300,250|300,274|fluid'
        );
        expect(commentDmpu.getAttribute('data-desktop')).toBe(
            '1,1|2,2|300,250|300,274|620,1|620,350|550,310|fluid|300,600|160,600'
        );
        expect(commentDmpu.getAttribute('data-mobile')).toBe(
            '1,1|2,2|300,197|300,250|300,274|fluid'
        );
    });

    it('should add js-sticky-mpu to the class list', () => {
        const commentMpu: HTMLElement = createCommentSlots(false)[0];
        const commentDmpu: HTMLElement = createCommentSlots(true)[0];
        expect(commentMpu.classList).toContain('js-sticky-mpu');
        expect(commentDmpu.classList).toContain('js-sticky-mpu');
    });
});

describe('maybeUpgradeSlot', () => {
    beforeEach(() => {
        generateInnerHtmlWithAdSlot();
    });

    afterEach(() => {
        if (document.body) {
            document.body.innerHTML = '';
        }
        jest.resetAllMocks();
    });

    it('should upgrade the MPU to a DMPU where necessary', () => {
        const advert: any = {
            sizes: { desktop: [[300, 250]] },
            slot: { defineSizeMapping: jest.fn() },
        };
        expect(advert.sizes.desktop).toEqual([[300, 250]]);

        maybeUpgradeSlot(advert, $('.js-discussion__ad-slot'));
        expect(advert.sizes.desktop).toEqual([
            [300, 250],
            [300, 600],
            [160, 600],
        ]);
        expect(advert.slot.defineSizeMapping).toHaveBeenCalledTimes(1);
    });

    it('should not alter the slot if the slot is already a DMPU', () => {
        const advert: any = {
            sizes: { desktop: [[160, 600], [300, 250], [300, 600]] },
            slot: { defineSizeMapping: jest.fn() },
        };
        expect(advert.sizes.desktop).toEqual([
            [160, 600],
            [300, 250],
            [300, 600],
        ]);

        maybeUpgradeSlot(advert, $('.js-discussion__ad-slot'));
        expect(advert.sizes.desktop).toEqual([
            [160, 600],
            [300, 250],
            [300, 600],
        ]);
        expect(advert.slot.defineSizeMapping).toHaveBeenCalledTimes(0);
    });
});

describe('runSecondStage', () => {
    beforeEach(() => {
        generateInnerHtmlWithAdSlot();
    });

    afterEach(() => {
        if (document.body) {
            document.body.innerHTML = '';
        }
        jest.resetAllMocks();
    });

    it('should upgrade a MPU to DMPU and immediately refresh the slot', () => {
        const $adSlotContainer = $('.js-discussion__ad-slot');
        const $commentMainColumn = $('.js-comments .content__main-column');
        const advert: any = {
            sizes: { desktop: [[300, 250]] },
            slot: { defineSizeMapping: jest.fn() },
        };
        getAdvertById.mockReturnValue(advert);

        runSecondStage($commentMainColumn, $adSlotContainer);
        expect(advert.slot.defineSizeMapping).toHaveBeenCalledTimes(1);
        expect(getAdvertById.mock.calls).toEqual([['dfp-ad--comments']]);
        expect(refreshAdvert).toHaveBeenCalledTimes(1);
    });

    it('should not upgrade a DMPU yet still immediately refresh the slot', () => {
        const $adSlotContainer = $('.js-discussion__ad-slot');
        const $commentMainColumn = $('.js-comments .content__main-column');
        const advert: any = {
            sizes: { desktop: [[300, 250]] },
            slot: { defineSizeMapping: jest.fn() },
        };
        getAdvertById.mockReturnValue(advert);

        runSecondStage($commentMainColumn, $adSlotContainer);
        expect(advert.slot.defineSizeMapping).toHaveBeenCalledTimes(1);
        expect(getAdvertById.mock.calls).toEqual([['dfp-ad--comments']]);
        expect(refreshAdvert).toHaveBeenCalledTimes(1);
    });
});

describe('initCommentAdverts', () => {
    beforeEach(() => {
        isUserLoggedIn.mockReturnValue(false);
        commercialFeaturesMock.commentAdverts = true;
        if (document.body) {
            document.body.innerHTML = `<div class="js-comments">
            <div class="content__main-column">
                <div class="js-discussion__ad-slot"></div></div></div>`;
        }
    });

    afterEach(() => {
        if (document.body) {
            document.body.innerHTML = '';
        }
        jest.resetAllMocks();
        fakeMediator.removeAllListeners();
    });

    it('should return false if commentAdverts are switched off', done => {
        commercialFeaturesMock.commentAdverts = false;
        initCommentAdverts().then(result => {
            expect(result).toBe(false);
            done();
        });
    });

    it('should return false if there is no comments ad slot container', done => {
        if (document.body) {
            document.body.innerHTML = `<div class="js-comments">
                <div class="content__main-column"></div></div>`;
        }
        initCommentAdverts().then(result => {
            expect(result).toBe(false);
            done();
        });
    });

    it('should return false if on mobile', done => {
        if (document.body) {
            document.body.innerHTML = `<div class="js-comments">
                <div class="content__main-column"></div></div>`;
        }

        getBreakpoint.mockReturnValue('mobile')

        initCommentAdverts().then(result => {
            expect(result).toBe(false);
            done();
        });
    });

    it('should insert a DMPU slot if there is enough space', done => {
        mockHeight(800); // at 800px we insert a DMPU regardless
        initCommentAdverts().then(() => {
            fakeMediator.emit('modules:comments:renderComments:rendered');
            fakeMediator.once('page:commercial:comments', () => {
                const adSlot: HTMLElement = (document.querySelector(
                    '.js-ad-slot'
                ): any);
                expect(addSlot).toHaveBeenCalledTimes(1);
                expect(adSlot.getAttribute('data-desktop')).toBe(
                    '1,1|2,2|300,250|300,274|620,1|620,350|550,310|fluid|300,600|160,600'
                );
                done();
            });
        });
    });

    it('should insert a DMPU slot if there is space, and the user is logged in', done => {
        mockHeight(600); // at 600px we can insert a DMPU if the user is logged in
        isUserLoggedIn.mockReturnValue(true);
        initCommentAdverts().then(() => {
            fakeMediator.emit('modules:comments:renderComments:rendered');
            fakeMediator.once('page:commercial:comments', () => {
                const adSlot: HTMLElement = (document.querySelector(
                    '.js-ad-slot'
                ): any);
                expect(addSlot).toHaveBeenCalledTimes(1);
                expect(adSlot.getAttribute('data-desktop')).toBe(
                    '1,1|2,2|300,250|300,274|620,1|620,350|550,310|fluid|300,600|160,600'
                );
                done();
            });
        });
    });

    it('should insert an MPU if the user is logged in, and the DMPU will not fit', done => {
        mockHeight(300); // at 300px we can insert an MPU if the user is logged in
        isUserLoggedIn.mockReturnValue(true);
        initCommentAdverts().then(() => {
            fakeMediator.emit('modules:comments:renderComments:rendered');
            fakeMediator.once('page:commercial:comments', () => {
                const adSlot: HTMLElement = (document.querySelector(
                    '.js-ad-slot'
                ): any);
                expect(addSlot).toHaveBeenCalledTimes(1);
                expect(adSlot.getAttribute('data-desktop')).toBe(
                    '1,1|2,2|300,250|300,274|620,1|620,350|550,310|fluid'
                );
                done();
            });
        });
    });

    it('should otherwise set the EventListener that can insert the slot', done => {
        const spyOn = jest.spyOn(fakeMediator, 'on');
        mockHeight(300);
        initCommentAdverts()
            .then(result => {
                fakeMediator.emit('modules:comments:renderComments:rendered');
                expect(result).toBe(true);
            })
            .then(() => {
                expect(spyOn.mock.calls[0]).toEqual(
                    expect.arrayContaining([
                        'discussion:comments:get-more-replies',
                    ])
                );
                done();
            });
    });

    it('should always set the EventListener', done => {
        const spyOn = jest.spyOn(fakeMediator, 'on');
        mockHeight(800);
        initCommentAdverts()
            .then(result => {
                fakeMediator.emit('modules:comments:renderComments:rendered');
                expect(result).toBe(true);
            })
            .then(() => {
                expect(spyOn.mock.calls[0]).toEqual(
                    expect.arrayContaining([
                        'discussion:comments:get-more-replies',
                    ])
                );
                done();
            });
    });
});
