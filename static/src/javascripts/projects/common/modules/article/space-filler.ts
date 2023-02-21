import type {
	SpacefinderOptions,
	SpacefinderRules,
	SpacefinderWriter,
} from 'common/modules/spacefinder';
import { findSpace, SpaceError } from 'common/modules/spacefinder';
import raven from 'lib/raven';

const fireSpacefillerCompleteEvent = (
	options: SpacefinderOptions | undefined,
): void => {
	if (options?.debug) {
		const event = new CustomEvent('spacefiller-complete');
		document.dispatchEvent(event);
	}
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
		options?: SpacefinderOptions,
	): Promise<boolean> {
		const insertNextContent = () =>
			findSpace(rules, options)
				.then((paragraphs: HTMLElement[]) => writer(paragraphs))
				.then(() => {
					fireSpacefillerCompleteEvent(options);
				})
				.then(() => {
					return true;
				})
				.catch((ex) => {
					if (ex instanceof SpaceError) {
						fireSpacefillerCompleteEvent(options);
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

export { spaceFiller };
