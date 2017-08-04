// @flow
import mediator from 'lib/mediator';
import fastdom from 'lib/fastdom-promise';
import {
    init,
    getContentIds,
    getElementsIndexedById,
} from 'common/modules/discussion/comment-count';

const setHTML = (h: string): Promise<void> =>
    fastdom.write(() => {
        if (document.body) {
            document.body.innerHTML = h;
        }
    });

jest.mock('lib/fetch-json', () => () =>
    Promise.resolve({
        counts: [
            { id: '/p/3ghv5', count: 380 },
            { id: '/p/3ghx3', count: 33 },
            { id: '/p/3gh4n', count: 33 },
        ],
    })
);

beforeEach(() =>
    setHTML(
        `<div class="comment-trails">
            <div class="trail" data-discussion-id="/p/3ghv5"><a href="/article/1">1</a></div>
            <div class="trail" data-discussion-id="/p/3ghx3"><a href="/article/2">1</a></div>
            <div class="trail" data-discussion-id="/p/3gh4n"><a href="/article/3">1</a></div>
         </div>`
    )
);

afterEach(() => setHTML(''));

test("should get discussion id's from the DOM", () => {
    const data = '/p/3gh4n,/p/3ghv5,/p/3ghx3';
    expect(getContentIds(getElementsIndexedById())).toEqual(data);
});

test('should get comment counts from ajax end-point', done => {
    mediator.once('modules:commentcount:loaded', done);

    init();
});

test('should append comment counts to DOM', done => {
    mediator.once('modules:commentcount:loaded', () => {
        expect(
            document.getElementsByClassName('fc-trail__count--commentcount')
                .length
        ).toBe(3);
        done();
    });

    init();
});
