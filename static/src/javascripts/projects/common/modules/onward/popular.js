import qwery from 'qwery';
import config from 'lib/config';
import { Component } from 'common/modules/component';
import { mediator } from 'lib/mediator';

class MostPopular extends Component {
    constructor() {
        super();

        /* This is not going to evolve into a random list of sections. If
           anyone wants more than these 2 then they get to comission the work to
           have it go through the entire tooling chain so that a section has a
           property that tells us whether it shows most popular or not. */
        const sectionsWithoutPopular = ['info', 'global'];
        const pageSection = config.get('page.section');
        const hasSection =
            pageSection && !sectionsWithoutPopular.includes(pageSection);

        this.endpoint = `/most-read${hasSection ? `/${pageSection}` : ''}.json`;

        mediator.emit('register:begin', 'popular-in-section');

        this.fetch(qwery('.js-popular-trails'), 'html');
    }

    // eslint-disable-next-line class-methods-use-this
    ready() {
        mediator.emit('modules:popular:loaded');
        mediator.emit('register:end', 'popular-in-section');
    }
}

export { MostPopular };
