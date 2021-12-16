import config from 'lib/config';
import { mediator } from 'lib/mediator';
import { begin, error, end } from 'common/modules/analytics/register';
import { Component } from 'common/modules/component';

const tones = {
    uk: {
        comment: 'uk-alpha/contributors/feature-stories',
    },
    us: {
        comment: 'us-alpha/contributors/feature-stories',
    },
    au: {
        comment: 'au-alpha/contributors/feature-stories',
    },
    int: {
        comment: 'ee3386bb-9430-4a6d-8bca-b99d65790f3b',
    },
};

class TonalComponent extends Component {
    static getTone() {
        return config
            .get('page.tones', '')
            .split(',')[0]
            .toLowerCase();
    }

    static ready() {
        mediator.emit('modules:tonal:loaded');
        end('tonal-content');
    }

    static error() {
        error('tonal-content');
    }

    constructor() {
        super();

        begin('tonal-content');

        this.edition = config.get('page.edition', '').toLowerCase();

        // Ensures we only fetch supported tones.
        if (this.isSupported()) {
            this.endpoint = this.getEndpoint();
        }
    }

    getEndpoint() {
        const endpoint = tones[this.edition][TonalComponent.getTone()];
        return `/container/${endpoint}.json`;
    }



    isSupported() {
        return TonalComponent.getTone() in tones[this.edition];
    }
}

export { TonalComponent };
