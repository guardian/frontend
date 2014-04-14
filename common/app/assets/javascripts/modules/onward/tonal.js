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

    function TonalComponent(config, context){

        register.begin('tonal-content');

        this.config = config;
        this.context = context;
        this.edition = this.config.page.edition.toLowerCase();
        this.endpoint = this.getEndpoint();
    }

    Component.define(TonalComponent);

    TonalComponent.prototype.getEndpoint = function() {
        return '/collection/' + this.edition + {
            features: '-alpha/features/feature-stories.json',
            comment: '-alpha/contributors/feature-stories.json'
        }[this.getTone()];
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