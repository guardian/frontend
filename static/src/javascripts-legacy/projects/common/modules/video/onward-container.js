define(
    ['bean', 'lib/config', 'common/modules/component', 'lib/mediator'],
    function(bean, config, Component, mediator) {
        function getEndpoint(mediaType) {
            var isInSeries = Boolean(config.page.seriesTags);

            if (isInSeries) {
                return '/video/in-series/' + config.page.seriesId + '.json';
            } else {
                return (
                    '/' +
                    (config.page.isPodcast ? 'podcast' : mediaType) +
                    '/most-viewed.json'
                );
            }
        }

        function initEvents(el, manipulationType, endpoint) {
            bean.on(el, 'click', '.most-viewed-navigation__button', function(
                ev
            ) {
                var page = ev.currentTarget.getAttribute('data-page');

                createComponent(el, endpoint, manipulationType, page);

                ev.preventDefault();
                return false;
            });
        }

        function createComponent(el, endpoint, manipulationType, page) {
            var component = new Component();
            var paginatedEndpoint = endpoint + (page ? '?page=' + page : '');
            component.manipulationType = manipulationType;
            component.endpoint = paginatedEndpoint;

            el.innerHTML = ''; // we have no replace in component

            return component.fetch(el, 'html');
        }

        function init(el, mediaType) {
            var manipulationType = mediaType === 'video' ? 'append' : 'html';
            var endpoint = getEndpoint(mediaType);

            createComponent(el, endpoint, manipulationType).then(function() {
                mediator.emit('page:new-content');
                initEvents(el, manipulationType, endpoint);
            });
        }

        return { init: init };
    }
);
