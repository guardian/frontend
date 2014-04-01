define([
    'common/common',
    'common/modules/lazyload',
    'common/modules/ui/expandable',
    'common/modules/ui/images',
    'common/modules/onward/history',
    'qwery',
    'bonzo',
    'common/$',
    'common/modules/analytics/register',
    'lodash/arrays/intersection'
], function (
    common,
    LazyLoad,
    Expandable,
    images,
    History,
    qwery,
    bonzo,
    $,
    register,
    _intersection
) {

    function Related() {
    }

    Related.overrideUrl = '';

    Related.setOverrideUrl = function(url) {
        Related.overrideUrl = url;
    };

    Related.prototype.popularInTagOverride = function(config) {
        // whitelist of tags to override related story component with a popular-in-tag component
        if (!config.switches.popularInTag) { return; }
        var whitelistedTags = [ // order matters here (first match wins)
            // sport tags
            'sport/cricket', 'sport/rugby-union', 'sport/rugbyleague', 'sport/formulaone',
            'sport/tennis', 'sport/cycling', 'sport/motorsports', 'sport/golf', 'sport/horse-racing',
            'sport/boxing', 'sport/us-sport', 'sport/australia-sport',
            // football tags
            'football/championsleague', 'football/premierleague', 'football/championship',
            'football/europeanfootball', 'football/world-cup-2014',
            // football team tags
            'football/manchester-united', 'football/chelsea', 'football/arsenal',
            'football/manchestercity', 'football/tottenham-hotspur', 'football/liverpool'
        ];
        var pageTags = config.page.keywordIds.split(',');

        var match = _intersection(whitelistedTags, pageTags);
        if (match.length > 0) {
            return '/popular-in-tag/' + match[0] + '.json';
        }
    };

    Related.prototype.renderRelatedComponent = function(config, context) {
        var container;

        if (config.page && config.page.hasStoryPackage && !Related.overrideUrl) {

            new Expandable({
                dom: context.querySelector('.related-trails'),
                expanded: false,
                showCount: false
            }).init();
            common.mediator.emit('modules:related:loaded', config, context);

        } else if (config.switches && config.switches.relatedContent) {
            var popularInTag = this.popularInTagOverride(config),
                componentName = (!Related.overrideUrl && popularInTag) ? 'related-popular-in-tag' : 'related-content';
            register.begin(componentName);

            container = context.querySelector('.js-related');
            if (container) {
                container.setAttribute('data-component', componentName);
                new LazyLoad({
                    url: Related.overrideUrl || popularInTag || '/related/' + config.page.pageId + '.json',
                    container: container,
                    success: function () {
                        if (Related.overrideUrl) {
                            if (config.page.hasStoryPackage) {
                                $('.more-on-this-story').addClass('u-h');
                            }
                        }

                        var relatedTrails = container.querySelector('.related-trails');
                        new Expandable({dom: relatedTrails, expanded: false, showCount: false}).init();
                        // upgrade images
                        images.upgrade(relatedTrails);
                        common.mediator.emit('modules:related:loaded', config, context);
                        register.end(componentName);
                    },
                    error: function(req) {
                        common.mediator.emit('module:error', 'Failed to load related: ' + req.statusText, 'common/modules/related.js');
                        register.error(componentName);
                    }
                }).load();
            }
        }
    };

    return Related;
});
