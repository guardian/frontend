import { initTrails } from 'bootstraps/enhanced/trail';
import { Component } from 'common/modules/component';
import config from 'lib/config';
import qwery from 'qwery';

const transcludeMostPopular = (): void => {
    const mostViewed = new Component();
    const container = qwery('.js-gallery-most-popular')[0];

    mostViewed.manipulationType = 'html';
    mostViewed.endpoint = '/gallery/most-viewed.json';
    mostViewed.fetch(container, 'html');
};

const init = (): void => {
    initTrails();

    if (config.get('page.showRelatedContent')) {
        transcludeMostPopular();
    }
};

export { init };
