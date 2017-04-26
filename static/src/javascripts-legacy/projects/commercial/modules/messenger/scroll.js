define([
    'lib/events',
    'lib/detect',
    'lib/fastdom-promise',
    'commercial/modules/messenger'
], function (addEventListener, detect, fastdom, messenger) {
    // An intersection observer will allow us to efficiently send slot
    // coordinates for only those that are in the viewport.
    var w = window;
    var useIO = 'IntersectionObserver' in w;
    var taskQueued = false;
    var iframes = {};
    var iframeCounter = 0;
    var observer, visibleIframeIds;

    messenger.register('scroll', onMessage, { persist: true });

    return {
        addScrollListener: addScrollListener,
        removeScrollListener: removeScrollListener,
        reset: reset
    };

    function reset(window_) {
        w = window_ || window;
        useIO = 'IntersectionObserver' in w;
        taskQueued = false;
        iframes = {};
        iframeCounter = 0;
    }

    function onMessage(respond, start, iframe) {
        if (start) {
            addScrollListener(iframe, respond);
        } else {
            removeScrollListener(iframe);
        }
    }

    function addScrollListener(iframe, respond) {
        if (iframeCounter === 0) {
            addEventListener.addEventListener(w, 'scroll', onScroll, { passive: true });
            if (useIO) {
                observer = new w.IntersectionObserver(onIntersect);
            }
        }

        iframes[iframe.id] = {
            node: iframe,
            // When using IOs, a slot is hidden by default. When the IO starts
            // observing it, the onIntercept callback will be triggered if it
            // is already in the viewport
            visible: !useIO,
            respond: respond
        };
        iframeCounter += 1;

        if (useIO) {
            observer.observe(iframe);
        }

        fastdom.read(function() {
            return iframe.getBoundingClientRect();
        })
        .then(function (domRect) {
            sendCoordinates(iframe.id, domRect);
        });
    }

    function removeScrollListener(iframe) {
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
    }

    function onScroll() {
        if (!taskQueued) {
            var viewport = detect.getViewport();
            taskQueued = true;

            return fastdom.read(function () {
                taskQueued = false;

                var iframeIds = Object.keys(iframes);

                if (useIO) {
                    visibleIframeIds
                    .map(getDimensions)
                    .forEach(function (data) {
                        sendCoordinates(data[0], data[1]);
                    });
                } else {
                    iframeIds
                    .map(getDimensions)
                    .filter(isIframeInViewport, viewport)
                    .forEach(function (data) {
                        sendCoordinates(data[0], data[1]);
                    });
                }
            });
        }
    }

    function isIframeInViewport(item) {
        return item[1].bottom > 0 && item[1].top < this.height;
    }

    function getDimensions(id) {
        return [id, iframes[id].node.getBoundingClientRect()];
    }

    function onIntersect(changes) {
        visibleIframeIds = changes
        .filter(function (_) { return _.intersectionRatio > 0; })
        .map(   function (_) { return _.target.id; });
    }

    // Instances of classes bound to the current view are not serialised correctly
    // by JSON.stringify. That's ok, we don't care if it's a DOMRect or some other
    // object, as long as the calling view receives the frame coordinates.
    function domRectToRect(rect) {
        return {
            width:  rect.width,
            height: rect.height,
            top:    rect.top,
            bottom: rect.bottom,
            left:   rect.left,
            right:  rect.right
        };
    }

    function sendCoordinates(iframeId, domRect) {
        iframes[iframeId].respond(null, domRectToRect(domRect));
    }
});
