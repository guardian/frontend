define([
    'common/utils/detect',
    'common/utils/fastdom-promise',
    'commercial/modules/messenger'
], function (detect, fastdom, messenger) {
    var w = window;
    var iframes = {};
    var iframeCounter = 0;
    var observer, visibleIframeIds;

    messenger.register('viewport', onMessage, { persist: true });

    return {
        addResizeListener: addResizeListener,
        removeResizeListener: removeResizeListener,
        reset: reset
    };

    function reset(window_) {
        w = window_ || window;
        taskQueued = false;
        iframes = {};
        iframeCounter = 0;
    }

    function onMessage(respond, start, iframe) {
        if (start) {
            addResizeListener(iframe, respond);
        } else {
            removeResizeListener(iframe);
        }
    }

    function addResizeListener(iframe, respond) {
        if (iframeCounter === 0) {
            w.addEventListener('resize', onResize);
        }

        iframes[iframe.id] = {
            node: iframe,
            respond: respond
        };
        iframeCounter += 1;
    }

    function removeResizeListener(iframe) {
        if (iframes[iframe.id]) {
            iframes[iframe.id] = false;
            iframeCounter -= 1;
        }

        if (iframeCounter === 0) {
            w.removeEventListener('resize', onRe);
        }
    }

    function onResize() {
        if (!taskQueued) {
            taskQueued = true;

            return fastdom.read(function () {
                var viewport = detect.getViewport();
                // perf hack: iteration methods accept a context object ("thisArg")
                // freeing us from declaring sendViewportDimensions inside the
                // current closure
                Object.keys(iframes).forEach(sendViewportDimensions, viewport);
            });
        }
    }

    function sendViewportDimensions(iframeId) {
        iframes[iframeId].respond(null, this);
    }
});
