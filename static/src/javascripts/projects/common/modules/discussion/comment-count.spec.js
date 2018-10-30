// @flow
import fetchJson from 'lib/fetch-json';
import {
    getCommentCounts,
    getElementsIndexedById,
    getContentIds,
    updateElement,
} from './comment-count';

jest.mock('lib/fastdom-promise');

jest.mock('lib/fetch-json', () =>
    jest.fn(() =>
        Promise.resolve({
            counts: [
                { id: '/p/3ghkT', count: 0 },
                { id: '/p/3ghv5', count: 100 },
                { id: '/p/3ghx3', count: 200 },
                { id: '/p/3gh4n', count: 300 },
                { id: '/p/3ghNp', count: 400 },
            ],
        })
    )
);

const fetchJsonSpy: any = fetchJson;

const getMockCommentElement = () => {
    const el = document.createElement('div');

    el.innerHTML = `<div class="comment-trails">
        <div class="trail" data-discussion-closed="true" data-discussion-id="/p/3ghkT"><a href="/article/1">1</a></div>
        <div class="trail" data-discussion-id="/p/3ghv5"><a href="/article/1">1</a></div>
        <div class="trail" data-discussion-id="/p/3ghx3"><a href="/article/2">1</a></div>
        <div class="trail" data-discussion-id="/p/3gh4n"><a href="/article/3">1</a></div>
        <div class="trail" data-discussion-id="/p/3ghv5"><a href="/article/4">4</a></div>
        <div class="trail" data-commentcount-format="content" data-discussion-id="/p/3ghNp"><a href="/article/3">1</a></div>
    </div>`;

    return el;
};

// TODO: Investigate why these sometimes fails and re-enable
describe('Comment Count', () => {
    test('getElementsIndexedById returns a map of id to list of elements', () =>
        getElementsIndexedById(getMockCommentElement()).then(
            indexedElements => {
                expect(indexedElements).toBeDefined();
                expect(Object.keys(indexedElements).length).toBe(5);
                expect(indexedElements['/p/3gh4n'].length).toBe(1);
                expect(indexedElements['/p/3ghv5'].length).toBe(2);
            }
        ));

    test('getContentIds returns a CSV string of ids', () => {
        const ids = getContentIds({
            '/p/alpha': [],
            '/p/beta': [],
        });

        expect(ids).toBe('/p/alpha,/p/beta');
    });

    test('updateElement for non-content format', () =>
        getElementsIndexedById(getMockCommentElement()).then(
            indexedElements => {
                expect(indexedElements['/p/3gh4n'].length).toBe(1);
                updateElement(indexedElements['/p/3gh4n'][0], 77).then(() => {
                    expect(indexedElements['/p/3gh4n'][0].innerHTML).toContain(
                        '77 comments'
                    );
                    expect(
                        indexedElements['/p/3gh4n'][0].innerHTML
                    ).not.toContain('commentcount2');
                });
            }
        ));

    test('updateElement for content format', () =>
        getElementsIndexedById(getMockCommentElement()).then(
            indexedElements => {
                expect(indexedElements['/p/3ghNp'].length).toBe(1);
                updateElement(indexedElements['/p/3ghNp'][0], 88).then(() => {
                    expect(indexedElements['/p/3ghNp'][0].innerHTML).toContain(
                        '88 comments'
                    );
                    expect(indexedElements['/p/3ghNp'][0].innerHTML).toContain(
                        'commentcount2'
                    );
                });
            }
        ));

    test('should append comment counts to DOM for open discussions only', () => {
        const el = getMockCommentElement();

        getCommentCounts(el).then(() => {
            expect(
                el.querySelectorAll(
                    '.fc-trail__count--commentcount, .commentcount2'
                ).length
            ).toBe(5);
            expect(fetchJsonSpy).toHaveBeenCalled();
            expect(fetchJsonSpy).toHaveBeenCalledWith(
                '/discussion/comment-counts.json?shortUrls=/p/3gh4n,/p/3ghNp,/p/3ghkT,/p/3ghv5,/p/3ghx3',
                { mode: 'cors' }
            );
        });
    });

    test('should append "default" format comment counts to DOM', () => {
        const el = getMockCommentElement();

        getCommentCounts(el).then(() => {
            expect(
                el.getElementsByClassName('fc-trail__count--commentcount')
                    .length
            ).toBe(4);
            expect(fetchJsonSpy).toHaveBeenCalled();
            expect(fetchJsonSpy).toHaveBeenCalledWith(
                '/discussion/comment-counts.json?shortUrls=/p/3gh4n,/p/3ghNp,/p/3ghkT,/p/3ghv5,/p/3ghx3',
                { mode: 'cors' }
            );
        });
    });

    test('should append "content" format comment counts to DOM', () => {
        const el = getMockCommentElement();

        getCommentCounts(el).then(() => {
            const contentCommentCounts = el.getElementsByClassName(
                'commentcount2__value'
            );

            expect(contentCommentCounts.length).toBe(1);
            expect(contentCommentCounts[0].innerHTML).toBe('400');
            expect(fetchJsonSpy).toHaveBeenCalled();
            expect(fetchJsonSpy).toHaveBeenCalledWith(
                '/discussion/comment-counts.json?shortUrls=/p/3gh4n,/p/3ghNp,/p/3ghkT,/p/3ghv5,/p/3ghx3',
                { mode: 'cors' }
            );
        });
    });
});
