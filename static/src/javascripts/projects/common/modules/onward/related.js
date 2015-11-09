define([
    'bonzo',
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/utils/mediator',
    'common/modules/analytics/register',
    'common/modules/lazyload',
    'common/modules/ui/expandable',
    'common/modules/experiments/ab',
    'common/modules/onward/inject-container',
    'lodash/arrays/intersection',
    'lodash/collections/map'
], function (
    bonzo,
    qwery,
    $,
    config,
    mediator,
    register,
    LazyLoad,
    Expandable,
    ab,
    injectContainer,
    intersection,
    map) {

    var opts;

    function Related(options) {
        opts = options || {};
    }

    Related.prototype.popularInTagOverride = function () {
        // whitelist of tags to override related story component with a popular-in-tag component
        if (!config.page.keywordIds) {
            return false;
        }
        var whitelistedTags = [// order matters here (first match wins)
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
            ],
            pageTags      = config.page.keywordIds.split(','),
            // if this is an advertisement feature, use the page's keyword (there'll only be one)
            popularInTags = config.page.isAdvertisementFeature ? pageTags : intersection(whitelistedTags, pageTags);

        if (popularInTags.length) {
            return '/popular-in-tag/' + popularInTags[0] + '.json';
        }
    };

    Related.prototype.renderRelatedComponent = function () {
        var relatedUrl, popularInTag, componentName, container,
            fetchRelated = config.switches.relatedContent && config.page.showRelatedContent;

        if (config.page && config.page.hasStoryPackage) {
            new Expandable({
                dom: document.body.querySelector('.related-trails'),
                expanded: false,
                showCount: false
            }).init();
        } else if (fetchRelated) {
            if (ab.getParticipations().InjectHeadlinesTest && ab.getParticipations().InjectHeadlinesTest.variant === 'variant' && ab.testCanBeRun('InjectHeadlinesTest')) {
                injectContainer.injectContainer('/container/use-layout/uk-alpha/news/regular-stories.json', '.js-related', 'ab-briefing-loaded');
                mediator.once('ab-briefing-loaded', function () {
                    var $headlines = $('#headlines'),
                        $treat = $('#headlines .treats__treat');
                    $('#headlines .fc-container__header__title span').html('Your morning briefing');
                    $headlines.attr('data-link-name', $headlines.attr('data-link-name') + ' morning-briefing-ab');
                    $treat.attr('data-link-name', $treat.attr('data-link-name') + ' | morning-briefing-ab-treat');
                });
            } else {
                container = document.body.querySelector('.js-related');

                if (container) {
                    popularInTag = this.popularInTagOverride();
                    componentName = popularInTag ? 'related-popular-in-tag' : 'related-content';
                    register.begin(componentName);

                    container.setAttribute('data-component', componentName);

                    relatedUrl = popularInTag || '/related/' + config.page.pageId + '.json';

                    if (opts.excludeTags && opts.excludeTags.length) {
                        relatedUrl += '?' + map(opts.excludeTags, function (tag) {
                            return 'exclude-tag=' + tag;
                        }).join('&');
                    }

                    new LazyLoad({
                        url: relatedUrl,
                        container: container,
                        success: function () {
                            var relatedContainer = container.querySelector('.related-content');

                            new Expandable({dom: relatedContainer, expanded: false, showCount: false}).init();
                            // upgrade images
                            mediator.emit('modules:related:loaded', container);
                            mediator.emit('page:new-content', container);
                            mediator.emit('ui:images:upgradePictures', container);
                            register.end(componentName);

                            /* TODO remove after ab test*/
                            if (ab.getTestVariantId('OnwardNames') &&
                                ab.testCanBeRun('OnwardNames') &&
                                ab.getTestVariantId('OnwardNames').indexOf('test:') === 0) {
                                (function () {
                                    var heading = $('.js-ab-onward-names-related');
                                    if (heading) {
                                        heading.text(ab.getTestVariantId('OnwardNames').substr(5));
                                    }
                                })();
                            }

                        },
                        error: function () {
                            bonzo(container).remove();
                            register.error(componentName);
                        }
                    }).load();
                }
            }
        } else {
            $('.js-related').addClass('u-h');
        }
    };

    return Related;
});
