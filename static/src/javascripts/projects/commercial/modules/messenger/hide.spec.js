// @flow
import type { JestMockT } from 'jest';
import { _ } from './hide.js';

const foolFlow = (mockFn: any) => ((mockFn: any): JestMockT);
const { hide } = _;

describe('Cross-frame messenger: hide', () => {
    describe('hide function', () => {
        it('should hide the ad slot', done => {
            const fallback = document.createElement('div');
            const fakeIframe = document.getElementById('iframe01') || fallback;
            const fakeAdSlot = document.getElementById('slot01') || fallback;
            foolFlow(hide(fakeAdSlot))
                .then(() => {
                    expect(fakeIframe.classList.contains('u-h'));
                })
                .then(done)
                .catch(done.fail);
        });
    });
});
