define([
    'bean',
    'common/utils/$',
    'common/utils/mediator',
    'lodash/objects/forOwn',
    'lodash/functions/throttle'
], function(
    bean,
    $,
    mediator,
    forOwn,
    throttle
) {

    function addContentEvents(el) {
        var mediaType = el.tagName.toLowerCase();
        // TODO: fastdom
        var mediaId = el.getAttribute('data-media-id');

        // This is to ensure the ready event fires, this is only in enhanced mode.
        // We might want to restrict this more to desktop for data reasons, but we would have to figure what we do about
        // the analytics.
        el.preload = 'metadata';

        // Here we are making sure that we only fire these events once so we aren't tracking things a million times.
        // General UX events e.g. pause, play, fullscreen, will be tacked elsewhere.
        var fireOnceEventMapping = {
            canplay: 'ready',
            playing: 'firstplay',
            passed25: 'watched25',
            passed50: 'watched50',
            passed75: 'watched75',
            ended: 'firstended'
        };

        forOwn(fireOnceEventMapping, function(onceEventName, eventName) {
            var fullEventName = 'media:content:'+ onceEventName;
            var eventProps = {
                mediaType: mediaType,
                mediaId: mediaId
            };

            bean.one(el, eventName, function() {
                bean.fire(el, fullEventName, eventProps);
                mediator.emit(fullEventName, eventProps);
            });
        });

        bean.on(el, 'timeupdate', throttle(function() {
            var percent = Math.round((el.currentTime / el.duration) * 100);

            if (percent >= 25) {
                bean.fire(el, 'passed25');
            }
            if (percent >= 50) {
                bean.fire(el, 'passed50');
            }
            if (percent >= 75) {
                bean.fire(el, 'passed75');
            }
        }, 1000));
    }

    return {
        addContentEvents: addContentEvents
    };
});
