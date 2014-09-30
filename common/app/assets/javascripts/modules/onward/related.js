define([
    'bonzo',
    'qwery',
    'raven',
    'lodash/arrays/intersection',
    'common/utils/$',
    'common/utils/mediator',
    'common/modules/analytics/register',
    'common/modules/lazyload',
    'common/modules/onward/history',
    'common/modules/ui/expandable',
    'common/modules/ui/images'
], function (
    bonzo,
    qwery,
    raven,
    intersection,
    $,
    mediator,
    register,
    LazyLoad,
    History,
    Expandable,
    images
) {

    function Related() {
    }

    Related.overrideUrl = '';

    Related.setOverrideUrl = function(url) {
        Related.overrideUrl = url;
    };

    Related.prototype.popularInTagOverride = function(config) {
        // whitelist of tags to override related story component with a popular-in-tag component
        if (!config.page.keywordIds) { return; }
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

        var match = intersection(whitelistedTags, pageTags);
        if (match.length > 0) {
            return '/popular-in-tag/' + match[0] + '.json';
        }
    };

    Related.prototype.renderRelatedComponent = function(config) {
        var container;

        var fetchRelated = config.switches.relatedContent && config.switches.ajaxRelatedContent && config.page.showRelatedContent;

        if (config.page && config.page.hasStoryPackage && !Related.overrideUrl) {
            new Expandable({
                dom: document.body.querySelector('.related-trails'),
                expanded: false,
                showCount: false
            }).init();
            mediator.emit('modules:related:loaded', config);

        } else if (fetchRelated) {

            container = document.body.querySelector('.js-related');
            if (container) {
                var popularInTag = this.popularInTagOverride(config),
                    componentName = (!Related.overrideUrl && popularInTag) ? 'related-popular-in-tag' : 'related-content';
                register.begin(componentName);

                container.setAttribute('data-component', componentName);

                var relatedUrl = Related.overrideUrl || popularInTag || '/related/' + config.page.pageId + '.json';

                new LazyLoad({
                    url: relatedUrl,
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
                        mediator.emit('modules:related:loaded', config);
                        register.end(componentName);
                    },
                    error: function() {
                        register.error(componentName);
                    }
                }).load();
            }
        } else {
            $('.js-related').addClass('u-h');
        }
    };

    return Related;
});
