// @flow
/*
 Module: geo-most-popular.js
 Description: Shows popular trails for a given country.
 */
import qwery from 'qwery';
import Component from 'common/modules/component';
import mediator from 'lib/mediator';
import once from 'lodash/functions/once';

const promise = new Promise((resolve, reject) => {
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

const geoMostPopular = {
    render: once((): Promise<void> => {
        new GeoMostPopular().fetch(
            qwery('.js-components-container'),
            'rightHtml'
        );
        return promise;
    }),

    whenRendered: promise,
};

export { geoMostPopular };
