/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import type { RegisterListener } from '@guardian/commercial-core';
import type { Viewport } from '../../../../lib/detect-viewport';
import { getViewport } from '../../../../lib/detect-viewport';
import { addEventListener } from '../../../../lib/events';
import fastdom from '../../../../lib/fastdom-promise';

type Respond = (...args: unknown[]) => void;

type Iframe = { node: HTMLIFrameElement; visible: boolean; respond: Respond };

// An intersection observer will allow us to efficiently send slot
// coordinates for only those that are in the viewport.
const w = window;
let useIO = 'IntersectionObserver' in w;
let taskQueued = false;
let iframes: Record<string, Iframe> = {};
let iframeCounter = 0;
let observer: IntersectionObserver | null;
let visibleIframeIds: string[] = [];

const reset = (useIO_: boolean): void => {
	useIO = useIO_;
	taskQueued = false;
	iframes = {};
	iframeCounter = 0;
};

// Instances of classes bound to the current view are not serialised correctly
// by JSON.stringify. That's ok, we don't care if it's a DOMRect or some other
// object, as long as the calling view receives the frame coordinates.
const domRectToRect = (rect: DOMRect) => ({
	width: rect.width,
	height: rect.height,
	top: rect.top,
	bottom: rect.bottom,
	left: rect.left,
	right: rect.right,
});

const sendCoordinates = (iframeId: string, domRect: DOMRect) => {
	iframes[iframeId].respond(null, domRectToRect(domRect));
};

const getDimensions = (id: string): [string, DOMRect] => [
	id,
	iframes[id].node.getBoundingClientRect(),
];

const isIframeInViewport = function (
	this: Viewport,
	item: [string, DOMRect],
): boolean {
	return item[1].bottom > 0 && item[1].top < this.height;
};

const onIntersect: IntersectionObserverCallback = (changes) => {
	visibleIframeIds = changes
		.filter((_) => _.intersectionRatio > 0)
		.map((_) => _.target.id);
};

// typescript complains about an async event handler, so wrap it in a non-async function
const onScroll = () => {
	if (!taskQueued) {
		const viewport = getViewport();
		taskQueued = true;

		void fastdom.measure(() => {
			taskQueued = false;

			const iframeIds = Object.keys(iframes);

			if (useIO) {
				visibleIframeIds.map(getDimensions).forEach((data) => {
					sendCoordinates(data[0], data[1]);
				});
			} else {
				iframeIds
					.map(getDimensions)
					.filter(isIframeInViewport, viewport)
					.forEach((data) => {
						sendCoordinates(data[0], data[1]);
					});
			}
		});
	}
};

const addScrollListener = (
	iframe: HTMLIFrameElement,
	respond: Respond,
): void => {
	if (iframeCounter === 0) {
		addEventListener(w, 'scroll', onScroll, {
			passive: true,
		});
		if (useIO) {
			observer = new w.IntersectionObserver(onIntersect);
		}
	}

	iframes[iframe.id] = {
		node: iframe,
		// When using IOs, a slot is hidden by default. When the IO starts
		// observing it, the onIntersect callback will be triggered if it
		// is already in the viewport
		visible: !useIO,
		respond,
	};
	iframeCounter += 1;

	if (observer) {
		observer.observe(iframe);
	}

	void fastdom
		.measure(() => iframe.getBoundingClientRect())
		.then((domRect) => {
			sendCoordinates(iframe.id, domRect);
		});
};

const removeScrollListener = (iframe: HTMLIFrameElement): void => {
	if (iframe.id in iframes) {
		if (useIO && observer) {
			observer.unobserve(iframe);
		}
		delete iframes[iframe.id];
		iframeCounter -= 1;
	}

	if (iframeCounter === 0) {
		w.removeEventListener('scroll', onScroll);
		if (useIO && observer) {
			observer.disconnect();
			observer = null;
		}
	}
};

const isCallable = (x: unknown): x is Respond => typeof x === 'function';

const init = (register: RegisterListener): void => {
	register('scroll', (respond, start, iframe) => {
		if (!iframe) return;
		if (start && isCallable(respond)) {
			addScrollListener(iframe, respond);
		} else {
			removeScrollListener(iframe);
		}
	});
};

export const _ = { addScrollListener, removeScrollListener, reset };

export { init };
