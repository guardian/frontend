import crossIcon from 'svgs/icon/cross.svg';
import fastdom from '../../../../lib/fastdom-promise';

const shouldRenderLabel = (adSlotNode) =>
	!(
		adSlotNode.classList.contains('ad-slot--fluid') ||
		adSlotNode.classList.contains('ad-slot--frame') ||
		adSlotNode.classList.contains('ad-slot--gc') ||
		adSlotNode.getAttribute('data-label') === 'false' ||
		adSlotNode.getElementsByClassName('ad-slot__label').length
	);

const createAdCloseDiv = () => {
	const closeDiv = document.createElement('button');
	closeDiv.className = 'ad-slot__close-button';
	closeDiv.innerHTML = crossIcon.markup;
	closeDiv.onclick = () => {
		const container = closeDiv.closest(
			'.mobilesticky-container',
		);
		if (container) container.remove();
	};
	return closeDiv;
};

const createAdLabel = () => {
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
 *  To prevent CLS the label is now a sibling element with its visibility initially hidden.
 *  Its visibility and width is toggled once the ad and its width is known.
 *  Currently only for dfp-ad--top-above-nav.
 * @param {HTMLElement} adSlotNode
 */
export const renderAdvertLabel = (
	adSlotNode,
) => {
	let renderDynamicLabel = true;
	return fastdom.measure(() => {
		if (adSlotNode.id === 'dfp-ad--top-above-nav') {
			const labelToggle = document.querySelector(
				'.ad-slot__label.ad-slot__label--toggle',
			);
			if (labelToggle) {
				// found a toggled label so don't render dynamically
				renderDynamicLabel = false;
				const adSlotWidth = adSlotNode.offsetWidth;
				const labelToggleWidth = labelToggle.offsetWidth;
				if (labelToggleWidth !== adSlotWidth) {
					return fastdom.mutate(() => {
						labelToggle.style.width = `${adSlotWidth}px`;
						labelToggle.classList.remove('hidden');
						labelToggle.classList.add('visible');
					});
				}
			}
		}
		if (renderDynamicLabel) {
			if (shouldRenderLabel(adSlotNode)) {
				return fastdom.mutate(() => {
					adSlotNode.prepend(createAdLabel());
				});
			}
		}
		return Promise.resolve();
	});
};

export const renderStickyAdLabel = (adSlotNode) =>
	fastdom.measure(() => {
		const adSlotLabel = document.createElement('div');
		adSlotLabel.classList.add('ad-slot__label');
		adSlotLabel.classList.add('sticky');
		adSlotLabel.innerHTML = 'Advertisement';
		adSlotNode.appendChild(adSlotLabel);
	});

export const renderStickyScrollForMoreLabel = (
	adSlotNode,
) =>
	fastdom.mutate(() => {
		const scrollForMoreLabel = document.createElement('div');
		scrollForMoreLabel.classList.add('ad-slot__scroll');
		scrollForMoreLabel.innerHTML = 'Scroll for More';
		scrollForMoreLabel.onclick = (event) => {
			adSlotNode.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			});
			event.preventDefault();
		};
		adSlotNode.appendChild(scrollForMoreLabel);
	});
