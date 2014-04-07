define([
    'common/modules/analytics/register',
    'common/modules/ui/images',
    'lodash/objects/assign',
    'common/modules/component'
], function(
    register,
    images,
    extend,
    Component
){


    function SeriesContent(config, context){
        register.begin('series-content');
        this.config = config;
        this.context = context;
        this.endpoint = '/series/' + this.config.page.seriesId + '.json?shortUrl=' + encodeURIComponent( this.config.page.shortUrl ) + '&series=' + encodeURIComponent( this.config.page.series );

        this.fetch(this.context, 'html');

    }

    Component.define(SeriesContent);


    SeriesContent.prototype.ready = function() {
        images.upgrade(this.context);
        register.end('series-content');
    };

    SeriesComponent.prototype.error = function() {
        common.mediator.emit('module:error', 'Failed to load related: ' + req.statusText, 'common/modules/related.js');
        register.error('series-content');
    };


    return SeriesContent;
});