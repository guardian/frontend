define(
    [
        'qwery',
        'lib/config',
        'lib/mediator',
        'common/modules/component',
        'bootstraps/enhanced/trail',
    ],
    function(qwery, config, mediator, Component, trail) {
        var transcludeMostPopular = function() {
            var mostViewed = new Component(),
                container = qwery('.js-gallery-most-popular')[0];

            mostViewed.manipulationType = 'html';
            mostViewed.endpoint = '/gallery/most-viewed.json';
            mostViewed.ready = function() {
                mediator.emit('page:new-content', container);
            };
            mostViewed.fetch(container, 'html');
        },
            ready = function() {
                trail();

                mediator.emit('ui:images:upgradePictures');

                mediator.emit('page:gallery:ready');
                if (config.page.showRelatedContent) {
                    transcludeMostPopular();
                }
            };

        return {
            init: ready,
        };
    }
);
