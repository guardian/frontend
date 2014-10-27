define([
    'raven',
    'common/utils/config',
    'common/modules/analytics/register',
    'common/modules/commercial/badges',
    'common/modules/component',
    'common/modules/ui/images'
], function (
    raven,
    config,
    register,
    badges,
    Component,
    images
) {
    function OnwardContent(context) {
        register.begin('series-content');
        this.context = context;
        this.endpoint = '/series/' + config.page.seriesId + '.json?shortUrl=' + encodeURIComponent(config.page.shortUrl);
        this.fetch(this.context, 'html');
    }

    Component.define(OnwardContent);

    OnwardContent.prototype.ready = function (container) {
        badges.add(container);
        images.upgrade(this.context);
        register.end('series-content');
    };

    OnwardContent.prototype.error = function () {
        register.error('series-content');
    };

    return OnwardContent;
});
