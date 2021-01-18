import { getViewport } from 'lib/detect';
import fastdom from 'lib/fastdom-promise';

let w = window;
let iframes = {};
let iframeCounter = 0;
let taskQueued = false;

const lastViewportRead = () => fastdom.measure(() => getViewport());

const reset = (window_) => {
    w = window_ || window;
    taskQueued = false;
    iframes = {};
    iframeCounter = 0;
};

const sendViewportDimensions = (iframeId, viewport) => {
    if (iframes[iframeId] && iframes[iframeId].respond) {
        iframes[iframeId].respond(null, viewport);
    }
};

const onResize = () => {
    if (!taskQueued) {
        taskQueued = true;

        return lastViewportRead().then(viewport => {
            Object.keys(iframes).forEach(iframeId => {
                sendViewportDimensions(iframeId, viewport);
            });
            taskQueued = false;
        });
    }
};

const addResizeListener = (iframe, respond) => {
    if (iframeCounter === 0) {
        w.addEventListener('resize', onResize);
    }

    iframes[iframe.id] = {
        node: iframe,
        respond,
    };
    iframeCounter += 1;
    return lastViewportRead().then(viewport => {
        sendViewportDimensions(iframe.id, viewport);
    });
};

const removeResizeListener = (iframe) => {
    if (iframes[iframe.id]) {
        iframes[iframe.id] = false;
        iframeCounter -= 1;
    }

    if (iframeCounter === 0) {
        w.removeEventListener('resize', onResize);
    }
};

const onMessage = (respond, start, iframe) => {
    if (!iframe) return;
    if (start) {
        addResizeListener(iframe, respond);
    } else {
        removeResizeListener(iframe);
    }
};
const init = (register) => {
    register('viewport', onMessage, {
        persist: true,
    });
};

export const _ = { addResizeListener, removeResizeListener, reset, onMessage };

export { init };
