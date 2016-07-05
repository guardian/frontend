define([
    'Promise',
    'common/utils/fastdom-promise',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/template',
    'common/modules/identity/api',
    'common/modules/commercial/dfp/track-ad-render',
    'common/modules/commercial/commercial-features',
    'common/modules/commercial/third-party-tags/outbrain-codes',
    'text!common/views/commercial/outbrain.html',
    'common/modules/email/run-checks'
], function (
    Promise,
    fastdom,
    $,
    config,
    detect,
    template,
    identity,
    trackAdRender,
    commercialFeatures,
    getCode,
    outbrainStr,
    emailRunChecks
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
        email: {
            widget: '.js-outbrain',
            container: '.js-outbrain-container'
        }
    };

    var emailSignupPromise;

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
        return fastdom.write(function () {
            if (slot === 'merchandising') {
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
            detect.adblockInUseSync();
    }

    function checkEmailSignup() {
        if (!emailSignupPromise) {
            emailSignupPromise = new Promise(function (resolve) {
                if (config.switches.emailInArticleOutbrain &&
                    emailRunChecks.getEmailInserted() &&
                    emailRunChecks.getEmailShown() === 'theGuardianToday') {
                    // The Guardian today email is already there
                    // so load the merchandising component
                    resolve('email');
                } else if (config.switches.emailInArticleOutbrain && emailRunChecks.allEmailCanRun()) {
                    // We need to check the user's email subscriptions
                    // so we don't insert the sign-up if they've already subscribed.
                    // This is an async API request and returns a promise.
                    emailRunChecks.getUserEmailSubscriptions().then(function () {
                        // Check if the Guardian today list can run, if it can then load
                        // the merchandising (non-compliant) version of Outbrain
                        emailRunChecks.listCanRun({listName: 'theGuardianToday', listId: 37 }) ? resolve('email') : resolve();
                    });
                } else {
                    resolve();
                }
            });
        }

        return emailSignupPromise;
    }

    function init() {
        if (commercialFeatures.outbrain &&
            !config.page.isFront &&
            !config.page.isPreview &&
            identityPolicy()
        ) {
            // if there is no merch component, load the outbrain widget right away
            if (loadInstantly()) {
                return checkEmailSignup().then(function (widgetType) {
                    widgetType ? module.load(widgetType) : module.load();
                    return Promise.resolve(true);
                });
            }

            return trackAdRender('dfp-ad--merchandising-high').then(function (isHiResLoaded) {
                // if the high-priority merch component has loaded, we wait until
                // the low-priority one has loaded to decide if an outbrain widget is loaded
                // if it hasn't loaded, the outbrain widget is loaded at its default
                // location right away
                return Promise.all([
                    isHiResLoaded,
                    isHiResLoaded ? trackAdRender('dfp-ad--merchandising') : true
                ]);
            }).then(function (args) {
                var isHiResLoaded = args[0];
                var isLoResLoaded = args[1];

                if (isHiResLoaded) {
                    if (!isLoResLoaded) {
                        module.load('merchandising');
                    }
                } else {
                    checkEmailSignup().then(function (widgetType) {
                        widgetType ? module.load(widgetType) : module.load();
                    });
                }
            });
        }

        return Promise.resolve(true);
    }

    return module;
});
