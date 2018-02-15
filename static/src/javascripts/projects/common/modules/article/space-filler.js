// @flow
import raven from 'lib/raven';
import fastdom from 'lib/fastdom-promise';
import { findSpace, SpaceError } from 'common/modules/spacefinder';

const onError = (e: Error): boolean => {
    // e.g. if writer fails
    raven.captureException(e);
    return false;
};

class SpaceFiller {
    queue: Promise<any>;

    constructor() {
        this.queue = Promise.resolve();
    }

    /**
     * A safer way of using spacefinder.
     * Given a set of spacefinder rules, applies a writer to the first matching paragraph.
     * Uses fastdom to avoid layout-thrashing, but queues up asynchronous writes to avoid race conditions. We don't
     * seek a slot for a new component until all the other component writes have finished.
     */
    fillSpace(
        rules: Object,
        writer: (HTMLElement[]) => any,
        options: ?Object
    ): Promise<any> {
        const onSpacesFound = (paragraphs: HTMLElement[]): Promise<any> =>
            fastdom.write(() => writer(paragraphs));

        const onNoSpacesFound = (ex: Error): boolean => {
            if (ex instanceof SpaceError) {
                return false;
            }
            throw ex;
        };

        const insertNextContent = () =>
            findSpace(rules, options).then(onSpacesFound, onNoSpacesFound);

        this.queue = this.queue.then(insertNextContent).catch(onError);

        return this.queue;
    }
}

const spaceFiller = new SpaceFiller();

export { spaceFiller };
