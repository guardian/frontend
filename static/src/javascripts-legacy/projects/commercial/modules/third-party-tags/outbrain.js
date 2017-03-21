define([
    'lib/fastdom-promise',
    'lib/$',
    'lib/config',
    'lib/detect',
    'lodash/utilities/template',
    'lib/steady-page',
    'commercial/modules/commercial-features',
    'commercial/modules/third-party-tags/outbrain-codes',
    'raw-loader!commercial/views/outbrain.html',
    'lib/load-script',
    'common/modules/check-mediator',
    'ophan/ng'
], function (
    fastdom,
    $,
    config,
    detect,
    template,
    steadyPage,
    commercialFeatures,
    getCode,
    outbrainStr,
    loadScript,
    checkMediator,
    ophan
) {
    var outbrainUrl = '//widgets.outbrain.com/outbrain.js';
    var outbrainTpl = template(outbrainStr);

    var selectors = {
        outbrain: {
            widget: '.js-outbrain',
            container: '.js-outbrain-container'
        },
        merchandising: {
            widget: '.js-container--commercial',
            container: '.js-outbrain-container'
        },
        nonCompliant: {
            widget: '.js-outbrain',
            container: '.js-outbrain-container'
        }
    };

    function build(codes, breakpoint) {
        var html = outbrainTpl({ widgetCode: codes.code || codes.image });
        if (breakpoint !== 'mobile' && codes.text) {
            html += outbrainTpl({ widgetCode: codes.text });
        }
        return html;
    }

    var module = {
        load: load,
        tracking: tracking,
        init: init
    };

    function load(target) {
        var slot          = target in selectors ? target : 'defaults';
        var $outbrain     = $(selectors.outbrain.widget);
        var $container    = $(selectors.outbrain.container, $outbrain[0]);
        var breakpoint    = detect.getBreakpoint();
        var widgetCodes, widgetHtml;

        widgetCodes = getCode({
            slot: slot,
            section: config.page.section,
            breakpoint: breakpoint
        });
        widgetHtml = build(widgetCodes, breakpoint);
        if ($container.length) {
            return steadyPage.insert($container[0], function() {
                if (slot === 'merchandising') {
                    $(selectors[slot].widget).replaceWith($outbrain[0]);
                }
                $container.append(widgetHtml);
                $outbrain.css('display', 'block');
            }).then(function () {
                module.tracking(widgetCodes.code || widgetCodes.image);
                loadScript(outbrainUrl);
            });
        }
    }

    function tracking(widgetCode) {
        ophan.record({
            outbrain: {
                widgetId: widgetCode
            }
        });
    }

    /*
     Loading Outbrain is dependent on successful return of high relevance component
     from DFP. AdBlock is blocking DFP calls so we are not getting any response and thus
     not loading Outbrain. As Outbrain is being partially loaded behind the adblock we can
     make the call instantly when we detect adBlock in use.
     */
    function loadInstantly() {
        return detect.adblockInUse.then(function(adblockInUse){
            return !document.getElementById('dfp-ad--merchandising-high') ||
                adblockInUse;
        });
    }

    function init() {
        if (commercialFeatures.outbrain) {
            // if there is no merch component, load the outbrain widget right away
            return loadInstantly().then(function(shouldLoadInstantly) {
                if (shouldLoadInstantly) {
                    return checkMediator.waitForCheck('isUserInNonCompliantAbTest').then(function (userInNonCompliantAbTest) {
                        userInNonCompliantAbTest ? module.load('nonCompliant') : module.load();
                    });
                } else {
                    // if a high priority ad and low priority ad on page block outbrain
                    return checkMediator.waitForCheck('isOutbrainBlockedByAds').then(function(outbrainBlockedByAds) {
                        if (!outbrainBlockedByAds) {
                            // if only a high priority ad on page then outbrain is merchandise compliant
                            checkMediator.waitForCheck('isOutbrainMerchandiseCompliant').then(function (outbrainMerchandiseCompliant) {
                                if (outbrainMerchandiseCompliant) {
                                    module.load('merchandising');
                                } else {
                                    checkMediator.waitForCheck('isUserInNonCompliantAbTest').then(function (userInNonCompliantAbTest) {
                                        userInNonCompliantAbTest ? module.load('nonCompliant') : module.load();
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }

        return Promise.resolve(true);
    }

    return module;
});
