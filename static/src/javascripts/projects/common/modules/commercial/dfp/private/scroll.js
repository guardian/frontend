define([
    'common/utils/fastdom-promise',
    'common/utils/detect',
    'common/modules/commercial/dfp/messenger'
], function (fastdom, detect, messenger) {
    var useIO = false;
    var taskQueued = false;
    var listeners = {};
    var listenerCounter = 0;
    var observer;

    messenger.register('scroll', function(respond, start, iframe) {
        if( start ) {
            addScrollListener(iframe.id, iframe.closest('js-ad-slot'), respond);
        } else {
            removeScrollListener(iframe.id);
        }
    }, {
        persist: true
    });

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
            visible: !useIO,
            respond: respond
        };
        listenerCounter += 1;

        if (useIO) {
            observer.observe(slot);
        }
    }

    function removeScrollListener(id) {
        if (listeners[id]) {
            if (useIO) {
                observer.unobserve(listeners[id]);
            }
            listeners[id] = false;
            listenerCounter -= 1;
        }

        if (listenerCounter === 0) {
            window.removeEventListener('scroll', onScroll);
            if (useIO) {
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
                var slots = Object.keys(listeners)
                    .map(function (id) {
                        return [id, listeners[id]];
                    })
                    .filter(function (_) {
                        return _[1].visible;
                    })
                    .map(function (_) {
                        return [_[0], _[1].getBoundingClientRect()];
                    });

                if( !useIO ) {
                    slots = slots.filter(function (_) {
                        return _[1].bottom > 0 && _[1].top < viewport.height;
                    });
                }

                slots.forEach(function (slot) {
                    listeners[slot[0]].respond(null, { viewport: viewport, rect: slot[1] });
                });
            });
        }
    }

    function onIntersect() {

    }
});
