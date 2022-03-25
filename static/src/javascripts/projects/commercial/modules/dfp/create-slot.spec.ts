import { adSizes } from '@guardian/commercial-core';
import { createAdSlot } from './create-slot';

const imHtml = `
<div id="dfp-ad--im"
    class="js-ad-slot ad-slot ad-slot--im"
    data-link-name="ad slot im"
    data-name="im"
    aria-hidden="true"
    data-mobile="1,1|2,2|88,85|fluid"
    data-label="false"
    data-refresh="false"></div>
`;

const inline1Html = `
<div id="dfp-ad--inline1"
    class="js-ad-slot ad-slot ad-slot--inline ad-slot--inline1"
    data-link-name="ad slot inline1"
    data-name="inline1"
    aria-hidden="true"
    data-mobile="1,1|2,2|300,197|300,250|300,274|fluid"
    data-phablet="1,1|2,2|300,197|300,250|300,274|fluid|620,350|550,310"
    data-desktop="1,1|2,2|300,250|300,274|fluid|620,350|550,310">
</div>
`;

describe('Create Ad Slot', () => {
	it('should exist', () => {
		expect(createAdSlot).toBeDefined();
	});

	[
		{
			type: 'im',
			htmls: imHtml,
		},
		{
			type: 'inline',
			classes: 'inline',
			name: 'inline1',
			htmls: inline1Html,
			sizes: {
				desktop: [
					adSizes.outstreamDesktop,
					adSizes.outstreamGoogleDesktop,
				],
				phablet: [
					adSizes.outstreamDesktop,
					adSizes.outstreamGoogleDesktop,
				],
			},
		},
	].forEach((expectation) => {
		it(`should create "${expectation.type}" ad slot`, () => {
			const adSlot = createAdSlot(expectation.type, {
				name: expectation.name,
				classes: expectation.classes,
				sizes: expectation.sizes,
			});

			expect(adSlot.outerHTML).toBe(
				expectation.htmls.replace(/\n/g, '').replace(/\s+/g, ' '),
			);
		});
	});

	it('should create "inline1" ad slot and merge valid additional sizes', () => {
		const adSlot = createAdSlot('inline', {
			sizes: {
				desktop: [
					adSizes.outstreamDesktop,
					adSizes.outstreamGoogleDesktop,
				],
				mobile: [adSizes.inlineMerchandising],
				invalid: [adSizes.leaderboard],
			},
		});
		const desktopSizes = adSlot.getAttribute('data-desktop');
		expect(desktopSizes).toEqual(
			'1,1|2,2|300,250|300,274|fluid|620,350|550,310',
		);
		const mobileSizes = adSlot.getAttribute('data-mobile');
		expect(mobileSizes).toEqual(
			'1,1|2,2|300,197|300,250|300,274|fluid|88,85',
		);
		expect(adSlot.getAttributeNames()).not.toContain('data-invalid');
	});

	it('should use correct sizes for the mobile top-above-nav slot', () => {
		const topAboveNavSlot = createAdSlot('top-above-nav');
		const mobileSizes = topAboveNavSlot.getAttribute('data-mobile');
		expect(mobileSizes).toBe('1,1|2,2|88,71|300,197|300,250|fluid');
	});
});
