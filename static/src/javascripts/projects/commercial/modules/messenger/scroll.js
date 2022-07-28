import { addEventListener } from '../../../../lib/events';
import { getViewport } from '../../../../lib/detect-viewport';
import fastdom from '../../../../lib/fastdom-promise';

// An intersection observer will allow us to efficiently send slot
// coordinates for only those that are in the viewport.
const w = window;
let useIO = 'IntersectionObserver' in w;
let taskQueued = false;
let iframes = {};
let iframeCounter = 0;
let observer;
let visibleIframeIds;

const reset = (useIO_) => {
	useIO = useIO_;
	taskQueued = false;
	iframes = {};
	iframeCounter = 0;
};

// Instances of classes bound to the current view are not serialised correctly
// by JSON.stringify. That's ok, we don't care if it's a DOMRect or some other
// object, as long as the calling view receives the frame coordinates.
const domRectToRect = (rect) => ({
	width: rect.width,
	height: rect.height,
	top: rect.top,
	bottom: rect.bottom,
	left: rect.left,
	right: rect.right,
});

const sendCoordinates = (iframeId, domRect) => {
	iframes[iframeId].respond(null, domRectToRect(domRect));
};

const getDimensions = (id) => [id, iframes[id].node.getBoundingClientRect()];

const isIframeInViewport = function (item) {
	return item[1].bottom > 0 && item[1].top < this.height;
};

const onIntersect = (changes) => {
	visibleIframeIds = changes
		.filter((_) => _.intersectionRatio > 0)
		.map((_) => _.target.id);
};

const onScroll = () => {
	if (!taskQueued) {
		const viewport = getViewport();
		taskQueued = true;

		return fastdom.measure(() => {
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

const addScrollListener = (iframe, respond) => {
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

	if (useIO && observer) {
		observer.observe(iframe);
	}

	fastdom
		.measure(() => iframe.getBoundingClientRect())
		.then((domRect) => {
			sendCoordinates(iframe.id, domRect);
		});
};

const removeScrollListener = (iframe) => {
	if (iframes[iframe.id]) {
		if (useIO && observer) {
			observer.unobserve(iframe);
		}
		iframes[iframe.id] = false;
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

const onMessage = (respond, start, iframe) => {
	if (!iframe) return;
	if (start) {
		addScrollListener(iframe, respond);
	} else {
		removeScrollListener(iframe);
	}
};

const init = (register) => {
	register('scroll', onMessage);
};

export const _ = { addScrollListener, removeScrollListener, reset, onMessage };

export { init };
