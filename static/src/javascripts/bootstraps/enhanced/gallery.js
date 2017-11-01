// @flow
import qwery from 'qwery';
import config from 'lib/config';
import { Component } from 'common/modules/component';
import { initTrails } from 'bootstraps/enhanced/trail';

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
