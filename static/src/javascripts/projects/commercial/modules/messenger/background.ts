import fastdom from '../../../../lib/fastdom-promise';
import {
	renderStickyAdLabel,
	renderStickyScrollForMoreLabel,
} from '../dfp/render-advert-label';
import type { RegisterListener } from '../messenger';

const isDCR = window.guardian.config.isDotcomRendering;

const getStylesFromSpec = (
	specs: BackgroundSpecs,
): Omit<BackgroundSpecs, 'scrollType' | 'backgroundColour'> => {
	const styles = { ...specs };
	delete styles.scrollType;

	if (styles.backgroundColour) {
		styles.backgroundColor = styles.backgroundColour;
		delete styles.backgroundColour;
	}
	return styles;
};

interface BackgroundSpecs {
	backgroundImage: string;
	backgroundRepeat: string;
	backgroundPosition: string;
	backgroundColour?: string;
	backgroundColor?: string;
	scrollType?: string;
	ctaUrl?: string;
}

const isBackgroundSpecs = (specs: unknown): specs is BackgroundSpecs =>
	typeof specs === 'object' &&
	!!specs &&
	[
		'backgroundImage',
		'backgroundRepeat',
		'backgroundPosition',
		'scrollType',
	].every((key) => key in specs);

const maybeInsertParent = (specs: BackgroundSpecs, adSlot: HTMLElement) => {
	const backgroundParentClass = 'creative__background-parent';
	const backgroundClass = 'creative__background';

	const maybeBackgroundParent = adSlot.querySelector<HTMLDivElement>(
		`.${backgroundParentClass}`,
	);

	const maybeBackground = maybeBackgroundParent
		? maybeBackgroundParent.querySelector<HTMLDivElement>(
				`.${backgroundClass}`,
		  )
		: null;

	const backgroundAlreadyExists = !!(
		maybeBackgroundParent && maybeBackground
	);
	if (backgroundAlreadyExists) {
		return {
			backgroundParent: maybeBackgroundParent,
			background: maybeBackground,
		};
	}
	const backgroundParent = document.createElement('div');
	const background = document.createElement('div');

	backgroundParent.classList.add(backgroundParentClass);
	background.classList.add(backgroundClass);

	if (specs.scrollType) {
		backgroundParent.classList.add(
			`${backgroundParentClass}--${specs.scrollType}`,
		);
		background.classList.add(`${backgroundClass}--${specs.scrollType}`);
	}

	backgroundParent.appendChild(background);

	if (isDCR) {
		backgroundParent.style.zIndex = '-1';
		backgroundParent.style.position = 'absolute';
		backgroundParent.style.inset = '0';
		backgroundParent.style.clip = 'rect(0, auto, auto, 0)';

		background.style.inset = '0';
		background.style.transition = 'background 100ms ease';
	}

	return { backgroundParent, background };
};

const setBackgroundStyles = async (
	specs: BackgroundSpecs,
	background: HTMLElement,
): Promise<void> => {
	const specStyles = getStylesFromSpec(specs);

	await fastdom.mutate(() => {
		Object.assign(background.style, specStyles);
	});
};

const setCtaURL = (
	ctaURL: string,
	backgroundParent: HTMLElement,
): HTMLElement => {
	const ctaURLAnchor = document.createElement('a');
	ctaURLAnchor.href = ctaURL;
	ctaURLAnchor.target = '_new';
	ctaURLAnchor.appendChild(backgroundParent);
	ctaURLAnchor.style.width = '100%';
	ctaURLAnchor.style.height = '100%';
	return ctaURLAnchor;
};

const renderBottomLine = (
	background: HTMLElement,
	backgroundParent: HTMLElement,
): Promise<void> =>
	fastdom.mutate(() => {
		background.style.position = 'fixed';
		const bottomLine = document.createElement('div');
		bottomLine.classList.add('ad-slot__line');
		bottomLine.style.position = 'absolute';
		bottomLine.style.width = '100%';
		bottomLine.style.bottom = '0';
		bottomLine.style.borderBottom = '1px solid #dcdcdc';
		backgroundParent.appendChild(bottomLine);
	});

const setupParallax = (
	adSlot: HTMLElement,
	background: HTMLElement,
	backgroundParent: HTMLElement,
) => {
	background.style.position = 'absolute';
	adSlot.style.position = 'relative';

	const onScroll = (background: HTMLElement) =>
		fastdom
			.measure(() => background.getBoundingClientRect())
			.then((rect) =>
				fastdom.mutate(() => {
					const backgroundHeight = rect.height;
					const windowHeight = window.innerHeight;

					// we should scroll at a rate such that we don't run out of background (when non-repeating)
					const parallaxBackgroundMovement = Math.floor(
						(rect.bottom / (windowHeight + backgroundHeight)) * 130,
					);

					background.style.backgroundPositionY = `${parallaxBackgroundMovement}%`;
				}),
			);

	const onIntersect: IntersectionObserverCallback = (entries) =>
		entries
			.filter((entry) => entry.isIntersecting)
			.forEach(() => {
				window.addEventListener(
					'scroll',
					() => void onScroll(background),
					{
						passive: true,
					},
				);
				void onScroll(background);
			});

	const observer = new IntersectionObserver(onIntersect, {
		rootMargin: '10px',
	});

	observer.observe(backgroundParent);
};

const setupBackground = async (
	specs: BackgroundSpecs,
	adSlot: HTMLElement,
): Promise<void> => {
	const { backgroundParent, background } = maybeInsertParent(specs, adSlot);
	await setBackgroundStyles(specs, background);

	if (specs.scrollType === 'parallax') {
		setupParallax(adSlot, background, backgroundParent);
	}

	// fixed background is very similar to interscroller, generally with a smaller height
	if (specs.scrollType === 'fixed') {
		adSlot.style.position = 'relative';
		if (isDCR) {
			background.style.position = 'fixed';
		}

		if (specs.backgroundColor) {
			backgroundParent.style.backgroundColor = specs.backgroundColor;
		}
	}

	if (specs.scrollType === 'interscroller') {
		if (isDCR) {
			adSlot.style.height = '85vh';
			adSlot.style.marginBottom = '12px';
			adSlot.style.position = 'relative';
		}

		void renderStickyAdLabel(adSlot);
		void renderStickyScrollForMoreLabel(backgroundParent);

		isDCR && void renderBottomLine(background, backgroundParent);

		if (specs.ctaUrl) {
			const anchor = setCtaURL(specs.ctaUrl, backgroundParent);
			await fastdom.mutate(() =>
				adSlot.insertBefore(anchor, adSlot.firstChild),
			);
		}
	} else {
		await fastdom.mutate(() =>
			adSlot.insertBefore(backgroundParent, adSlot.firstChild),
		);
	}
};

const init = (register: RegisterListener): void => {
	register('background', async (specs, ret, iframe): Promise<void> => {
		if (!isBackgroundSpecs(specs)) {
			return Promise.resolve();
		}
		const adSlot = iframe?.closest<HTMLElement>('.js-ad-slot');
		if (adSlot) {
			return setupBackground(specs, adSlot);
		}
	});
};

export const _ = {
	setupBackground,
	getStylesFromSpec,
};

export { init };
