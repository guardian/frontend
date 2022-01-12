import fastdom from '../../../../lib/fastdom-promise';

const normalise = (length) => {
	const lengthRegexp = /^(\d+)(%|px|em|ex|ch|rem|vh|vw|vmin|vmax)?/;
	const defaultUnit = 'px';
	const matches = String(length).match(lengthRegexp);
	if (!matches) {
		return '';
	}
	return matches[1] + (matches[2] === undefined ? defaultUnit : matches[2]);
};

const resize = (specs, iframe, iframeContainer, adSlot) => {
	if (
		!specs ||
		!('height' in specs || 'width' in specs) ||
		!iframe ||
		!adSlot
	) {
		return null;
	}

	const styles = {};

	if (specs.width) {
		styles.width = normalise(specs.width);
	}

	if (specs.height) {
		styles.height = normalise(specs.height);
	}

	return fastdom.mutate(() => {
		Object.assign(iframe.style, styles);

		if (iframeContainer) {
			Object.assign(iframeContainer.style, styles);
		}
	});
};

// When an outstream resizes we want it to revert to its original styling
const removeAnyOutstreamClass = (adSlot) => {
	fastdom.mutate(() => {
		if (adSlot) {
			adSlot.classList.remove('ad-slot--outstream');
		}
	});
};

const init = (register) => {
	register('resize', (specs, ret, iframe) => {
		if (iframe && specs) {
			const adSlot = iframe && iframe.closest('.js-ad-slot');
			removeAnyOutstreamClass(adSlot);
			const iframeContainer =
				iframe && iframe.closest('.ad-slot__content');
			return resize(specs, iframe, iframeContainer, adSlot);
		}
	});
};

export const _ = { resize, normalise };

export { init };
