import { getViewport } from '../../../../lib/detect-viewport';
import type { Viewport } from '../../../../lib/detect-viewport';
import fastdom from '../../../../lib/fastdom-promise';
import type { RegisterPersistentListener, RespondProxy } from '../messenger';

type IFrameMapValue = {
	node: HTMLIFrameElement;
	respond: RespondProxy;
};

let w: Window = window;
let iframes: Record<string, IFrameMapValue> = {};
let iframeCounter = 0;
let taskQueued = false;

const lastViewportRead = () => fastdom.measure(() => getViewport());

const reset = (window_?: Window): void => {
	w = window_ ?? window;
	taskQueued = false;
	iframes = {};
	iframeCounter = 0;
};

const sendViewportDimensions = (iframeId: string, viewport: Viewport) => {
	iframes[iframeId].respond(null, viewport);
};

/**
 * When the viewport resizes send viewport dimensions
 *
 * to all registered iFrames
 */
const onResize = (): void => {
	if (!taskQueued) {
		taskQueued = true;

		void lastViewportRead().then((viewport) => {
			Object.keys(iframes).forEach((iframeId) => {
				sendViewportDimensions(iframeId, viewport);
			});
			taskQueued = false;
		});
	}
};

const addResizeListener = (
	iframe: HTMLIFrameElement,
	respond: RespondProxy,
): Promise<void> => {
	/**
	 * Initialise resize listener
	 */
	if (iframeCounter === 0) {
		w.addEventListener('resize', onResize);
	}
	/**
	 * Add to the map of all iFrames with their respective
	 * respond functions
	 */
	iframes[iframe.id] = {
		node: iframe,
		respond,
	};
	iframeCounter += 1;
	/**
	 * Send viewport dimensions on first request
	 */
	return lastViewportRead().then((viewport) => {
		sendViewportDimensions(iframe.id, viewport);
	});
};

const removeResizeListener = (iframe: HTMLIFrameElement): void => {
	delete iframes[iframe.id];
	iframeCounter -= 1;

	if (iframeCounter === 0) {
		w.removeEventListener('resize', onResize);
	}
};

const onMessage = (
	respond: RespondProxy,
	start: unknown,
	iframe: HTMLIFrameElement | undefined,
): void => {
	if (!iframe) return;
	if (typeof start !== 'boolean') return;
	if (start) {
		void addResizeListener(iframe, respond);
	} else {
		removeResizeListener(iframe);
	}
};

const init = (register: RegisterPersistentListener): void => {
	register('viewport', onMessage, {
		persist: true,
	});
};

export const _ = { addResizeListener, removeResizeListener, reset, onMessage };

export { init };
