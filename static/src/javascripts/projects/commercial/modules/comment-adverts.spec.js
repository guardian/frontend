// @flow
import mediator from 'lib/mediator';
import fastdom from 'lib/fastdom-promise';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { initCommentAdverts } from 'commercial/modules/comment-adverts';

jest.mock('lib/config', () => ({ page: {}, get: () => false }));
jest.mock('commercial/modules/dfp/add-slot', () => ({
    addSlot: jest.fn(),
}));
jest.mock('common/modules/commercial/commercial-features', () => ({
    commercialFeatures: {
        commentAdverts: true,
    },
}));

const commercialFeaturesMock: any = commercialFeatures;

const mockHeight = (height: number) => {
    jest.spyOn(fastdom, 'read').mockReturnValue(Promise.resolve(height));
};

describe('Comment Adverts', () => {
    beforeEach(() => {
        jest.resetAllMocks();

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
    });

    it('should exist', () => {
        expect(initCommentAdverts).toBeDefined();
    });

    it('should return false if commentAdverts are switched off', () => {
        commercialFeaturesMock.commentAdverts = false;
        expect(initCommentAdverts()).toBe(false);
    });

    it('should insert a comment advert when the comments section passes the height threshold', done => {
        commercialFeaturesMock.commentAdverts = true;
        mockHeight(800);
        initCommentAdverts();
        mediator.emit('modules:comments:renderComments:rendered');
        mediator.once('page:defaultcommercial:comments', () => {
            const adSlots = document.querySelectorAll('.js-ad-slot');
            expect(adSlots.length).toBe(1);
            expect(addSlot).toHaveBeenCalledTimes(1);
            done();
        });
    });
});
