import { initTrails } from 'bootstraps/enhanced/trail';
import { Component } from 'common/modules/component';
import config from 'lib/config';

const transcludeMostPopular = (): void => {
	const mostViewed = new Component();
	const container = document.querySelector('.js-gallery-most-popular');

	mostViewed.manipulationType = 'html';
	mostViewed.endpoint = '/gallery/most-viewed.json';
	void mostViewed.fetch(container, 'html');
};

const init = (): void => {
	initTrails();

	if (config.get('page.showRelatedContent')) {
		transcludeMostPopular();
	}
};

export { init };
