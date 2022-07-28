import config from '../../../../lib/config';
import { addEventListener } from '../../../../lib/events';
import fastdom from '../../../../lib/fastdom-promise';
import {
	renderStickyAdLabel,
	renderStickyScrollForMoreLabel,
} from '../dfp/render-advert-label';

const getStylesFromSpec = (specs) =>
	Object.keys(specs).reduce((result, key) => {
		if (key !== 'scrollType') {
			result[key] = specs[key];
		}
		// Flow is love, Flow is Life! DFP has been passing us `backgroundColour`
		// all along, and the setting of this css prop has been silently failing
		if (key === 'backgroundColour') {
			result.backgroundColor = specs[key];
		}
		return result;
	}, {});

const setBackground = (specs, adSlot) => {
	if (
		!specs ||
		!('backgroundImage' in specs) ||
		!('backgroundRepeat' in specs) ||
		!('backgroundPosition' in specs) ||
		!('scrollType' in specs) ||
		!(adSlot instanceof Element)
	) {
		return Promise.resolve();
	}

	const specStyles = getStylesFromSpec(specs);

	// check to see whether the parent div exists already, if so, jut alter the style

	const backgroundParentClass =
		specs.scrollType === 'interscroller'
			? 'creative__background-parent-interscroller'
			: 'creative__background-parent';
	const backgroundClass = 'creative__background';

	const maybeBackgroundParent = adSlot.getElementsByClassName(
		backgroundParentClass,
	)[0];
	const maybeBackground = maybeBackgroundParent
		? maybeBackgroundParent.getElementsByClassName(backgroundClass)[0]
		: null;
	const backgroundAlreadyExists = !!(
		maybeBackgroundParent && maybeBackground
	);

	const getBackground = () => {
		if (
			maybeBackground &&
			maybeBackgroundParent &&
			backgroundAlreadyExists
		) {
			return Promise.resolve({
				backgroundParent: maybeBackgroundParent,
				background: maybeBackground,
			});
		}
		// Wrap the background image in a DIV for positioning. Also, we give
		// this DIV a background colour if it is provided. This is because
		// if we set the background colour in the creative itself, the background
		// image won't be visible (think z-indexed layers)
		const backgroundParent = document.createElement('div');

		// Create an element to hold the background image
		const background = document.createElement('div');
		backgroundParent.appendChild(background);

		// Inject styles in DCR (from _creatives.scss)
		// mark: 0bf74539-5466-4907-ae7b-c0d8fc41112d
		if (config.get('isDotcomRendering', false)) {
			backgroundParent.style.position = 'absolute';
			backgroundParent.style.top = '0';
			backgroundParent.style.left = '0';
			backgroundParent.style.right = '0';
			backgroundParent.style.bottom = '0';
			backgroundParent.style.clip = 'rect(0, auto, auto, 0)';

			background.style.top = '0';
			background.style.left = '0';
			background.style.right = '0';
			background.style.bottom = '0';
			background.style.transition = 'background 100ms ease';
		}

		return fastdom
			.mutate(() => {
				if (backgroundParent) {
					// Create a stacking context in DCR
					if (
						config.get('isDotcomRendering', false) &&
						adSlot.firstChild &&
						adSlot.firstChild instanceof HTMLElement
					)
						adSlot.firstChild.style.contain = 'layout';

					if (specs.scrollType === 'interscroller') {
						adSlot.style.height = '85vh';
						adSlot.style.marginBottom = '12px';
						adSlot.style.position = 'relative';

						if (specs.ctaUrl != null) {
							const ctaURLAnchor = document.createElement('a');
							ctaURLAnchor.href = specs.ctaUrl;
							ctaURLAnchor.target = '_new';
							ctaURLAnchor.appendChild(backgroundParent);
							ctaURLAnchor.style.display = 'inline-block';
							ctaURLAnchor.style.width = '100%';
							ctaURLAnchor.style.height = '100%';
							adSlot.insertBefore(
								ctaURLAnchor,
								adSlot.firstChild,
							);
						}

						if (config.get('isDotcomRendering', false)) {
							background.style.position = 'fixed';
							const bottomLine = document.createElement('div');
							bottomLine.classList.add('ad-slot__line');
							bottomLine.style.position = 'absolute';
							bottomLine.style.width = '100%';
							bottomLine.style.bottom = '0';
							bottomLine.style.borderBottom = '1px solid #dcdcdc';
							backgroundParent.appendChild(bottomLine);
						}
					} else {
						adSlot.insertBefore(
							backgroundParent,
							adSlot.firstChild,
						);
					}
				}
			})
			.then(() => ({ backgroundParent, background }));
	};

	const updateStyles = (backgroundParent, background) => {
		backgroundParent.className = backgroundParentClass;
		background.className = `${backgroundClass} creative__background--${specs.scrollType}`;

		if (
			config.get('isDotcomRendering', false) &&
			specs.scrollType === 'parallax'
		)
			background.style.position = 'absolute';

		Object.assign(background.style, specStyles);

		if (specs.scrollType === 'fixed') {
			return fastdom
				.measure(() => {
					if (adSlot instanceof Element) {
						return adSlot.getBoundingClientRect();
					}
				})
				.then((rect) =>
					fastdom.mutate(() => {
						if (config.get('isDotcomRendering', false)) {
							background.style.position = 'fixed';
						}
						if (specStyles.backgroundColor) {
							backgroundParent.style.backgroundColor =
								specStyles.backgroundColor;
						}
						if (rect) {
							background.style.left = `${rect.left}px`;
							background.style.right = `${rect.right}px`;
							background.style.width = `${rect.width}px`;
						}
					}),
				)
				.then(() => ({ backgroundParent, background }));
		}

		return Promise.resolve({ backgroundParent, background });
	};

	const onInterscrollerScroll = (backgroundParent, background) => {
		fastdom.measure(() => {
			const rect = adSlot.getBoundingClientRect();
			background.style.clip = `rect(${rect.top}px,100vw,${rect.bottom}px,0)`;
		});
	};

	const onScroll = (backgroundParent, background) => {
		fastdom.measure(() => {
			// We update the style in a read batch because the DIV
			// has been promoted to its own layer and is also
			// strictly self-contained. Also, without doing that
			// the animation is extremely jittery.
			const rect = background.getBoundingClientRect();
			const backgroundHeight = rect.height;
			const windowHeight = window.innerHeight;

			// we should scroll at a rate such that we don't run out of background (when non-repeating)
			const parallaxBackgroundMovement = Math.floor(
				(rect.bottom / (windowHeight + backgroundHeight)) * 130,
			);

			// #? Flow does not currently list backgroundPositionY in
			// CSSStyleDeclaration: https://github.com/facebook/flow/issues/396
			// ...So we have to use a more convoluted hack-around:
			background.style.backgroundPositionY = `${parallaxBackgroundMovement}%`;
		});
	};

	const onIntersect = (entries) => {
		entries
			.filter((entry) => entry.isIntersecting)
			.forEach((entry) => {
				if (!backgroundAlreadyExists) {
					const backgroundParent = entry.target;
					const background = backgroundParent.firstChild;

					if (background && background instanceof HTMLElement) {
						addEventListener(
							window,
							'scroll',
							() => onScroll(backgroundParent, background),
							{
								passive: true,
							},
						);
						onScroll(backgroundParent, background);
					}
				}
			});
	};

	const observer = new IntersectionObserver(onIntersect, {
		rootMargin: '10px',
	});

	return getBackground()
		.then(({ backgroundParent, background }) =>
			updateStyles(backgroundParent, background),
		)
		.then(({ backgroundParent, background }) => {
			if (specs.scrollType === 'interscroller') {
				renderStickyAdLabel(backgroundParent);
				renderStickyScrollForMoreLabel(backgroundParent);

				addEventListener(
					window,
					'scroll',
					() => onInterscrollerScroll(backgroundParent, background),
					{
						passive: true,
					},
				);
			} else {
				observer.observe(backgroundParent);
			}
		});
};

const init = (register) => {
	register('background', (specs, ret, iframe) => {
		if (iframe && specs) {
			return setBackground(specs, iframe.closest('.js-ad-slot'));
		}
		return Promise.resolve();
	});
};

export const _ = { setBackground, getStylesFromSpec };

export { init };
