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
    function OnwardContent(config, context){
        register.begin('series-content');
        this.config = config;
        this.context = context;
        this.endpoint = '/series/' + this.config.page.seriesId + '.json?shortUrl=' + encodeURIComponent(this.config.page.shortUrl);
        this.fetch(this.context, 'html');
    }

    Component.define(OnwardContent);

    OnwardContent.prototype.ready = function() {
        images.upgrade(this.context);
        register.end('series-content');
    };

    OnwardContent.prototype.error = function() {
        mediator.emit('module:error', 'Failed to load series:' + this.config.page.series + 'common/modules/related.js');
        register.error('series-content');
    };

    return OnwardContent;
});
