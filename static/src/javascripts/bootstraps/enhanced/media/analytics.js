define([
    'common/utils/$',
    'common/modules/video/media-events',
    'common/modules/video/ophan-media'
], function(
    $,
    mediaEvents,
    ophanMedia
) {

    function init() {
        // This feels a little mutationy - but not sure that returning an new element that fires
        // these events is the best idea
        $('.gu-media').each(mediaEvents.addContentEvents);

        ophanMedia.listenToMediaEvents();
    }

    return {init: init};

});
