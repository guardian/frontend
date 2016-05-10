define([
    'bean',
    'common/utils/config',
    'common/modules/component',
    'common/utils/mediator'
], function(
    bean,
    config,
    Component,
    mediator
) {

    function getEndpoint(mediaType) {
        var isInSeries = Boolean(config.page.seriesTags);

        if (isInSeries) {
            return '/video/in-series/' + config.page.seriesId + '.json';
        } else {
            return '/' + (config.page.isPodcast ? 'podcast' : mediaType) + '/most-viewed.json';
        }
    }

    function initEvents(el, manipulationType, endpoint) {
        var component = new Component();
        bean.on(el, 'click', '.most-viewed-navigation__link', function(ev) {
            var page = ev.currentTarget.getAttribute('data-page');
            var paginatedEndpoint = endpoint + '?page=' + page;

            component = new Component();
            component.manipulationType = manipulationType;
            component.endpoint = paginatedEndpoint;
            el.innerHTML = '';
            component.fetch(el, 'html');
            ev.preventDefault();
            return false;
        });
    }

    function init(el, mediaType) {
        var component = new Component();
        var manipulationType = mediaType === 'video' ? 'append' : 'html';
        var endpoint = getEndpoint(mediaType);

        component.manipulationType = manipulationType;
        component.endpoint = endpoint;

        component.fetch(el, 'html').then(function () {
            mediator.emit('page:new-content');
            initEvents(el, manipulationType, endpoint);
        });
    }

    return { init: init };

});
