define([
    'common/utils/mediator',
    'common/modules/analytics/register',
    'common/modules/ui/images',
    'common/modules/component'
], function(
    mediator,
    register,
    images,
    Component
){

    var noop = function(){};

    function TonalComponent(config, context){

        register.begin('tonal-content');

        this.config = config;
        this.context = context;
        this.edition = this.config.page.edition.toLowerCase();

        //Ensures we only fetch supported tones.
        if(this.isSupported()) {
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

    TonalComponent.prototype.getEndpoint = function() {
        return '/container/' + this.edition + this.tones[this.getTone()];
    };

    TonalComponent.prototype.isSupported = function() {
        return this.getTone() in this.tones;
    };

    TonalComponent.prototype.getTone = function() {
        return this.config.page.tones.split(',')[0].toLowerCase();
    };

    TonalComponent.prototype.ready = function() {
        images.upgrade(this.context);
        register.end('tonal-content');
    };

    TonalComponent.prototype.error = function() {
        mediator.emit('module:error', 'Failed to load tone:' + this.getTone() + 'common/modules/related.js');
        register.error('tonal-content');
    };

    return TonalComponent;
});