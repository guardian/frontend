define([
    'common/utils/closest',
    'common/utils/detect',
    'common/utils/fastdom-promise',
    'commercial/modules/messenger'
], function (closest, detect, fastdom, messenger) {
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
            addScrollListener(iframe.id, closest(iframe, '.js-ad-slot'), respond);
        } else {
            removeScrollListener(iframe.id);
        }
    }

    return {
        addScrollListener: addScrollListener,
        removeScrollListener: removeScrollListener
    };

    function addScrollListener(id, slot, respond) {
        if (listenerCounter === 0) {
            window.addEventListener('scroll', onScroll);
            if (useIO) {
                observer = new window.IntersectionObserver(onIntersect);
            }
        }

        listeners[id] = {
            slot: slot,
            // When using IOs, a slot is hidden by default. When the IO starts
            // observing it, the onIntercept callback will be triggered if it
            // is already in the viewport
            visible: !useIO,
            respond: respond
        };
        listenerCounter += 1;

        if (useIO) {
            slots[slot.id] = {
                slot: slot,
                iframeId: id
            };
            observer.observe(slot);
        }
    }

    function removeScrollListener(id) {
        if (listeners[id]) {
            if (useIO && observer) {
                observer.unobserve(listeners[id].slot);
                slots[listeners[id].slot.id] = false;
            }
            listeners[id] = false;
            listenerCounter -= 1;
        }

        if (listenerCounter === 0) {
            window.removeEventListener('scroll', onScroll);
            if (useIO && observer) {
                observer.disconnect();
                observer = null;
            }
        }
    }

    function onScroll() {
        if (!taskQueued) {
            taskQueued = true;
            fastdom.read(function () {
                taskQueued = false;

                var viewport = detect.getViewport();
                var listenerIds = Object.keys(listeners);

                if (useIO) {
                    listenerIds
                    .filter(isSlotVisible)
                    .map(getDimensions)
                    .forEach(sendCoordinates);
                } else {
                    listenerIds
                    .map(getDimensions)
                    .filter(isSlotInViewport)
                    .forEach(sendCoordinates);
                }
            });
        }

        function isSlotVisible(id) {
            return listeners[id].visible;
        }

        function isSlotInViewport(item) {
            return item[1].bottom > 0 && item[1].top < viewport.height;
        }

        function getDimensions(id) {
            return [id, listeners[id].slot.getBoundingClientRect()];
        }

        function sendCoordinates(item) {
            listeners[item[0]].respond(null, domRectToRect(item[1]));
        }
    }

    function onIntersect(changes) {
        changes.forEach(function (_) {
            var slot = slots[_.target.id];
            listeners[slot.iframeId].visible = _.intersectionRatio > 0;
        });
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
});
