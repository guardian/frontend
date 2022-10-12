/* eslint-disable @typescript-eslint/no-misused-promises
-- Fastdom measure and mutate signatures are Promise<void>
-- Nested fastdom measure-mutate promises throw the error:
-- "Promise returned in function argument where a void return was expected"
*/
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

const createAdLabel = (): HTMLElement => {
	const adLabel = document.createElement('div');
	adLabel.className = 'ad-slot__label';
	adLabel.innerHTML = 'Advertisement';
	adLabel.appendChild(createAdCloseDiv());
	return adLabel;
};

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
const renderAdvertLabel = (adSlotNode: HTMLElement): Promise<Promise<void>> => {
	let renderDynamic = true;
	const shouldRender = shouldRenderLabel(adSlotNode);

	return fastdom.measure(() => {
		if (adSlotNode.id === 'dfp-ad--top-above-nav') {
			const labelToggle = document.querySelector<HTMLElement>(
				'.ad-slot__label.ad-slot__label--toggle',
			);
			if (labelToggle) {
				// found a toggled label so don't render dynamically
				renderDynamic = false;
				if (shouldRender) {
					void fastdom.mutate(() => {
						labelToggle.classList.remove('hidden');
						labelToggle.classList.add('visible');
					});
				} else {
					// some ads should not have a label
					// for example fabric ads can have an embedded label
					// so don't display and remove from layout
					return fastdom.mutate(() => {
						labelToggle.style.display = 'none';
					});
				}
			}
		}

		if (renderDynamic && shouldRender) {
			return fastdom.mutate(() => {
				adSlotNode.prepend(createAdLabel());
			});
		}
		return Promise.resolve();
	});
};

const renderInterscrollerAdLabel = (adSlotNode: HTMLElement): Promise<void> =>
	fastdom.measure(() => {
		const adSlotLabel: HTMLElement = document.createElement('div');
		adSlotLabel.classList.add('ad-slot__label');
		adSlotLabel.style.cssText = `
		position: absolute;
		top: 0;
		left: 0;
		right: 0;`;
		adSlotLabel.innerHTML = 'Advertisement';
		adSlotNode.appendChild(adSlotLabel);
	});

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
	renderInterscrollerAdLabel,
	renderStickyScrollForMoreLabel,
	shouldRenderLabel,
	createAdCloseDiv,
	createAdLabel,
};
