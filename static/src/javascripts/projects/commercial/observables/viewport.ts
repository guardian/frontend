import type { Breakpoint } from '@guardian/source-foundations';
import type { Observable } from 'rxjs';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, last, map } from 'rxjs/operators';
import { noop } from 'lib/noop';
import { getTweakpoint, getViewport } from '../../../lib/detect-viewport';

type Viewport = {
	width: number;
	height: number;
};

getViewport();

/**
 * Time threshold to emit a new event viewport value
 */
const DEBOUNCE_THRESHOLD = 200;
const windowResized: Observable<void> = fromEvent(window, 'resize').pipe(
	debounceTime(DEBOUNCE_THRESHOLD),
	map(noop),
);

export const viewport: Observable<Viewport> = windowResized.pipe(
	map(() => getViewport()),
	distinctUntilChanged(
		(prev, curr) =>
			prev.width === curr.width && prev.height === curr.height,
	),
	last(),
);

export const breakpoint: Observable<Breakpoint> = windowResized.pipe(
	map(() => {
		const { width } = getViewport();
		return getTweakpoint(width);
	}),
	distinctUntilChanged(),
);
