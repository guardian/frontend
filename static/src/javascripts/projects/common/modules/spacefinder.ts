// total_hours_spent_maintaining_this = 81.5

import { memoize } from 'lodash-es';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { spacefinderOkrMegaTest } from 'common/modules/experiments/tests/spacefinder-okr-mega-test';
import { noop } from 'lib/noop';
import fastdom from '../../../lib/fastdom-promise';
import { mediator } from '../../../lib/mediator';
import { markCandidates } from './mark-candidates';
import { onImagesLoadedBroken } from './on-images-loaded-broken.js';
import { onImagesLoadedFixed } from './on-images-loaded-fixed.js';

type RuleSpacing = {
	minAbove: number;
	minBelow: number;
};

type SpacefinderItem = {
	top: number;
	bottom: number;
	element: HTMLElement;
	meta?: {
		tooClose: unknown[];
	};
};

type SpacefinderRules = {
	bodySelector: string;
	body?: Node;
	slotSelector: string;
	// minimum from slot to top of page
	absoluteMinAbove?: number;
	// minimum from para to top of article
	minAbove: number;
	// minimum from (top of) para to bottom of article
	minBelow: number;
	// vertical px to clear the content meta element (byline etc) by. 0 to ignore
	// used for carrot ads
	clearContentMeta?: number;
	// custom rules using selectors.
	selectors?: Record<string, RuleSpacing>;
	// will run each slot through this fn to check if it must be counted in
	filter?: (x: SpacefinderItem, lastWinner?: SpacefinderItem) => boolean;
	// will remove slots before this one
	startAt?: HTMLElement;
	// will remove slots from this one on
	stopAt?: HTMLElement;
	// will reverse the order of slots (this is useful for lazy loaded content)
	fromBottom?: boolean;
};

type SpacefinderWriter = (paras: HTMLElement[]) => Promise<void>;

type SpacefinderOptions = {
	waitForLinks?: boolean;
	waitForImages?: boolean;
	waitForInteractives?: boolean;
	debug?: boolean;
};

type ExcludedItem = SpacefinderItem | HTMLElement;

type SpacefinderExclusions = Record<string, ExcludedItem[]>;

type ElementDimensionMap = Record<string, SpacefinderItem[]>;

type Measurements = {
	bodyTop: number;
	bodyHeight: number;
	candidates: SpacefinderItem[];
	contentMeta?: SpacefinderItem;
	opponents?: ElementDimensionMap;
};

const query = (selector: string, context?: HTMLElement) => [
	...(context ?? document).querySelectorAll<HTMLElement>(selector),
];

// maximum time (in ms) to wait for images to be loaded and rich links
// to be upgraded
const LOADING_TIMEOUT = 5000;

const defaultOptions = {
	waitForImages: true,
	waitForLinks: true,
	waitForInteractives: false,
	debug: false,
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

const getFuncId = (rules) => rules.bodySelector || 'document';

const enableImageLoadingFix = () =>
	!isInVariantSynchronous(spacefinderOkrMegaTest, 'control');

const onImagesLoaded = enableImageLoadingFix()
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

//  should generic be more specific? HTMLElement or SpacefinderItem
const partitionCandidates = <T>(
	list: T[],
	filterElement: (element: T, lastFilteredElement: T) => boolean,
) => {
	const filtered: T[] = [];
	const exclusions: T[] = [];
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
const testCandidate = (
	rule: RuleSpacing,
	candidate: SpacefinderItem,
	opponent: SpacefinderItem,
): boolean => {
	const isMinAbove = candidate.top - opponent.bottom >= rule.minAbove;
	const isMinBelow = opponent.top - candidate.top >= rule.minBelow;

	const pass = isMinAbove || isMinBelow;

	if (!pass) {
		// if the test fails, add debug information to the candidate metadata
		const isBelow = candidate.top < opponent.top;
		const required = isBelow ? rule.minBelow : rule.minAbove;
		const actual = isBelow
			? opponent.top - candidate.top
			: candidate.top - opponent.bottom;

		candidate.meta?.tooClose.push({
			required,
			actual,
			element: opponent.element,
		});
	}

	return pass;
};

// test one element vs an array of other elements for the given rule
const testCandidates = (
	rule: RuleSpacing,
	candidate: SpacefinderItem,
	opponents: SpacefinderItem[],
): boolean =>
	opponents
		.map((opponent) => testCandidate(rule, candidate, opponent))
		.every(Boolean);

const enforceRules = (
	measurements: Measurements,
	rules: SpacefinderRules,
	exclusions: SpacefinderExclusions,
) => {
	let candidates = measurements.candidates;
	let result;

	// enforce absoluteMinAbove rule
	result = partitionCandidates(
		candidates,
		(candidate) =>
			!rules.absoluteMinAbove ||
			candidate.top + measurements.bodyTop >= rules.absoluteMinAbove,
	);
	exclusions.absoluteMinAbove = result.exclusions;
	candidates = result.filtered;

	// enforce minAbove and minBelow rules
	result = partitionCandidates(candidates, (candidate) => {
		const farEnoughFromTopOfBody = candidate.top >= rules.minAbove;
		const farEnoughFromBottomOfBody =
			candidate.top + rules.minBelow <= measurements.bodyHeight;
		return farEnoughFromTopOfBody && farEnoughFromBottomOfBody;
	});
	exclusions.aboveAndBelow = result.exclusions;
	candidates = result.filtered;

	// enforce content meta rule
	if (rules.clearContentMeta !== undefined) {
		result = partitionCandidates(
			candidates,
			(candidate) =>
				!!measurements.contentMeta &&
				candidate.top >
					measurements.contentMeta.bottom +
						(rules.clearContentMeta ?? 0), // why do we need to do this despite the type guard?
		);
		exclusions.contentMeta = result.exclusions;
		candidates = result.filtered;
	}

	// enforce selector rules
	if (rules.selectors) {
		const selectorExclusions: SpacefinderItem[] = [];
		for (const [selector, rule] of Object.entries(rules.selectors)) {
			result = partitionCandidates(candidates, (candidate) =>
				testCandidates(
					rule,
					candidate,
					measurements.opponents
						? measurements.opponents[selector]
						: [],
				),
			);
			exclusions[selector] = result.exclusions;
			selectorExclusions.push(...result.exclusions);
		}

		candidates = candidates.filter(
			(candidate) => !selectorExclusions.includes(candidate),
		);
	}

	if (rules.filter) {
		result = partitionCandidates(candidates, rules.filter);
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
/**
 * Wait for the page to be ready (images loaded, rich links upgraded, interactives loaded)
 * or for LOADING_TIMEOUT to elapse, whichever comes first.
 * @param  {SpacefinderRules} rules
 * @param  {SpacefinderOptions} options
 */
const getReady = (rules: SpacefinderRules, options: SpacefinderOptions) =>
	Promise.race([
		new Promise(() => {
			window.setTimeout(noop, LOADING_TIMEOUT);
		}),
		Promise.all([
			options.waitForImages ? onImagesLoaded(rules) : true,
			options.waitForLinks ? onRichLinksUpgraded(rules) : true,
			options.waitForInteractives ? onInteractivesLoaded(rules) : true,
		]),
	]);

const getCandidates = (
	rules: SpacefinderRules,
	exclusions: SpacefinderExclusions,
) => {
	let candidates = query(rules.bodySelector + rules.slotSelector);
	let result:
		| {
				filtered: HTMLElement[];
				exclusions: HTMLElement[];
		  }
		| undefined;
	if (rules.fromBottom) {
		candidates.reverse();
	}
	if (rules.startAt) {
		let drop = true;
		result = partitionCandidates(candidates, (candidate) => {
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
		result = partitionCandidates(candidates, (candidate) => {
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

const getDimensions = (element: HTMLElement): Readonly<SpacefinderItem> =>
	Object.freeze({
		top: element.offsetTop,
		bottom: element.offsetTop + element.offsetHeight,
		element,
		meta: {
			tooClose: [],
		},
	});

const getMeasurements = (
	rules: SpacefinderRules,
	candidates: HTMLElement[],
): Promise<Measurements> => {
	const contentMeta = rules.clearContentMeta
		? document.querySelector<HTMLElement>('.js-content-meta') ?? undefined
		: undefined;
	const opponents = rules.selectors
		? Object.keys(rules.selectors).map(
				(selector) =>
					[selector, query(rules.bodySelector + selector)] as const,
		  )
		: [];

	return fastdom.measure((): Measurements => {
		const bodyDims =
			rules.body instanceof Element
				? rules.body.getBoundingClientRect()
				: undefined;
		const candidatesWithDims = candidates.map(getDimensions);
		const contentMetaWithDims =
			rules.clearContentMeta && contentMeta
				? getDimensions(contentMeta)
				: undefined;
		const opponentsWithDims = opponents.reduce<
			Record<string, SpacefinderItem[]>
		>((result, [selector, selectedElements]) => {
			const x = selectedElements.map(getDimensions);
			result[selector] = x;
			return result;
		}, {});
		return {
			bodyTop: bodyDims?.top ?? 0,
			bodyHeight: bodyDims?.height ?? 0,
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
const findSpace = (
	rules: SpacefinderRules,
	options: SpacefinderOptions = defaultOptions,
	exclusions: SpacefinderExclusions = {},
): HTMLElement[] => {
	rules.body =
		(rules.bodySelector && document.querySelector(rules.bodySelector)) ||
		document;

	return getReady(rules, options)
		.then(() => getCandidates(rules, exclusions))
		.then((candidates) => getMeasurements(rules, candidates))
		.then((measurements) => enforceRules(measurements, rules, exclusions))
		.then((winners) => markCandidates(exclusions, winners, options))
		.then((winners) => returnCandidates(rules, winners));
};

export const _ = {
	testCandidate, // exposed for unit testing
	testCandidates, // exposed for unit testing
};

export {
	findSpace,
	SpaceError,
	SpacefinderRules,
	SpacefinderWriter,
	SpacefinderOptions,
};
