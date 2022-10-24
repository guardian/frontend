import fastdom from '../../../../lib/fastdom-promise';
import { createAdLabel, shouldRenderLabel } from '../dfp/render-advert-label';

// TODO: flesh out this function once we have a better idea of what we want it to look like
// const insertConsentlessLabelInfo = (adLabelNode: HTMLElement): void => {
// 	const consentlessLabelInfo = document.createElement('button');
// 	consentlessLabelInfo.className = 'ad-slot__consentless-info u-button-reset';
// 	consentlessLabelInfo.setAttribute(
// 		'title',
// 		`Because of your choice this advertising sets no cookies and doesn't track you.`,
// 	);
// 	consentlessLabelInfo.innerHTML = `Opt Out: Why am I seeing this?`;
// 	adLabelNode.appendChild(consentlessLabelInfo);
// };

/**
 *  **Dynamic labels:**
 *  Advert labels are historically inserted dynamically as a child of the advert slot node.
 *  This causes a cumulative layout shift (CLS) as content below is pushed down. This is
 *  particularly noticeable when ads are refreshed as the advert slot contents are deleted.
 *
 *  **Toggled labels:**
 *  To prevent CLS the label inserted on the server with its visibility initially hidden.
 *  Its visibility and width is toggled once the ad and its width is known.
 *  Currently only for dfp-ad--top-above-nav.
 * @param {HTMLElement} adSlotNode
 */
export const renderConsentlessAdvertLabel = (
	adSlotNode: HTMLElement,
): Promise<Promise<void>> => {
	let renderDynamic = true;
	const shouldRender = shouldRenderLabel(adSlotNode);

	// eslint-disable-next-line @typescript-eslint/no-misused-promises -- fastdom miss-typed
	return fastdom.measure(async () => {
		if (adSlotNode.id === 'dfp-ad--top-above-nav') {
			const labelToggle = document.querySelector<HTMLElement>(
				'.ad-slot__label.ad-slot__label--toggle',
			);
			// const adLabelNode =
			// adSlotNode.querySelector<HTMLElement>('.ad-slot__label');

			// if (adLabelNode) {
			// insertConsentlessLabelInfo(adLabelNode);
			// }

			if (labelToggle) {
				// found a toggled label so don't render dynamically
				renderDynamic = false;
				if (shouldRender) {
					await fastdom.mutate(() => {
						labelToggle.classList.remove('hidden');
						labelToggle.classList.add('visible');
					});
				} else {
					// some ads should not have a label
					// for example fabric ads can have an embedded label
					// so don't display and remove from layout
					await fastdom.mutate(() => {
						labelToggle.style.display = 'none';
					});
				}
			}
		}

		if (renderDynamic && shouldRender) {
			const adLabelNode = createAdLabel();
			await fastdom.mutate(() => {
				adSlotNode.prepend(adLabelNode);
				// insertConsentlessLabelInfo(adLabelNode);
			});
		}
	});
};
