define([
    'lib/config',
    'lib/mediator',
    'lib/noop',
    'common/modules/analytics/register',
    'common/modules/component'
], function (
    config,
    mediator,
    noop,
    register,
    Component
) {

    function TonalComponent() {

        register.begin('tonal-content');

        this.edition = config.page.edition.toLowerCase();

        //Ensures we only fetch supported tones.
        if (this.isSupported()) {
            this.endpoint = this.getEndpoint();
        } else {
            this.fetch = noop.noop;
        }
    }

    Component.define(TonalComponent);

    TonalComponent.prototype.tones = {
        uk: {
            features: 'uk-alpha/features/feature-stories',
            comment: 'uk-alpha/contributors/feature-stories'
        },
        us: {
            features: 'us-alpha/features/feature-stories',
            comment: 'us-alpha/contributors/feature-stories'
        },
        au: {
            features: 'au-alpha/features/feature-stories',
            comment: 'au-alpha/contributors/feature-stories'
        },
        int: {
            features: '22167321-f8cf-4f4a-b646-165e5b1e9a30',
            comment: 'ee3386bb-9430-4a6d-8bca-b99d65790f3b'
        }
    };

    TonalComponent.prototype.getEndpoint = function () {
        return '/container/' + this.tones[this.edition][this.getTone()] + '.json';
    };

    TonalComponent.prototype.isSupported = function () {
        return this.getTone() in this.tones[this.edition];
    };

    TonalComponent.prototype.getTone = function () {
        return config.page.tones.split(',')[0].toLowerCase();
    };

    TonalComponent.prototype.ready = function () {
        var container = document.body.querySelector('.tone-feature');
        mediator.emit('page:new-content', container);
        mediator.emit('ui:images:upgradePictures');
        mediator.emit('modules:tonal:loaded');
        register.end('tonal-content');
    };

    TonalComponent.prototype.error = function () {
        register.error('tonal-content');
    };

    return TonalComponent;
});
