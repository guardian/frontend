import { log } from '@guardian/libs';
import fastdom from 'fastdom';
import { renderConsentlessAdvertLabel } from './render-advert-label';

/**
 * Define an Opt Out Advertising slot
 *
 * @param slot The HTML element in which the ad will be inserted
 *
 * @param slotName The name of the slot.
 * This is Typically presented as the `data-name` attribute on server-side-rendered slots
 *
 * @param slotKind The kind of slot represents what group the slot belongs to.
 * This only applies to inline slots, where we have:
 * - `inline`: Inlines that sat within the content (liveblogs, fronts, `inline1` on articles)
 * - `inline-right`: Inlines that can float in the right column on articles
 */
const defineSlot = (
	slot: HTMLElement,
	slotName: string,
	slotKind?: 'inline' | 'inline-right',
): void => {
	const slotId = slot.id;

	const filledCallback: OptOutFilledCallback = (
		_adSlot,
		{ width, height },
	) => {
		log('commercial', `Filled consentless ${slotId}`);

		const isFluid = width === 1 && height === 1;
		if (isFluid) {
			slot.classList.add('ad-slot--fluid');
		}

		void renderConsentlessAdvertLabel(slot);
	};

	const emptyCallback = () => {
		log('commercial', `Empty consentless ${slotId}`);
		fastdom.mutate(() => {
			slot.remove();
		});
	};

	window.ootag.queue.push(() => {
		// Associate the slot name with each slot's targeting
		// Note we use the name as the value, but we associate it with a given slot id
		// For example for ad with id `dfp-ad--inline1` we add `slot=inline1`
		window.ootag.addParameterForSlot(slotId, 'slot', slotName);

		window.ootag.defineSlot({
			// Used to identify slots defined in the Opt Out interface
			// If a kind is present we use that, otherwise fall-back to the slot name
			adSlot: slotKind ?? slotName,
			targetId: slotId,
			id: slotId,
			filledCallback,
			emptyCallback,
		});
	});
};

export { defineSlot };
