// @flow
import {
    observe as observeIO,
    unobserve as unobserveIO,
} from './impl/viewport-io';
import {
    observe as observeScroll,
    unobserve as unobserveScroll,
} from './impl/viewport-scroll';

const viewport: ViewportService =
    'IntersectionObserver' in window
        ? { observe: observeIO, unobserve: unobserveIO }
        : { observe: observeScroll, unobserve: unobserveScroll };

export { viewport };
