import { _ } from './background';
import type { BackgroundSpecs } from './background';

const { setupBackground, getStylesFromSpec } = _;

const adSpec: BackgroundSpecs = {
	scrollType: 'fixed',
	backgroundColour: 'ffffff',
	backgroundImage: 'image',
	backgroundRepeat: 'no-repeat',
	backgroundPosition: 'absolute',
	backgroundSize: 'contain',
	ctaUrl: 'theguardian.com',
	transform: 'translate3d(0,0,0)',
};

describe('Cross-frame messenger: setupBackground', () => {
	class IntersectionObserver {
		constructor() {
			return Object.freeze({
				observe: () => {
					//
				},
				unobserve: () => {
					//
				},
				disconnect: () => {
					//
				},
			});
		}
	}

	beforeEach(() => {
		document.body.innerHTML = `
              <div>
                  <div id="slot01"><div id="iframe01" class="iframe"></div></div>
              </div>`;

		Object.defineProperty(global, 'IntersectionObserver', {
			value: IntersectionObserver,
			writable: true,
		});

		expect.hasAssertions();
	});

	it('should create new elements if there are specs', () => {
		const fakeAdSlot =
			document.getElementById('slot01') ?? document.createElement('div');

		return setupBackground(adSpec, fakeAdSlot).then(() => {
			const creative = document.querySelector('.creative__background');
			const parent = document.querySelector(
				'.creative__background-parent',
			);
			expect(creative?.toString()).toEqual('[object HTMLDivElement]');
			expect(parent?.toString()).toEqual('[object HTMLDivElement]');
			expect(creative?.className).toMatch(/background--fixed/);
		});
	});
});

describe('Cross-frame messenger: getStylesFromSpec', () => {
	it('should return an object of valid styles', () => {
		const specStyles = getStylesFromSpec(adSpec);
		// @ts-expect-error -- this is what we're testing
		expect(specStyles.scrollType).toBeUndefined();
		// @ts-expect-error -- this is what we're testing
		expect(specStyles.ctaUrl).toBeUndefined();
		expect(specStyles.backgroundColor).toBe('ffffff');
		expect(specStyles.backgroundImage).toBe('image');
		expect(specStyles.backgroundRepeat).toBe('no-repeat');
		expect(specStyles.backgroundPosition).toBe('absolute');
		expect(specStyles.backgroundSize).toBe('contain');
		expect(specStyles.transform).toBe('translate3d(0,0,0)');
	});
});
