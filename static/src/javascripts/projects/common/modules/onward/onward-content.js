define([
    'lodash/arrays/union',
    'common/utils/config',
    'common/modules/analytics/register',
    'common/modules/commercial/badges',
    'common/modules/component',
    'common/modules/ui/images'
], function (
    union,
    config,
    register,
    badges,
    Component,
    images
) {

    var getTag = function () {
        return union(config.page.nonKeywordTagIds.split(','), [config.page.seriesId, config.page.blogId]).shift();
    };

    function OnwardContent(context) {
        register.begin('series-content');
        this.context = context;
        this.endpoint = '/series/' + getTag() + '.json?shortUrl=' + encodeURIComponent(config.page.shortUrl);
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
