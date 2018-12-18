// @flow
import mediator from 'lib/mediator';
import fastdom from 'lib/fastdom-promise';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import { isUserLoggedIn as isUserLoggedIn_ } from 'common/modules/identity/api';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { initCommentAdverts, _ } from 'commercial/modules/comment-adverts';
import { refreshAdvert } from 'commercial/modules/dfp/load-advert';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';

// Workaround to fix issue where dataset is missing from jsdom, and solve the
// 'cannot set property [...] which has only a getter' TypeError
Object.defineProperty(HTMLElement.prototype, 'dataset', {
    writable: true,
    value: {},
});

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

jest.mock('common/modules/commercial/commercial-features', () => ({
    commercialFeatures: {
        commentAdverts: true,
    },
}));

jest.mock('common/modules/identity/api', () => ({
    isUserLoggedIn: jest.fn(),
}));

const { createCommentSlots, refreshCommentAd } = _;

const commercialFeaturesMock: any = commercialFeatures;
const isUserLoggedIn: any = isUserLoggedIn_;

const mockHeight = (height: number) => {
    jest.spyOn(fastdom, 'read').mockReturnValue(Promise.resolve(height));
};

describe('createCommentSlots', () => {
    beforeEach(() => {
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
    });

    it('should return an ad slot with the correct sizes', () => {
        const commentMpu: HTMLElement = createCommentSlots(false)[0];
        const commentDmpu: HTMLElement = createCommentSlots(true)[0];
        expect(commentMpu.getAttribute('data-desktop')).toBe(
            '1,1|2,2|300,250|620,1|620,350|300,274|fluid'
        );
        expect(commentMpu.getAttribute('data-mobile')).toBe(
            '1,1|2,2|300,250|300,274|fluid'
        );
        expect(commentDmpu.getAttribute('data-desktop')).toBe(
            '1,1|2,2|300,250|620,1|620,350|300,274|fluid|300,600'
        );
        expect(commentDmpu.getAttribute('data-mobile')).toBe(
            '1,1|2,2|300,250|300,274|fluid'
        );
    });

    it('should add js-sticky-mpu to the class list', () => {
        const commentMpu: HTMLElement = createCommentSlots(false)[0];
        const commentDmpu: HTMLElement = createCommentSlots(true)[0];
        expect(commentMpu.classList).toContain('js-sticky-mpu');
        expect(commentDmpu.classList).toContain('js-sticky-mpu');
    });
});

describe('initCommentAdverts', () => {
    beforeEach(() => {
        jest.resetAllMocks();
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
    });

    it('should return false if commentAdverts are switched off', () => {
        commercialFeaturesMock.commentAdverts = false;
        expect(initCommentAdverts()).toBe(false);
    });

    it('should return false if there is no comments ad slot container', () => {
        if (document.body) {
            document.body.innerHTML = `<div class="js-comments">
                <div class="content__main-column"></div></div>`;
        }
        expect(initCommentAdverts()).toBe(false);
    });

    it('should insert a DMPU slot if there is enough space', done => {
        mockHeight(800);
        initCommentAdverts();
        mediator.emit('modules:comments:renderComments:rendered');
        mediator.once('page:defaultcommercial:comments', () => {
            const adSlot: HTMLElement = (document.querySelector(
                '.js-ad-slot'
            ): any);
            expect(addSlot).toHaveBeenCalledTimes(1);
            expect(adSlot.getAttribute('data-desktop')).toBe(
                '1,1|2,2|300,250|620,1|620,350|300,274|fluid|300,600'
            );
            done();
        });
    });

    it('should insert a DMPU slot if there is space, and the user is logged in', done => {
        mockHeight(600);
        isUserLoggedIn.mockReturnValue(true);
        initCommentAdverts();
        mediator.emit('modules:comments:renderComments:rendered');
        mediator.once('page:defaultcommercial:comments', () => {
            const adSlot: HTMLElement = (document.querySelector(
                '.js-ad-slot'
            ): any);
            expect(addSlot).toHaveBeenCalledTimes(1);
            expect(adSlot.getAttribute('data-desktop')).toBe(
                '1,1|2,2|300,250|620,1|620,350|300,274|fluid|300,600'
            );
            done();
        });
    });

    it('should insert a MPU if a DMPU does not fit, and the user is logged in', done => {
        mockHeight(300);
        isUserLoggedIn.mockReturnValue(true);
        initCommentAdverts();
        mediator.emit('modules:comments:renderComments:rendered');
        mediator.once('page:defaultcommercial:comments', () => {
            const adSlot: HTMLElement = (document.querySelector(
                '.js-ad-slot'
            ): any);
            expect(addSlot).toHaveBeenCalledTimes(1);
            expect(adSlot.getAttribute('data-desktop')).toBe(
                '1,1|2,2|300,250|620,1|620,350|300,274|fluid'
            );
            done();
        });
    });

    it('should upgrade the MPU to a DMPU when there is space', done => {
        mockHeight(800);
        initCommentAdverts();
        mediator.emit('modules:comments:renderComments:rendered');
        mediator.once('page:defaultcommercial:comments', () => {
            const adSlot: HTMLDivElement = (document.querySelector(
                '.js-ad-slot'
            ): any);
            expect(addSlot).toHaveBeenCalledTimes(1);
            expect(adSlot.getAttribute('data-desktop')).toBe(
                '1,1|2,2|300,250|620,1|620,350|300,274|fluid|300,600'
            );
            done();
        });
    });

    it('should refresh comments slot when more comments is clicked', done => {
        mockHeight(800);
        initCommentAdverts();
        getAdvertById.mockReturnValue(true);
        mediator.emit('modules:comments:renderComments:rendered');
        // mediator.emit('discussion:comments:get-more-replies');
        mediator.once('page:defaultcommercial:comments', () => {
            expect(getAdvertById).toHaveBeenCalledTimes(1);
            expect(refreshAdvert).toHaveBeenCalledTimes(1);
            done();
        });
    });

    it('should upgrade an MPU to a DMPU when more comments is clicked', done => {
        mockHeight(400);
        isUserLoggedIn.mockReturnValue(true);
        initCommentAdverts();
        mediator.emit('modules:comments:renderComments:rendered');
        mediator.emit('discussion:comments:get-more-replies');
        mediator.once('page:defaultcommercial:comments', () => {
            const adSlot: HTMLElement = (document.querySelector(
                '.js-ad-slot'
            ): any);
            expect(addSlot).toHaveBeenCalledTimes(1);
            expect(adSlot.getAttribute('data-desktop')).toBe(
                '1,1|2,2|300,250|620,1|620,350|300,274|fluid|300,600'
            );
            done();
        });
    });
});
