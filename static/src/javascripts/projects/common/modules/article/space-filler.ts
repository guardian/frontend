import { findSpace, SpaceError } from 'common/modules/spacefinder';
import raven from 'lib/raven';

// TODO Move these types to spacefinder once it has been converted to typescript.
type RuleSpacing = {
	minAbove: number;
	minBelow: number;
};

type SpacefinderItem = {
	top: number;
	bottom: number;
	element: HTMLElement;
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
	selectors: Record<string, RuleSpacing>;
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

class SpaceFiller {
	queue = Promise.resolve(true);

	/**
	 * A safer way of using spacefinder.
	 * Given a set of spacefinder rules, applies a writer to the first matching paragraph.
	 * Uses fastdom to avoid layout-thrashing, but queues up asynchronous writes to avoid race conditions. We don't
	 * seek a slot for a new component until all the other component writes have finished.
	 */
	fillSpace(
		rules: SpacefinderRules,
		writer: SpacefinderWriter,
		options: SpacefinderOptions,
	): Promise<boolean> {
		const insertNextContent = () =>
			findSpace(rules, options)
				.then((paragraphs: HTMLElement[]) => writer(paragraphs))
				.then(() => {
					return true;
				})
				.catch((ex) => {
					if (ex instanceof SpaceError) {
						return false;
					}
					throw ex;
				});

		this.queue = this.queue.then(insertNextContent).catch((e) => {
			// e.g. if writer fails
			raven.captureException(e);
			return false;
		});

		return this.queue;
	}
}

const spaceFiller = new SpaceFiller();

export { spaceFiller, SpacefinderItem, SpacefinderRules, SpacefinderWriter };
