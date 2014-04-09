define([
    'common/common',
    'common/modules/analytics/register',
    'common/modules/ui/images',
    'lodash/objects/assign',
    'common/modules/component'
], function(
    common,
    register,
    images,
    extend,
    Component
){

    function getFirstItem(str) {
        return str.split(',')[0];
    }

    function TonalComponent(config, context){

        register.begin('tonal-content');

        this.config = config;
        this.context = context;

        this.endpoint = this.endpoint.replace('{toneId}', encodeURIComponent(getFirstItem(this.config.page.toneIds.split('/')[1])));
        this.endpoint = this.endpoint.replace('{tone}', encodeURIComponent(getFirstItem(this.config.page.tones)));
        this.endpoint = this.endpoint.replace('{shortUrl}', encodeURIComponent(this.config.page.shortUrl));
    }

    Component.define(TonalComponent);

    TonalComponent.prototype.endpoint = '/tone/{toneId}.json?shortUrl={shortUrl}&tone={tone}';

    TonalComponent.prototype.ready = function() {
        images.upgrade(this.context);
        register.end('tonal-content');
    };

    TonalComponent.prototype.error = function() {
        common.mediator.emit('module:error', 'Failed to load series:' + this.config.page.series + 'common/modules/related.js');
        register.error('tonal-content');
    };

    return TonalComponent;
});