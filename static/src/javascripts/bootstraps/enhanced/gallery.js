// @flow
import qwery from 'qwery';
import config from 'lib/config';
import mediator from 'lib/mediator';
import Component from 'common/modules/component';
import { initTrails } from 'bootstraps/enhanced/trail';

const transcludeMostPopular = (): void => {
    const mostViewed = new Component();
    const container = qwery('.js-gallery-most-popular')[0];

    mostViewed.manipulationType = 'html';
    mostViewed.endpoint = '/gallery/most-viewed.json';
    mostViewed.ready = (): void => {
        mediator.emit('page:new-content', container);
    };
    mostViewed.fetch(container, 'html');
};

const init = (): void => {
    initTrails();

    if (config.get('page.showRelatedContent')) {
        transcludeMostPopular();
    }
};

export { init };
