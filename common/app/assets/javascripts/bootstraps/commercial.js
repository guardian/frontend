define([
    'bonzo',
    'qwery',
    'lodash/objects/assign',
    'common/utils/config',
    'common/modules/userPrefs',
    'common/modules/commercial/tags/container',
    'common/modules/commercial/article-aside-adverts',
    'common/modules/commercial/article-body-adverts',
    'common/modules/commercial/slice-adverts',
    'common/modules/commercial/front-commercial-components',
    'common/modules/commercial/badges',
    'common/modules/commercial/dfp',
    'common/modules/commercial/loader'
], function (
    bonzo,
    qwery,
    assign,
    config,
    userPrefs,
    container,
    articleAsideAdverts,
    articleBodyAdverts,
    sliceAdverts,
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

        if (!userPrefs.isOff('adverts') && !config.page.shouldHideAdverts && !config.page.isSSL) {

            // load tags
            if (config.page.contentType !== 'Identity' && config.page.section !== 'identity') {
                container.init(config);
            }

            // following modules add ad slots to the page, if appropriate
            articleAsideAdverts().init();

            articleBodyAdverts().init();

            sliceAdverts().init();

            frontCommercialComponents.init();

            badges.init();

            // now call dfp
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
