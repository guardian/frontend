import fastdom from '../../../lib/fastdom-promise';
import { mediator as fakeMediator } from '../../../lib/mediator';
import { init } from './article-aside-adverts';

// This module removes sticky behaviour from ads in immersive article. Example below:
// https://www.theguardian.com/saving-for-a-sunny-day-with-nsandi/2021/apr/20/its-incredibly-liberating-what-saving-for-a-piano-taught-me-about-my-finances

const mockMeasure = (mainColHeight: number, immersiveOffset: number) => {
	// this is an issue with fastdom's typing of measure: () => Promise<void>
	jest.spyOn(fastdom, 'measure').mockReturnValue(
		Promise.resolve([
			mainColHeight,
			immersiveOffset,
		]) as unknown as Promise<void>,
	);
};

const sharedBeforeEach = (domSnippet: string) => () => {
	jest.resetAllMocks();
	fakeMediator.removeAllListeners();
	window.guardian.config.page.isImmersive = false;
	window.guardian.config.page.hasShowcaseMainElement = false;

	document.body.innerHTML = domSnippet;
	expect.hasAssertions();
};

const sharedAfterEach = () => {
	document.body.innerHTML = '';
};

describe('Standard Article Aside Adverts', () => {
	const domSnippet = `
        <div class="js-content-main-column"></div>
        <div class="content__secondary-column js-secondary-column">
            <div class="aside-slot-container js-aside-slot-container">
                <div id="dfp-ad--right" class="js-ad-slot ad-slot ad-slot--right ad-slot--mpu-banner-ad js-sticky-mpu ad-slot--rendered" data-link-name="ad slot right" data-name="right" data-mobile="1,1|2,2|300,250|300,274|300,600|fluid"></div>
            </div>
        </div>
    `;

	beforeEach(sharedBeforeEach(domSnippet));
	afterEach(sharedAfterEach);

	it('should exist', () => {
		expect(init).toBeDefined();
		expect(document.querySelectorAll('.ad-slot').length).toBe(1);
	});

	it('should resolve immediately if the secondary column does not exist', async () => {
		document.body.innerHTML = `<div class="js-content-main-column"></div>`;

		const result = await init();
		expect(result).toBe(false);
	});

	it('should have the correct size mappings and classes', async () => {
		mockMeasure(2000, 0);
		await init();
		const adSlot = document.getElementById('dfp-ad--right');
		expect(adSlot?.classList).toContain('js-sticky-mpu');
		expect(adSlot?.getAttribute('data-mobile')).toBe(
			'1,1|2,2|300,250|300,274|300,600|fluid',
		);
	});

	it('should mutate the ad slot in short articles', async () => {
		mockMeasure(10, 0);
		await init();
		const adSlot = document.getElementById('dfp-ad--right');
		expect(adSlot?.classList).not.toContain('js-sticky-mpu');
		expect(adSlot?.getAttribute('data-mobile')).toBe(
			'1,1|2,2|300,250|300,274|fluid',
		);
	});
});

describe('Immersive Article Aside Adverts', () => {
	const domSnippet = `
        <div class="js-content-main-column">
            <figure class="element element--immersive"></figure>
            <figure class="element element--immersive"></figure>
        </div>
        <div class="content__secondary-column js-secondary-column">
            <div class="aside-slot-container js-aside-slot-container">
                <div id="dfp-ad--right" class="js-ad-slot ad-slot ad-slot--right ad-slot--mpu-banner-ad js-sticky-mpu ad-slot--rendered" data-link-name="ad slot right" data-name="right" data-mobile="1,1|2,2|300,250|300,274|300,600|fluid"></div>
            </div>
        </div>
    `;
	beforeEach(sharedBeforeEach(domSnippet));
	afterEach(sharedAfterEach);

	it('should have correct test elements', () => {
		expect(
			document.querySelectorAll(
				'.js-content-main-column .element--immersive',
			).length,
		).toBe(2);
	});

	it('should remove sticky and return all slot sizes when there is enough space', async () => {
		mockMeasure(900_001, 10_000);
		window.guardian.config.page.isImmersive = true;
		await init();

		const adSlot = document.getElementById('dfp-ad--right');
		expect(adSlot?.classList).not.toContain('js-sticky-mpu');
		const sizes = adSlot?.getAttribute('data-mobile')?.split('|');
		expect(sizes).toContain('1,1');
		expect(sizes).toContain('2,2');
		expect(sizes).toContain('300,250');
		expect(sizes).toContain('300,274');
		expect(sizes).toContain('300,600');
		expect(sizes).toContain('fluid');
	});

	it('should remove sticky and return sizes that will fit when there is limited space', async () => {
		mockMeasure(900_002, 260);
		window.guardian.config.page.isImmersive = true;
		await init();

		const adSlot = document.getElementById('dfp-ad--right');
		expect(adSlot?.classList).not.toContain('js-sticky-mpu');
		const sizes = adSlot?.getAttribute('data-mobile')?.split('|');
		expect(sizes).toContain('1,1');
		expect(sizes).toContain('2,2');
		expect(sizes).toContain('300,250');
		expect(sizes).not.toContain('300,274');
		expect(sizes).not.toContain('300,600');
		expect(sizes).not.toContain('fluid');
	});
});

describe('Immersive Article (no immersive elements) Aside Adverts', () => {
	const domSnippet = `
        <div class="js-content-main-column"></div>
        <div class="content__secondary-column js-secondary-column">
            <div class="aside-slot-container js-aside-slot-container">
                <div id="dfp-ad--right" class="js-ad-slot ad-slot ad-slot--right ad-slot--mpu-banner-ad js-sticky-mpu ad-slot--rendered" data-link-name="ad slot right" data-name="right" data-mobile="1,1|2,2|300,250|300,274|300,600|fluid"></div>
            </div>
        </div>
    `;
	beforeEach(sharedBeforeEach(domSnippet));
	afterEach(sharedAfterEach);

	it('should have the correct size mappings and classes (leaves it untouched)', async () => {
		mockMeasure(900_000, 0);
		window.guardian.config.page.isImmersive = true;
		await init();

		const adSlot = document.getElementById('dfp-ad--right');
		expect(adSlot?.classList).toContain('js-sticky-mpu');
		expect(adSlot?.getAttribute('data-mobile')).toBe(
			'1,1|2,2|300,250|300,274|300,600|fluid',
		);
	});
});
