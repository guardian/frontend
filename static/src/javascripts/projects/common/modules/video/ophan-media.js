/* global guardian */
define([
    'common/utils/mediator',
    'lodash/objects/forOwn'
], function(
    mediator,
    forOwn
) {
    function listenToMediaEvents() {
        // These are attached to the element via `media-events`js
        var eventMappings = {
            'media:content:ready': 'media:content:ready',
            'media:content:firstplay': 'media:content:play',
            'media:content:watched25': 'media:content:25',
            'media:content:watched50': 'media:content:50',
            'media:content:watched75': 'media:content:75',
            'media:content:firstended': 'media:content:end'
        };

        forOwn(eventMappings, function(ophanEventType, originalEventType) {
            mediator.on(originalEventType, function(mediaProps) {
                // We should have `mediaType` as part of the resord, rather than inferred by the `eventType` prefix.
                // This will follow more closely the Ophan thrift mode, but for now, we stay the same.
                // e.g. `{ media: id: 'bigfatid', eventType: 'media:content:play', mediaType: 'video' }`
                var typedEventType = ophanEventType.replace('media:', mediaProps.mediaType + ':');
                ophanRecord(mediaProps.mediaId, mediaProps.mediaType, typedEventType);
            });
        });
    }

    function ophanRecord(mediaId, mediaType, eventType) {
        if (mediaId) {
            getOphan().then(function(ophan) {
                var eventObject = {};
                eventObject[mediaType] = {
                    id: mediaId,
                    eventType: eventType
                };
                ophan.record(eventObject);
            });
        }
    }

    var ophan; // memoizing
    function getOphan() {
        var isEmbed = !!guardian.isEmbed;
        var ophanPath = isEmbed ? 'ophan/embed' : 'ophan/ng';

        if (ophan) {
            return Promise.resolve(ophan);
        } else {
            return require([ophanPath]).then(function(o) {
                ophan = o;
                return ophan;
            });
        }
    }

    return {
        listenToMediaEvents: listenToMediaEvents,
        ophanRecord: ophanRecord
    };

});
