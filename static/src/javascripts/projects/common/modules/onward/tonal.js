// @flow
import config from 'lib/config';
import mediator from 'lib/mediator';
import register from 'common/modules/analytics/register';
import Component from 'common/modules/component';

const noop = () => {};

const tones = {
    uk: {
        features: 'uk-alpha/features/feature-stories',
        comment: 'uk-alpha/contributors/feature-stories',
    },
    us: {
        features: 'us-alpha/features/feature-stories',
        comment: 'us-alpha/contributors/feature-stories',
    },
    au: {
        features: 'au-alpha/features/feature-stories',
        comment: 'au-alpha/contributors/feature-stories',
    },
    int: {
        features: '22167321-f8cf-4f4a-b646-165e5b1e9a30',
        comment: 'ee3386bb-9430-4a6d-8bca-b99d65790f3b',
    },
};

class TonalComponent extends Component {
    static getTone(): string {
        return config.page.tones.split(',')[0].toLowerCase();
    }

    static ready(): void {
        if (document.body) {
            const container = document.body.querySelector('.tone-feature');

            if (container) {
                mediator.emit('page:new-content', container);
            }
        }

        mediator.emit('ui:images:upgradePictures');
        mediator.emit('modules:tonal:loaded');
        register.end('tonal-content');
    }

    static error(): void {
        register.error('tonal-content');
    }

    constructor(): void {
        super();

        register.begin('tonal-content');

        this.edition = config.page.edition.toLowerCase();

        // Ensures we only fetch supported tones.
        if (this.isSupported()) {
            this.endpoint = this.getEndpoint();
        } else {
            this.fetch = noop;
        }
    }

    getEndpoint(): string {
        const endpoint = tones[this.edition][TonalComponent.getTone()];
        return `/container/${endpoint}.json`;
    }

    isSupported(): boolean {
        return TonalComponent.getTone() in tones[this.edition];
    }
}

export { TonalComponent };
