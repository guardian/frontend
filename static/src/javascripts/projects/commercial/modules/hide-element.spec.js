import { hideElement } from './hide-element.js';

const foolFlow = (mockFn) => ((mockFn));

describe('Cross-frame messenger: hide', () => {
    describe('hide function', () => {
        it('should hide the ad slot', () => {
            expect.hasAssertions();
            const fallback = document.createElement('div');
            const fakeIframe = document.getElementById('iframe01') || fallback;
            const fakeAdSlot = document.getElementById('slot01') || fallback;
            return foolFlow(hideElement(fakeAdSlot)).then(() => {
                expect(fakeIframe.classList.contains('u-h')).toBe(true);
            });
        });
    });
});
