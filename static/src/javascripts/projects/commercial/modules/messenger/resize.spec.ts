/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import { _ } from './resize';

const { normalise, resize } = _;

describe('Cross-frame messenger: resize', () => {
	beforeEach(() => {
		document.body.innerHTML = `
              <div id="slot01" class="js-ad-slot" style="width: 7px; height: 14px;" >
                <div id="container01">
                    <iframe id="iframe01" class="iframe" data-unit="ch"></iframe>
                </div>
              </div>`;

		expect.hasAssertions();
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	describe('normalise function', () => {
		it('should normalise the length passed in', () => {
			expect(normalise('300')).toBe('300px');
			expect(normalise('600px')).toBe('600px');
			expect(normalise('900??')).toBe('900px');
		});

		it('should accept all relative units', () => {
			const units = [
				'ch',
				'px',
				'em',
				'rem',
				'vmin',
				'vmax',
				'vh',
				'vw',
				'ex',
			];
			units.forEach((unit) => {
				expect(normalise(`10${unit}`)).toBe(`10${unit}`);
			});
		});
	});

	describe('resize function', () => {
		it('should not resize if the specs are empty', async () => {
			const fakeAdSlot = document.createElement('div');

			const fakeIframeContainer = document.createElement('div');
			Object.assign(fakeIframeContainer.style, {
				width: '20px',
				height: '30px',
			});

			const fakeIframe = document.createElement('iframe');
			Object.assign(fakeIframe.style, {
				width: '120px',
				height: '220px',
			});

			await resize({}, fakeIframe, fakeIframeContainer, fakeAdSlot);

			expect(fakeIframeContainer.style.width).toEqual('20px');
			expect(fakeIframeContainer.style.height).toEqual('30px');
			expect(fakeIframe.style.width).toEqual('120px');
			expect(fakeIframe.style.height).toEqual('220px');
		});

		it('should set width and height of the iFrame and leave ad slot unchanged', async () => {
			const fallback = document.createElement('div');
			const fallbackIframe = document.createElement('iframe');
			const fakeIframeContainer =
				document.getElementById('container01') ?? fallback;
			const selectedIframe = document.getElementById('iframe01');
			const fakeIframe =
				selectedIframe instanceof HTMLIFrameElement
					? selectedIframe
					: fallbackIframe;
			const fakeAdSlot = document.getElementById('slot01') ?? fallback;

			await resize(
				{ width: '20', height: '10' },
				fakeIframe,
				fakeIframeContainer,
				fakeAdSlot,
			);

			expect(fakeIframe.style.height).toBe('10px');
			expect(fakeIframe.style.width).toBe('20px');
			expect(fakeAdSlot.style.height).toBe('14px');
			expect(fakeAdSlot.style.width).toBe('7px');
		});
	});
});
