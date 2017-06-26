// @flow
import type { JestMockT } from 'jest';

import { register } from 'commercial/modules/messenger';
import { _ } from './background';

const { setBackground, getStylesFromSpec } = _;

// Jest understands `register.mock.calls`, however, Flow gets angry because:
// 'property mock not found in statics of function'. This is a helper to allow
// `expect(register.mock.calls[0][0]).toBe('background');` to pass linting
const foolFlow = (mockFn: any) => ((mockFn: any): JestMockT);

jest.mock('commercial/modules/messenger', () => ({
    register: jest.fn(),
}));

const adSpec = {
    scrollType: 'fixed',
    backgroundColour: 'ffffff',
    backgroundImage: 'image',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'absolute',
};

describe('Cross-frame messenger: setBackground', () => {
    beforeEach(done => {
        if (document.body) {
            document.body.innerHTML = `
              <div>
                  <div id="slot01"><div id="iframe01" class="iframe"></div></div>
              </div>`;
        }
        done();
    });

    it('should call register', () => {
        expect(register).toHaveBeenCalled();
        expect(foolFlow(register).mock.calls[0][0]).toBe('background');
    });

    it('should return nothing if there are no specs', () => {
        const fakeAdSlot = document.createElement('div');
        // Ignore the missing argument, becuase we want to test that... $FlowFixMe
        expect(setBackground({}, fakeAdSlot)).toBeNull();
    });

    it('should create new elements if there are specs', done => {
        const fallback = document.createElement('div');
        const fakeAdSlot = document.getElementById('slot01') || fallback;

        foolFlow(setBackground(adSpec, fakeAdSlot))
            .then(() => {
                const creative: Object =
                    document.querySelector('.creative__background') || {};
                const parent: Object =
                    document.querySelector('.creative__background-parent') ||
                    {};
                expect(creative.toString()).toEqual('[object HTMLDivElement]');
                expect(parent.toString()).toEqual('[object HTMLDivElement]');
                // $FlowFixMe className will be there, I promise
                expect(creative.className).toMatch('background--fixed');
            })
            .then(done)
            .catch(done.fail);
    });
});

describe('Cross-frame messenger: getStylesFromSpec', () => {
    it('should return an object of valid styles', () => {
        const specStyles: Object = getStylesFromSpec(adSpec);
        expect(specStyles.scrollType).toBeUndefined();
        expect(specStyles.backgroundColor).toBe('ffffff');
        expect(specStyles.backgroundImage).toBe('image');
        expect(specStyles.backgroundRepeat).toBe('no-repeat');
        expect(specStyles.backgroundPosition).toBe('absolute');
    });
});
