
import fetchJson from "lib/fetch-json";
import { initCommentCount } from "./comment-count";

jest.mock('lib/fastdom-promise');

jest.mock('lib/fetch-json', () => jest.fn(() => Promise.resolve({
  counts: [{ id: '/p/3ghkT', count: 0 }, { id: '/p/3ghv5', count: 100 }, { id: '/p/3ghx3', count: 200 }, { id: '/p/3gh4n', count: 300 }, { id: '/p/3ghNp', count: 400 }]
})));

const fetchJsonSpy: any = fetchJson;

// TODO: Investigate why these sometimes fails and re-enable
describe.skip('Comment Count', () => {
  beforeEach(() => {
    if (document.body) {
      document.body.innerHTML = `<div class="comment-trails">
                <div class="trail" data-discussion-closed="true" data-discussion-id="/p/3ghkT"><a href="/article/1">1</a></div>
                <div class="trail" data-discussion-id="/p/3ghv5"><a href="/article/1">1</a></div>
                <div class="trail" data-discussion-id="/p/3ghx3"><a href="/article/2">1</a></div>
                <div class="trail" data-discussion-id="/p/3gh4n"><a href="/article/3">1</a></div>
                <div class="trail" data-discussion-id="/p/3ghv5"><a href="/article/4">4</a></div>
                <div class="trail" data-commentcount-format="content" data-discussion-id="/p/3ghNp"><a href="/article/3">1</a></div>
            </div>`;
    }
  });

  afterEach(() => {
    expect(fetchJsonSpy).toHaveBeenCalled();
    expect(fetchJsonSpy).toHaveBeenCalledWith('/discussion/comment-counts.json?shortUrls=/p/3gh4n,/p/3ghNp,/p/3ghkT,/p/3ghv5,/p/3ghx3', { mode: 'cors' });
  });

  test('should append comment counts to DOM for open discussions only', () => initCommentCount().then(() => {
    expect(document.querySelectorAll('.fc-trail__count--commentcount, .commentcount2').length).toBe(5);
  }));

  test('should append "default" format comment counts to DOM', () => initCommentCount().then(() => {
    expect(document.getElementsByClassName('fc-trail__count--commentcount').length).toBe(4);
  }));

  test('should append "content" format comment counts to DOM', () => initCommentCount().then(() => {
    const contentCommentCounts = document.getElementsByClassName('commentcount2__value');

    expect(contentCommentCounts.length).toBe(1);

    expect(contentCommentCounts[0].innerHTML).toBe('400');
  }));
});