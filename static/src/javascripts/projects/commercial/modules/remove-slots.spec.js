import { removeSlots, removeDisabledSlots } from './remove-slots';

const adSlotSelector = '.js-ad-slot';
const toggledAdLabelSelector = '.ad-slot__label--toggle';

describe('Remove ad slots and labels', () => {
	afterEach(() => {
		if (document.body) {
			document.body.innerHTML = '';
		}
	});
	test('Remove all ad slots and toggled labels', () => {
		if (document.body) {
			document.body.innerHTML = `
                <div>
                    <div class="ad-slot__label ad-slot__label--toggle hidden">Advertisement</div>
                    <div class="ad-slot__label ad-slot__label--toggle hidden">Advertisement</div>
                    <div class="ad-slot__label">Advertisement</div>
                    <div class="js-ad-slot"></div>
                    <div class="js-ad-slot"></div>
                </div>
            `;
		}
		expect(document.querySelectorAll(adSlotSelector).length).toEqual(2);
		expect(
			document.querySelectorAll(toggledAdLabelSelector).length,
		).toEqual(2);
		return removeSlots().then(() => {
			expect(document.querySelectorAll(adSlotSelector).length).toEqual(0);
			expect(
				document.querySelectorAll(toggledAdLabelSelector).length,
			).toEqual(0);
			expect(document.querySelectorAll('.ad-slot__label').length).toEqual(
				1,
			);
		});
	});

	test('Remove all disabled (ie display: none) ad slots and toggled labels', () => {
		if (document.body) {
			document.body.innerHTML = `
                <div>
                    <div style="display: none" class="ad-slot__label ad-slot__label--toggle hidden">Advertisement</div>
                    <div class="ad-slot__label ad-slot__label--toggle hidden">Advertisement</div>
                    <div class="ad-slot__label">Advertisement</div>
                    <div style="display: none" class="js-ad-slot"></div>
                    <div class="js-ad-slot"></div>
                </div>
            `;
		}
		expect(document.querySelectorAll(adSlotSelector).length).toEqual(2);
		expect(
			document.querySelectorAll(toggledAdLabelSelector).length,
		).toEqual(2);
		return removeDisabledSlots().then(() => {
			expect(document.querySelectorAll(adSlotSelector).length).toEqual(1);
			expect(
				document.querySelectorAll(toggledAdLabelSelector).length,
			).toEqual(1);
			expect(document.querySelectorAll('.ad-slot__label').length).toEqual(
				2,
			);
		});
	});
});
