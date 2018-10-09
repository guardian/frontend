// @flow
/*
 Module: geo-most-popular.js
 Description: Shows popular trails for a given country.
 */
import qwery from 'qwery';
import fastdom from 'lib/fastdom-promise';
import { Component } from 'common/modules/component';
import mediator from 'lib/mediator';
import once from 'lodash/once';

const promise: Promise<void> = new Promise((resolve, reject) => {
    mediator.on('modules:onward:geo-most-popular:ready', resolve);
    mediator.on('modules:onward:geo-most-popular:cancel', resolve);
    mediator.on('modules:onward:geo-most-popular:error', reject);
});

class GeoMostPopular extends Component {
    static error(error: Error): void {
        mediator.emit('modules:onward:geo-most-popular:error', error);
    }

    constructor(): void {
        super();

        this.endpoint = '/most-read-geo.json';

        mediator.emit('register:begin', 'geo-most-popular');
    }

    ready(): void {
        mediator.emit('register:end', 'geo-most-popular');
        mediator.emit('modules:onward:geo-most-popular:ready', this);
    }
}

// we don't want to show most popular on short articles as the sticky right mpu slot will push most popular behind other containers at the bottom.
const showMostPopularThreshold = 1500;

const fetchMostPopular = (articleBodyHeight: number): void => {
    if (articleBodyHeight > showMostPopularThreshold) {
        new GeoMostPopular().fetch(
            qwery('.js-components-container'),
            'rightHtml'
        );
    }
};

const geoMostPopular = {
    render: once(
        (): Promise<void> => {
            fastdom
                .read(() => {
                    const jsArticleBodyElement = document.querySelector(
                        '.js-article__body'
                    );
                    return jsArticleBodyElement
                        ? jsArticleBodyElement.getBoundingClientRect() &&
                              jsArticleBodyElement.getBoundingClientRect()
                                  .height
                        : 0;
                })
                .then(fetchMostPopular);

            return promise;
        }
    ),

    whenRendered: promise,
};

export { geoMostPopular };
