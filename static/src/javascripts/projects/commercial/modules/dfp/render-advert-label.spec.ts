import { renderAdvertLabel } from './render-advert-label';

jest.mock('../../../common/modules/commercial/commercial-features', () => ({
	commercialFeatures: {},
}));

const adSelector = '.js-ad-slot';
const labelSelector = '.ad-slot__label';

const adverts: Record<string, string> = {
	withLabel: `
        <div class="js-ad-slot"></div>`,
	labelDisabled: `
        <div class="js-ad-slot" data-label="false"></div>`,
	alreadyLabelled: `
        <div class="js-ad-slot">
            <div class="ad-slot__label">Advertisement</div>
        </div>`,
	frame: `
        <div class="js-ad-slot ad-slot--frame"></div>`,
	uh: `
        <div class="js-ad-slot u-h"></div>`,
	topAboveNav: `
        <div class="js-ad-slot" id="dfp-ad--top-above-nav"></div>`,
	topAboveNavToggleLabel: `
        <div>
            <div class="js-ad-slot" id="dfp-ad--top-above-nav">
				<div class="ad-slot__label ad-slot__label--toggle hidden">Advertisement</div>
			</div>
        </div>`,
};

const createAd = (html: string) => {
	document.body.innerHTML = html;
};

const getAd = (): HTMLElement =>
	document.querySelector(adSelector) as HTMLElement;

describe('Rendering advert labels', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('Can add a label', async () => {
		createAd(adverts['withLabel']);
		return renderAdvertLabel(getAd()).then(() => {
			const label = getAd().querySelector(labelSelector);
			expect(label).not.toBeNull();
		});
	});

	it('The label has a message', async () => {
		createAd(adverts['withLabel']);
		return renderAdvertLabel(getAd()).then(() => {
			const label = getAd().querySelector(labelSelector) as Element;
			expect(label.textContent).toBe('Advertisement');
		});
	});

	it('Will not add a label if it has an attribute data-label="false"', async () => {
		createAd(adverts['labelDisabled']);
		return renderAdvertLabel(getAd()).then(() => {
			const label = getAd().querySelector(labelSelector);
			expect(label).toBeNull();
		});
	});

	it('Will not add a label if the adSlot already has one', async () => {
		createAd(adverts['alreadyLabelled']);
		return renderAdvertLabel(getAd()).then(() => {
			const label = getAd().querySelectorAll(labelSelector);
			expect(label.length).toBe(1);
		});
	});

	it('Will not add a label to frame ads', async () => {
		createAd(adverts['frame']);
		return renderAdvertLabel(getAd()).then(() => {
			const label = getAd().querySelector(labelSelector);
			expect(label).toBeNull();
		});
	});

	it('Will not add a label to an ad slot with a hidden u-h class', async () => {
		createAd(adverts['uh']);
		return renderAdvertLabel(getAd()).then(() => {
			const label = getAd().querySelector(labelSelector);
			expect(label).toBeNull();
		});
	});

	it('When the ad is top above nav and the label is toggleable, make the label visible', async () => {
		createAd(adverts['topAboveNavToggleLabel']);
		return renderAdvertLabel(getAd()).then(() => {
			const adSlotLabel = getAd().querySelector(labelSelector);
			expect(adSlotLabel).not.toBeNull();
			const label = document.querySelector(labelSelector) as HTMLElement;
			expect(label.classList.contains('visible')).toBe(true);
		});
	});

	it('When the ad is top above nav and the label is NOT toggleable, render the label dynamically', async () => {
		createAd(adverts['topAboveNav']);
		return renderAdvertLabel(getAd()).then(() => {
			const label = getAd().querySelector(labelSelector) as HTMLElement;
			expect(label.textContent).toEqual('Advertisement');
		});
	});
});
