import qwery from 'qwery';
import config from 'lib/config';
import mediator from 'lib/mediator';
import Component from 'common/modules/component';
import trail from 'bootstraps/enhanced/trail';
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
        trail.initTrails();

        mediator.emit('page:gallery:ready');
        if (config.page.showRelatedContent) {
            transcludeMostPopular();
        }
    };

export default {
    init: ready
};
