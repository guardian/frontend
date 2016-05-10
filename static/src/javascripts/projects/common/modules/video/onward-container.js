define([
    'common/utils/config',
    'common/modules/component',
    'common/utils/mediator'
], function(
    config,
    Component,
    mediator
) {

    var component = new Component();

    function getEndpoint(mediaType) {
        var isInSeries = Boolean(config.page.seriesTags);

        if (isInSeries) {
            return '/video/in-series/' + config.page.seriesId + '.json';
        } else {
            return '/' + (config.page.isPodcast ? 'podcast' : mediaType) + '/most-viewed.json';
        }
    }

    function init(el, mediaType) {
        component.manipulationType = mediaType === 'video' ? 'append' : 'html';
        component.endpoint = getEndpoint(mediaType);

        component.fetch(el, 'html').then(function () {
            mediator.emit('page:new-content');
        });
    }

    return { init: init };

});
