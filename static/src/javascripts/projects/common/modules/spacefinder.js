// total_hours_spent_maintaining_this = 80

import fastdom from '../../../lib/fastdom-promise';
import { mediator } from '../../../lib/mediator';
import { memoize } from 'lodash-es';

import { onImagesLoadedFixed } from './on-images-loaded-fixed.js';
import { onImagesLoadedBroken } from './on-images-loaded-broken.js';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { spacefinderOkr2ImagesLoaded } from 'common/modules/experiments/tests/spacefinder-okr-2-images-loaded.ts';

const query = (selector, context) => [
	...(context ?? document).querySelectorAll(selector),
];

// maximum time (in ms) to wait for images to be loaded and rich links
// to be upgraded
const LOADING_TIMEOUT = 5000;

const defaultOptions = {
	waitForImages: true,
	waitForLinks: true,
	waitForInteractives: false,
};

const isIframe = (node) => node instanceof HTMLIFrameElement;

const isIframeLoaded = (iframe) => {
	try {
		return (
			iframe.contentWindow &&
			iframe.contentWindow.document &&
			iframe.contentWindow.document.readyState === 'complete'
		);
	} catch (err) {
		return true;
	}
};

const expire = (resolve) => {
	window.setTimeout(resolve, LOADING_TIMEOUT);
};

const getFuncId = (rules) => rules.bodySelector || 'document';

const onImagesLoaded = isInVariantSynchronous(
	spacefinderOkr2ImagesLoaded,
	'variant',
)
	? onImagesLoadedFixed
	: onImagesLoadedBroken;

const onRichLinksUpgraded = memoize(
	(rules) =>
		query('.element-rich-link--not-upgraded', rules.body).length === 0
			? Promise.resolve()
			: new Promise((resolve) => {
					mediator.once('rich-link:loaded', resolve);
			  }),
	getFuncId,
);

const onInteractivesLoaded = memoize((rules) => {
	const notLoaded = query('.element-interactive', rules.body).filter(
		(interactive) => {
			const iframe = Array.from(interactive.children).filter(isIframe);
			return !(iframe.length && isIframeLoaded(iframe[0]));
		},
	);

	return notLoaded.length === 0 || !('MutationObserver' in window)
		? Promise.resolve()
		: Promise.all(
				notLoaded.map(
					(interactive) =>
						new Promise((resolve) => {
							new MutationObserver((records, instance) => {
								if (
									!records.length ||
									!records[0].addedNodes.length ||
									!isIframe(records[0].addedNodes[0])
								) {
									return;
								}

								const iframe = records[0].addedNodes[0];
								if (isIframeLoaded(iframe)) {
									instance.disconnect();
									resolve();
								} else {
									iframe.addEventListener('load', () => {
										instance.disconnect();
										resolve();
									});
								}
							}).observe(interactive, {
								childList: true,
							});
						}),
				),
		  ).then(() => undefined);
}, getFuncId);

const filter = (list, filterElement) => {
	const filtered = [];
	const exclusions = [];
	list.forEach((element) => {
		if (filterElement(element, filtered[filtered.length - 1])) {
			filtered.push(element);
		} else {
			exclusions.push(element);
		}
	});
	return { filtered, exclusions };
};

// test one element vs another for the given rules
const testCandidate = (rule, challenger, opponent) => {
	const isMinAbove = challenger.top - opponent.bottom >= rule.minAbove;
	const isMinBelow = opponent.top - challenger.top >= rule.minBelow;

	return isMinAbove || isMinBelow;
};

// test one element vs an array of other elements for the given rules
const testCandidates = (rules, challenger, opponents) =>
	opponents.every(testCandidate.bind(undefined, rules, challenger));

const enforceRules = (measurements, rules, exclusions) => {
	let candidates = measurements.candidates;
	let result;

	// enforce absoluteMinAbove rule
	result = filter(
		candidates,
		(candidate) =>
			!rules.absoluteMinAbove ||
			candidate.top + measurements.bodyTop >= rules.absoluteMinAbove,
	);
	exclusions.absoluteMinAbove = result.exclusions;
	candidates = result.filtered;

	// enforce minAbove and minBelow rules
	result = filter(candidates, (candidate) => {
		const farEnoughFromTopOfBody = candidate.top >= rules.minAbove;
		const farEnoughFromBottomOfBody =
			candidate.top + rules.minBelow <= measurements.bodyHeight;
		return farEnoughFromTopOfBody && farEnoughFromBottomOfBody;
	});
	exclusions.aboveAndBelow = result.exclusions;
	candidates = result.filtered;

	// enforce content meta rule
	if (rules.clearContentMeta) {
		result = filter(
			candidates,
			(c) =>
				!!measurements.contentMeta &&
				c.top >
					measurements.contentMeta.bottom + rules.clearContentMeta,
		);
		exclusions.contentMeta = result.exclusions;
		candidates = result.filtered;
	}

	// enforce selector rules
	if (rules.selectors) {
		Object.keys(rules.selectors).forEach((selector) => {
			result = filter(candidates, (candidate) =>
				testCandidates(
					rules.selectors[selector],
					candidate,
					measurements.opponents
						? measurements.opponents[selector]
						: [],
				),
			);
			exclusions[selector] = result.exclusions;
			candidates = result.filtered;
		});
	}

	if (rules.filter) {
		result = filter(candidates, rules.filter);
		exclusions.custom = result.exclusions;
		candidates = result.filtered;
	}

	return candidates;
};

class SpaceError extends Error {
	constructor(rules) {
		super();
		this.name = 'SpaceError';
		this.message = `There is no space left matching rules from ${rules.bodySelector}`;
	}
}

const getReady = (rules, options) =>
	Promise.race([
		new Promise(expire),
		Promise.all([
			options.waitForImages ? onImagesLoaded(rules) : true,
			options.waitForLinks ? onRichLinksUpgraded(rules) : true,
			options.waitForInteractives ? onInteractivesLoaded(rules) : true,
		]),
	]).then(() => rules);

const getCandidates = (rules, exclusions) => {
	let candidates = query(rules.bodySelector + rules.slotSelector);
	let result;
	if (rules.fromBottom) {
		candidates.reverse();
	}
	if (rules.startAt) {
		let drop = true;
		result = filter(candidates, (candidate) => {
			if (candidate === rules.startAt) {
				drop = false;
			}
			return !drop;
		});
		exclusions.startAt = result.exclusions;
		candidates = result.filtered;
	}
	if (rules.stopAt) {
		let keep = true;
		result = filter(candidates, (candidate) => {
			if (candidate === rules.stopAt) {
				keep = false;
			}
			return keep;
		});
		exclusions.stopAt = result.exclusions;
		candidates = result.filtered;
	}
	return candidates;
};

const getDimensions = (el) =>
	Object.freeze({
		top: el.offsetTop,
		bottom: el.offsetTop + el.offsetHeight,
		element: el,
	});

const getMeasurements = (rules, candidates) => {
	const contentMeta = rules.clearContentMeta
		? document.querySelector('.js-content-meta')
		: null;
	const opponents = rules.selectors
		? Object.keys(rules.selectors).map((selector) => [
				selector,
				query(rules.bodySelector + selector),
		  ])
		: null;

	return fastdom.measure(() => {
		const bodyDims =
			rules.body instanceof Element && rules.body.getBoundingClientRect();
		const candidatesWithDims = candidates.map(getDimensions);
		const contentMetaWithDims =
			rules.clearContentMeta && contentMeta
				? getDimensions(contentMeta)
				: null;
		const opponentsWithDims = opponents
			? opponents.reduce((result, selectorAndElements) => {
					result[selectorAndElements[0]] =
						selectorAndElements[1].map(getDimensions);
					return result;
			  }, {})
			: null;

		return {
			bodyTop: bodyDims.top || 0,
			bodyHeight: bodyDims.height || 0,
			candidates: candidatesWithDims,
			contentMeta: contentMetaWithDims,
			opponents: opponentsWithDims,
		};
	});
};

const returnCandidates = (rules, candidates) => {
	if (!candidates.length) {
		throw new SpaceError(rules);
	}
	return candidates.map((candidate) => candidate.element);
};

// Rather than calling this directly, use spaceFiller to inject content into the page.
// SpaceFiller will safely queue up all the various asynchronous DOM actions to avoid any race conditions.
const findSpace = (rules, options, excluded) => {
	rules.body =
		(rules.bodySelector && document.querySelector(rules.bodySelector)) ||
		document;

	const exclusions = excluded || {};

	return getReady(rules, options || defaultOptions)
		.then(() => getCandidates(rules, exclusions))
		.then((candidates) => getMeasurements(rules, candidates))
		.then((measurements) => enforceRules(measurements, rules, exclusions))
		.then((winners) => returnCandidates(rules, winners));
};

export const _ = {
	testCandidate, // exposed for unit testing
	testCandidates, // exposed for unit testing
};

export { findSpace, SpaceError };
