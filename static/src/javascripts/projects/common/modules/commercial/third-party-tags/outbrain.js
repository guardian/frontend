define([
    'Promise',
    'common/utils/fastdom-promise',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/template',
    'common/modules/identity/api',
    'common/modules/commercial/third-party-tags/outbrain-codes',
    'common/modules/commercial/third-party-tags/outbrain-sections',
    'text!common/views/commercial/outbrain.html',
    'lodash/collections/map'
], function (
    Promise,
    fastdom,
    $,
    config,
    detect,
    mediator,
    template,
    identity,
    getCode,
    getSection,
    outbrainStr,
    map
) {
    var outbrainUrl = '//widgets.outbrain.com/outbrain.js';
    var outbrainTpl = template(outbrainStr);

    var selectors = {
        outbrain: { widget: '.js-outbrain', container: '.js-outbrain-container' },
        merchandising: { widget: '#dfp-ad--merchandising', container: '#dfp-ad--merchandising' }
    };

    function build(codes, breakpoint) {
        var html = outbrainTpl({ widgetCode: codes.code || codes.image });
        if (breakpoint !== "mobile") {
            html += outbrainTpl({ widgetCode: codes.code || codes.text });
        }
        return html;
    }

    function load(target) {
        var slot          = target || 'outbrain',
            $outbrain     = $(selectors[slot].widget),
            $container    = $(selectors[slot].container),
            breakpoint    = detect.getBreakpoint(),
            widgetCodes,
            widgetHtml;

        widgetCodes = getCode({
            slot: slot,
            section: getSection(config.page.section),
            edition: config.page.edition,
            breakpoint: breakpoint
        });
        widgetHtml = build(widgetCodes, breakpoint);
        $container.append(widgetHtml);
        tracking(widgetCodes.code || widgetCodes.image);
        require(['js!' + outbrainUrl], function () {
            fastdom.write(function () {
                $outbrain.css('display', 'block');
            });
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
                    off();
                    resolve(!event.isEmpty);
                }
            };

            var onAllAdsLoaded = function () {
                off();
                reject(new Error('Unable to load Outbrain widget: slot ' + id + ' was never loaded'));
            };

            function off() {
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

    return {
        load: load,
        tracking: tracking,
        getSection: getSection,

        init: function () {
            if (config.switches.outbrain
                && !config.page.isFront
                && !config.page.isPreview
                && config.page.section !== 'childrens-books-site'
                && identityPolicy()
            ) {
                // if there is no merch component, load the outbrain widget right away
                if (!document.getElementById('dfp-ad--merchandising-high')) {
                    load();
                    return;
                }

                trackAd('dfp-ad--merchandising-high').then(function (isHiResLoaded) {
                    // if the high-priority merch component has loaded, we wait until
                    // the low-priority one has loaded to decide if an outbrain widget is loaded
                    // if it hasn't loaded, the outbrain widget is loaded at its default
                    // location right away
                    return Promise.all([
                        isHiResLoaded,
                        isHiResLoaded ? trackAd('dfp-ad--merchandising') : false
                    ]);
                }).then(function (args) {
                    var isHiResLoaded = args[0];
                    var isLoResLoaded = args[1];

                    if (isHiResLoaded) {
                        if (!isLoResLoaded) {
                            load('merchandising');
                        }
                    } else {
                        load();
                    }
                });
            }
        }
    };
});
