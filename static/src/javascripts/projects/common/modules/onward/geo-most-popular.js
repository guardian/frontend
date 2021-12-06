/*
 Module: geo-most-popular.js
 Description: Shows popular trails for a given country.
 */
import fastdom from '../../../../lib/fastdom-promise';
import { Component } from '../component';
import { mediator } from '../../../../lib/mediator';
import { once } from 'lodash-es';

const promise = new Promise((resolve, reject) => {
	mediator.on('modules:onward:geo-most-popular:ready', resolve);
	mediator.on('modules:onward:geo-most-popular:cancel', resolve);
	mediator.on('modules:onward:geo-most-popular:error', reject);
});

class GeoMostPopular extends Component {
	static error(error) {
		mediator.emit('modules:onward:geo-most-popular:error', error);
	}

	constructor() {
		super();

		this.endpoint = '/most-read-geo.json';

		mediator.emit('register:begin', 'geo-most-popular');
	}

	ready() {
		mediator.emit('register:end', 'geo-most-popular');
		mediator.emit('modules:onward:geo-most-popular:ready', this);
	}
}

// we don't want to show most popular on short articles as the sticky right mpu slot will push most popular behind other containers at the bottom.
const showMostPopularThreshold = 1500;

const fetchMostPopular = (articleBodyHeight) => {
	if (articleBodyHeight > showMostPopularThreshold) {
		new GeoMostPopular().fetch(
			document.querySelectorAll('.js-components-container'),
			'rightHtml',
		);
	}
};

const geoMostPopular = {
	render: once(() => {
		fastdom
			.measure(() => {
				const jsArticleBodyElement =
					document.querySelector('.js-article__body');
				return jsArticleBodyElement
					? jsArticleBodyElement.getBoundingClientRect() &&
							jsArticleBodyElement.getBoundingClientRect().height
					: 0;
			})
			.then(fetchMostPopular);

		return promise;
	}),

	whenRendered: promise,
};

export { geoMostPopular };
