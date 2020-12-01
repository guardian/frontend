

import $ from "lib/$";
import { init as selectionSharingInit, updateSelection } from "./selection-sharing";

const markup = `<div class="js-article__body"><p>Some text to select</p></div>`;

jest.mock('lib/detect', () => ({
  hasTouchScreen: () => false
}));

jest.mock('rangefix', () => ({
  getBoundingClientRect: () => ({ left: 0, bottom: 0 })
}));

beforeEach(() => {
  if (document.body) {
    document.body.innerHTML = markup;
  }
});

afterEach(() => {
  if (document.body) {
    document.body.innerHTML = '';
  }
});

test('should be initially hidden in the article body', () => {
  selectionSharingInit();

  expect($('.selection-sharing').length).toBe(1);
  expect($('.selection-sharing').hasClass('selection-sharing--active')).toBe(false);
});

test('should be visible when text is selected in the article body', () => {
  // required mocks (not present in jsdom at time of writing)
  class MockRange {

    startContainer: Text | null | undefined;
    endContainer: Text | null | undefined;
    startOffset: number;
    endOffset: number;

    constructor() {
      this.startContainer = null;
      this.endContainer = null;
      this.startOffset = 0;
      this.endOffset = 0;
    }

    setStart(el, startOffset) {
      this.startContainer = el;
      this.startOffset = startOffset;
    }

    setEnd(el, endOffset) {
      this.endContainer = el;
      this.endOffset = endOffset;
    }

    toString() {
      if (this.startContainer && this.endContainer) {
        return this.startContainer.wholeText + this.endContainer.wholeText;
      }

      return 'no ranges...';
    }
  }

  class MockSelection {

    ranges: Array<Range>;
    rangeCount: number;

    constructor(range: Range) {
      this.ranges = [range];
      this.rangeCount = 1;
    }

    addRange(range) {
      this.ranges.push(range);
      this.rangeCount += 1;
    }

    getRangeAt(index) {
      return this.ranges[index];
    }

    toString() {
      return this.ranges[0].toString();
    }
  }

  // Hacking around Flow as JSDOM doesn't have a Range type but Flow does and
  // expects one here. The Flow interface is big enough that implementing it
  // feels like overkill. It may be that JSDOM implements Range in the future
  // though, which we can then sub in (see:
  // https://github.com/tmpvar/jsdom/issues/317).
  // $FlowFixMe
  document.createRange = jest.fn(() => new MockRange());

  if (document.body) {
    document.body.scrollTop = 0;
  }

  selectionSharingInit();

  const $jsArticleBody = $('.js-article__body');

  const p1 = document.createElement('p');
  const p2 = document.createElement('p');
  const t1 = document.createTextNode('aa');
  const t2 = document.createTextNode('aa');
  const range = document.createRange();

  // Additional mock, note defined after range constant
  window.getSelection = jest.fn(() => new MockSelection(range));

  p1.appendChild(t1);
  p2.appendChild(t2);

  $jsArticleBody.append(p1);
  $jsArticleBody.append(p2);

  range.setStart(t1, 1);
  range.setEnd(t2, 1);

  if (window.getSelection) {
    window.getSelection().addRange(range);
  }

  // More reliable than testing a throttled event handler.
  updateSelection();

  expect($('.selection-sharing').hasClass('selection-sharing--active')).toBe(true);
});