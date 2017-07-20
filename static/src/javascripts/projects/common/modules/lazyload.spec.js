// @flow

import { lazyload } from './lazyload';

jest.mock('lib/fetch-json', () => () =>
    Promise.resolve({ html: '<span>foo</span>' })
);

describe('Lazy Load', () => {
    const container = document.createElement('div');

    it('should lazy load', done =>
        lazyload('whatever/dude', container, {
            finally() {
                expect(container.classList.contains('lazyloaded')).toBeTruthy();
                expect(container.innerHTML).toBe('<span>foo</span>');
                done();
            },
        }));
});
