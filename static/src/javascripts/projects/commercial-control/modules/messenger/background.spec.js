// @flow
import { _ } from './background';

const { setBackground, getStylesFromSpec } = _;

const adSpec = {
    scrollType: 'fixed',
    backgroundColour: 'ffffff',
    backgroundImage: 'image',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'absolute',
};

describe('Cross-frame messenger: setBackground', () => {
    beforeEach(() => {
        if (document.body) {
            document.body.innerHTML = `
              <div>
                  <div id="slot01"><div id="iframe01" class="iframe"></div></div>
              </div>`;
        }
        expect.hasAssertions();
    });

    it('should create new elements if there are specs', () => {
        const fallback = document.createElement('div');
        const fakeAdSlot = document.getElementById('slot01') || fallback;

        return setBackground(adSpec, fakeAdSlot).then(() => {
            const creative: Object =
                document.querySelector('.creative__background') || {};
            const parent: Object =
                document.querySelector('.creative__background-parent') || {};
            expect(creative.toString()).toEqual('[object HTMLDivElement]');
            expect(parent.toString()).toEqual('[object HTMLDivElement]');
            expect(creative.className).toMatch(/background--fixed/);
        });
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
