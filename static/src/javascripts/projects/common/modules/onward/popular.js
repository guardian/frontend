// @flow

import qwery from 'qwery';
import config from 'lib/config';
import { Component } from 'common/modules/component';
import mediator from 'lib/mediator';

class MostPopular extends Component {
    constructor(): void {
        super();

        /* This is not going to evolve into a random list of sections. If
           anyone wants more than these 2 then they get to comission the work to
           have it go through the entire tooling chain so that a section has a
           property that tells us whether it shows most popular or not. */
        const sectionsWithoutPopular = ['info', 'global'];

        mediator.emit('register:begin', 'popular-in-section');

        this.hasSection =
            config.page &&
            config.page.section &&
            !sectionsWithoutPopular.includes(config.page.section);
        this.endpoint = `/most-read${this.hasSection
            ? `/${config.page.section}`
            : ''}.json`;
    }

    hasSection: boolean;

    init(): void {
        this.fetch(qwery('.js-popular-trails'), 'html');
    }

    ready() {
        mediator.emit('modules:popular:loaded', this.elem);
        mediator.emit('page:new-content', this.elem);
        mediator.emit('register:end', 'popular-in-section');
    }
}

export { MostPopular };
