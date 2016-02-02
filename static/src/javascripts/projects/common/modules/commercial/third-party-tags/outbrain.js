define([
    'Promise',
    'common/utils/fastdom-promise',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/template',
    'common/modules/identity/api',
    'common/modules/commercial/commercial-features',
    'common/modules/commercial/third-party-tags/outbrain-codes',
    'text!common/views/commercial/outbrain.html'
], function (
    Promise,
    fastdom,
    $,
    config,
    detect,
    mediator,
    template,
    identity,
    commercialFeatures,
    getCode,
    outbrainStr
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
        }
    };

    function build(codes, breakpoint) {
        var html = outbrainTpl({ widgetCode: codes.code || codes.image });
        if (breakpoint !== 'mobile') {
            html += outbrainTpl({ widgetCode: codes.code || codes.text });
        }
        return html;
    }

    function load(target) {
        var slot          = target in selectors ? target : 'defaults';
        var $outbrain     = $(selectors.outbrain.widget);
        var $container    = $(selectors.outbrain.container, $outbrain[0]);
        var breakpoint    = detect.getBreakpoint();
        var widgetCodes, widgetHtml;

        widgetCodes = getCode({
            slot: slot,
            section: config.page.section,
            edition: config.page.edition,
            breakpoint: breakpoint
        });
        widgetHtml = build(widgetCodes, breakpoint);
        return fastdom.write(function () {
            if (slot !== 'defaults') {
                $(selectors[slot].widget).replaceWith($outbrain[0]);
            }
            $container.append(widgetHtml);
            $outbrain.css('display', 'block');
        }).then(function () {
            module.tracking(widgetCodes.code || widgetCodes.image);
            require(['js!' + outbrainUrl]);
        });
    }

    function tracking(widgetCode) {
        // Ophan
        require(['ophan/ng'], function (ophan) {
            ophan.record({
                outbrain: {
                    widgetId: widgetCode
                }
            });
        });
    }

    function trackAd(id) {
        return new Promise(function (resolve, reject) {
            var onAdLoaded = function (event) {
                if (event.slot.getSlotElementId() === id) {
                    unlisten();
                    resolve(!event.isEmpty);
                }
            };

            var onAllAdsLoaded = function () {
                unlisten();
                reject(new Error('Unable to load Outbrain widget: slot ' + id + ' was never loaded'));
            };

            function unlisten() {
                mediator.off('modules:commercial:dfp:rendered', onAdLoaded);
                mediator.off('modules:commercial:dfp:alladsrendered', onAllAdsLoaded);
            }

            mediator.on('modules:commercial:dfp:rendered', onAdLoaded);
            mediator.on('modules:commercial:dfp:alladsrendered', onAllAdsLoaded);
        });
    }

    function identityPolicy() {
        return !(identity.isUserLoggedIn() && config.page.commentable);
    }

    /*
        Loading Outbrain is dependent on successful return of high relevance component
        from DFP. AdBlock is blocking DFP calls so we are not getting any response and thus
        not loading Outbrain. As Outbrain is being partially loaded behind the adblock we can
        make the call instantly when we detect adBlock in use.
     */
    function loadInstantly() {
        return !document.getElementById('dfp-ad--merchandising-high') ||
            detect.adblockInUse();
    }

    function init() {
        if (commercialFeatures.outbrain &&
            !config.page.isFront &&
            !config.page.isPreview &&
            identityPolicy()
        ) {
            // if there is no merch component, load the outbrain widget right away
            if (loadInstantly()) {
                module.load();
                return Promise.resolve(true);
            }

            return trackAd('dfp-ad--merchandising-high').then(function (isHiResLoaded) {
                // if the high-priority merch component has loaded, we wait until
                // the low-priority one has loaded to decide if an outbrain widget is loaded
                // if it hasn't loaded, the outbrain widget is loaded at its default
                // location right away
                return Promise.all([
                    isHiResLoaded,
                    isHiResLoaded && config.switches.outbrainReplacesMerch ? trackAd('dfp-ad--merchandising') : true
                ]);
            }).then(function (args) {
                var isHiResLoaded = args[0];
                var isLoResLoaded = args[1];

                if (isHiResLoaded) {
                    if (!isLoResLoaded) {
                        module.load('merchandising');
                    }
                } else {
                    module.load();
                }
            });
        }

        return Promise.resolve(true);
    }

    var module = {
        load: load,
        tracking: tracking,
        init: init
    };

    return module;
});
