define([
    'common/utils/config',
    'common/utils/mediator',
    'common/modules/analytics/register',
    'common/modules/component'
], function (
    config,
    mediator,
    register,
    Component
) {

    var noop = function () {};

    function TonalComponent() {

        register.begin('tonal-content');

        this.edition = config.page.edition.toLowerCase();

        //Ensures we only fetch supported tones.
        if (this.isSupported()) {
            this.endpoint = this.getEndpoint();
        } else {
            this.fetch = noop;
        }
    }

    Component.define(TonalComponent);

    TonalComponent.prototype.tones = {
        features: '-alpha/features/feature-stories.json',
        comment: '-alpha/contributors/feature-stories.json'
    };

    TonalComponent.prototype.getEndpoint = function () {
        return '/container/' + this.edition + this.tones[this.getTone()];
    };

    TonalComponent.prototype.isSupported = function () {
        return this.getTone() in this.tones;
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
