import bean from 'bean';
import debounce from 'lodash/debounce';
import { noop } from 'lib/noop';


const elementIsInView = (el, offsets_) => {
    const offsets = Object.assign(
        {},
        { left: 0, right: 0, top: 0, bottom: 0 },
        offsets_
    );

    const rect = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const fromTop = rect.top + offsets.top;
    const fromBottom = rect.bottom - offsets.bottom;
    const fromLeft = rect.left - offsets.left;
    const fromRight = rect.right + offsets.right;

    const visibleVertically = fromTop < viewportHeight && fromBottom > 0;
    const visibleHorizontally = fromLeft < viewportWidth && fromRight > 0;

    return visibleVertically && visibleHorizontally;
};

const elementInView = (
    element,
    container,
    offsets
) => {
    let hasBeenSeen = false;

    const events = {
        firstview: noop,
    };

    bean.on(
        container,
        'scroll',
        debounce(() => {
            const inView = elementIsInView(element, offsets);

            if (events.firstview && inView && !hasBeenSeen) {
                hasBeenSeen = true;
                events.firstview(element);
            }
        }, 200)
    );

    return {
        on(event, func) {
            events[event] = func;
        },
    };
};

export { elementInView };
