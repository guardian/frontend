define(
    ['lib/detect', 'lib/fastdom-promise', 'commercial/modules/messenger'],
    function(detect, fastdom, messenger) {
        var w = window;
        var iframes = {};
        var iframeCounter = 0;
        var taskQueued = false;
        var lastViewportRead, lastViewport;

        messenger.register('viewport', onMessage, { persist: true });
        lastViewportRead = fastdom.read(function() {
            lastViewport = detect.getViewport();
        });

        return {
            addResizeListener: addResizeListener,
            removeResizeListener: removeResizeListener,
            reset: reset,
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
                respond: respond,
            };
            iframeCounter += 1;
            return lastViewportRead.then(function() {
                sendViewportDimensions.bind(lastViewport)(iframe.id);
            });
        }

        function removeResizeListener(iframe) {
            if (iframes[iframe.id]) {
                iframes[iframe.id] = false;
                iframeCounter -= 1;
            }

            if (iframeCounter === 0) {
                w.removeEventListener('resize', onResize);
            }
        }

        function onResize() {
            if (!taskQueued) {
                taskQueued = true;

                return fastdom
                    .read(function() {
                        return (lastViewport = detect.getViewport());
                    })
                    .then(function(viewport) {
                        Object.keys(iframes).forEach(
                            sendViewportDimensions,
                            viewport
                        );
                        taskQueued = false;
                    });
            }
        }

        function sendViewportDimensions(iframeId) {
            iframes[iframeId].respond(null, this);
        }
    }
);
