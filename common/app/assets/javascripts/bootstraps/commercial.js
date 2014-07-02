define([
    'bonzo',
    'qwery',
    'lodash/objects/assign',
    'common/utils/config',
    'common/modules/analytics/commercial/tags/container',
    'common/modules/userPrefs',
    'common/modules/adverts/article-aside-adverts',
    'common/modules/adverts/article-body-adverts',
    'common/modules/adverts/slice-adverts',
    'common/modules/adverts/front-commercial-components',
    'common/modules/adverts/badges',
    'common/modules/adverts/dfp',
    'common/modules/commercial/loader'
], function (
    bonzo,
    qwery,
    assign,
    config,
    container,
    userPrefs,
    ArticleAsideAdverts,
    ArticleBodyAdverts,
    SliceAdverts,
    frontCommercialComponents,
    badges,
    dfp,
    CommercialLoader
) {

    function init() {

        [
            ['commercial-component', 'merchandising'],
            ['commercial-component-high', 'merchandising-high']
        ].forEach(function(data) {
                var commercialComponent = new RegExp('^#' + data[0] + '=(.*)$').exec(window.location.hash),
                    slot = qwery('[data-name="' + data[1] + '"]').shift();
                if (commercialComponent && slot) {
                    bonzo(slot).removeClass('ad-slot--dfp');
                    var loader = new CommercialLoader({ config: config }),
                        postLoadEvents = {};
                    postLoadEvents[commercialComponent[1]] = function() {
                        bonzo(slot).css('display', 'block');
                    };
                    loader.postLoadEvents = postLoadEvents;
                    loader.init(commercialComponent[1], slot);
                }
            });

        if (config.page.contentType !== 'Identity' && config.page.section !== 'identity') {
            container.init(config);
        }

        var showAds =
            !userPrefs.isOff('adverts') &&
            !config.page.shouldHideAdverts &&
            !config.page.isSSL &&
            (config.switches.standardAdverts || config.switches.commercialComponents);

        if (showAds) {

            // if it's an article, excluding live blogs, create our inline adverts
            if (config.switches.standardAdverts && config.page.contentType === 'Article') {
                new ArticleAsideAdverts(config).init();
                // no inline adverts on live
                if (!config.page.isLiveBlog) {
                    new ArticleBodyAdverts().init();
                }
            }

            new SliceAdverts(config).init();

            frontCommercialComponents.init(config);

            badges.init();

            var options = {};

            if (!config.switches.standardAdverts) {
                options.adSlotSelector = '.ad-slot--commercial-component';
            } else if (!config.switches.commercialComponents) {
                options.adSlotSelector = '.ad-slot--dfp:not(.ad-slot--commercial-component)';
            }
            dfp.init(assign(config, options));
        }

    }

    return {
        init: init
    };

});
