/* eslint-disable @typescript-eslint/no-misused-promises
-- Fastdom measure and mutate signatures are Promise<void>
-- Nested fastdom measure-mutate promises throw the error:
-- "Promise returned in function argument where a void return was expected"
*/
import { getCookie } from '@guardian/libs';
import crossIcon from 'svgs/icon/cross.svg';
import fastdom from '../../../../lib/fastdom-promise';

const shouldRenderLabel = (adSlotNode: HTMLElement): boolean =>
	!(
		adSlotNode.classList.contains('ad-slot--fluid') ||
		adSlotNode.classList.contains('ad-slot--frame') ||
		adSlotNode.classList.contains('ad-slot--gc') ||
		adSlotNode.classList.contains('u-h') ||
		// set for out-of-page (1x1) and empty (2x2) ads
		adSlotNode.classList.contains('ad-slot--collapse') ||
		adSlotNode.getAttribute('data-label') === 'false' ||
		// Don't render an ad slot label if there's one already present in the slot
		// It's fine for a hidden toggled label to be present
		adSlotNode.querySelectorAll(
			'.ad-slot__label:not(.ad-slot__label--toggle.hidden)',
		).length
	);

const createAdCloseDiv = (): HTMLElement => {
	const closeDiv: HTMLElement = document.createElement('button');
	closeDiv.className = 'ad-slot__close-button';
	closeDiv.innerHTML = crossIcon.markup;
	closeDiv.onclick = () => {
		const container: HTMLElement | null = closeDiv.closest(
			'.mobilesticky-container',
		);
		if (container) container.remove();
	};
	return closeDiv;
};

/*const shouldRenderAdTestLabel = (): boolean =>
	!!getCookie({
		name: 'adtestInLabels',
		shouldMemoize: true,
	});
*/
// If `adtest` cookie is set, display its value in the ad label
// Furthermore, provide a link to clear the cookie
/*const createAdTestLabel = (): HTMLElement => {
	const adTestLabel = document.createElement('span');

	const shouldRender = shouldRenderAdTestLabel();
	const val = getCookie({ name: 'adtest', shouldMemoize: true });

	if (shouldRender && val) {
		adTestLabel.innerHTML += ` [?adtest=${val}] `;

		const url = new URL(window.location.href);
		url.searchParams.set('adtest', 'clear');

		const clearLink = document.createElement('a');
		clearLink.href = url.href;
		clearLink.innerHTML = 'clear';
		adTestLabel.appendChild(clearLink);
	}

	return adTestLabel;
};
*/

/**
 * @param {HTMLElement} adSlotNode
 */
const renderAdvertLabel = (adSlotNode: HTMLElement): Promise<Promise<void>> => {
	return fastdom.measure(() => {
		if (shouldRenderLabel(adSlotNode)) {
			return fastdom.mutate(() => {
				adSlotNode.setAttribute('data-label-show', 'true');
			});
		}
		return Promise.resolve();
	});
};

const renderStickyScrollForMoreLabel = (
	adSlotNode: HTMLElement,
): Promise<void> =>
	fastdom.mutate(() => {
		const scrollForMoreLabel = document.createElement('div');
		scrollForMoreLabel.classList.add('ad-slot__scroll');
		scrollForMoreLabel.innerHTML = 'Scroll for More';
		scrollForMoreLabel.setAttribute('role', 'button');
		scrollForMoreLabel.onclick = (event) => {
			adSlotNode.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			});
			event.preventDefault();
		};
		adSlotNode.appendChild(scrollForMoreLabel);
	});

export {
	renderAdvertLabel,
	renderStickyScrollForMoreLabel,
	shouldRenderLabel,
	createAdCloseDiv,
};
