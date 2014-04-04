define([
    'common/common',
    'common/modules/lazyload',
    'common/modules/analytics/register',
    'common/modules/ui/expandable',
    'common/modules/ui/images',
    'qwery'
], function(
    common,
    LazyLoad,
    register,
    Expandable,
    images
){

    function SeriesContent(){}

    SeriesContent.prototype.renderSeriesComponent = function(config, context) {

        var container;

        if( config.switches && config.switches.seriesContent && config.page.series ) {

            register.begin('series-content');

            container = context.querySelector('.js-series');
            if(container) {
                new LazyLoad({
                    url: '/in-series/' + config.page.seriesId + '.json?shortUrl=' + encodeURIComponent( config.page.shortUrl ) + '&series=' + encodeURIComponent( config.page.series ),
                    container: container,
                    success: function() {
                        var seriesContentTrails = container.querySelector('.series-trails');
                        new Expandable({dom: seriesContentTrails, expanded: true, showCount: false}).init();
                        images.upgrade(seriesContentTrails);
                        register.end('series-content');
                    },
                    error: function(req) {
                        common.mediator.emit('module:error', 'Failed to load related: ' + req.statusText, 'common/modules/related.js');
                        register.error('series-content');
                    }
                }).load();
            }
        }
    };

    return SeriesContent;
});