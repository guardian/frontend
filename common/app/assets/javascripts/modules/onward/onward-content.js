define([
    'raven',
    'common/modules/analytics/register',
    'common/modules/component',
    'common/modules/ui/images'
], function(
    raven,
    register,
    Component,
    images
){
    function OnwardContent(config){
        register.begin('series-content');
        this.config = config;
        this.endpoint = '/series/' + this.config.page.seriesId + '.json?shortUrl=' + encodeURIComponent(this.config.page.shortUrl);
        this.fetch(document.body, 'html');
    }

    Component.define(OnwardContent);

    OnwardContent.prototype.ready = function() {
        images.upgrade();
        register.end('series-content');
    };

    OnwardContent.prototype.error = function() {
        register.error('series-content');
    };

    return OnwardContent;
});
