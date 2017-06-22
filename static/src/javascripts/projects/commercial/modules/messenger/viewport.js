// @flow
import detect from 'lib/detect';
import fastdom from 'lib/fastdom-promise';
import { register } from 'commercial/modules/messenger';

let w = window;
let iframes = {};
let iframeCounter = 0;
let taskQueued = false;

const lastViewportRead = () => fastdom.read(() => detect.getViewport());

const reset = (window_: WindowProxy): void => {
    w = window_ || window;
    taskQueued = false;
    iframes = {};
    iframeCounter = 0;
};

const sendViewportDimensions = (iframeId, viewport): void => {
    iframes[iframeId].respond(null, viewport);
};

const onResize = (): ?Promise<any> => {
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

const addResizeListener = (iframe: Element, respond: any): Promise<any> => {
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

const removeResizeListener = (iframe: Element): void => {
    if (iframes[iframe.id]) {
        iframes[iframe.id] = false;
        iframeCounter -= 1;
    }

    if (iframeCounter === 0) {
        w.removeEventListener('resize', onResize);
    }
};

const onMessage = (respond: any, start, iframe: ?Element): void => {
    if (!iframe) return;
    if (start) {
        addResizeListener(iframe, respond);
    } else {
        removeResizeListener(iframe);
    }
};

register('viewport', onMessage, {
    persist: true,
});

export { addResizeListener, removeResizeListener, reset };
