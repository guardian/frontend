/*
This module is responsible for booting the application. It is concatenated with
curl and bootstraps/standard into app.js

We download the bundles in parallel, but they must be executed
sequentially because each bundle assumes dependencies from the previous
bundle.

Once a bundle has been executed, all of its modules have been registered.
Now we can safely require one of those modules.

Unfortunately we can't do all of this using the curl API, so we use a
combination of ajax/eval/curl instead.

Bundles we need to run: commercial + enhanced

Only if we detect we should run enhance.
 */

define([
    'Promise',
    'domReady',
    'common/utils/raven',
    'common/utils/user-timing',
    'common/utils/robust',
    'common/modules/analytics/google'
], function (
    Promise,
    domReady,
    raven,
    userTiming,
    robust,
    ga
) {
    // curl’s promise API is broken, so we must cast it to a real Promise
    // https://github.com/cujojs/curl/issues/293
    var promiseRequire = function (moduleIds) {
        return Promise.resolve(require(moduleIds));
    };

    var guardian = window.guardian;
    var config = guardian.config;

    var domReadyPromise = new Promise(function (resolve) { domReady(resolve); });

    var bootStandard = function () {
        return promiseRequire(['bootstraps/standard/main'])
            .then(function (boot) {
                userTiming.mark('standard boot');
                robust.catchErrorsAndLog('ga-user-timing-standard-boot', function () {
                    ga.trackPerformance('Javascript Load', 'standardBoot', 'Standard boot time');
                });
                boot();
            });
    };

    var bootCommercial = function () {
        if (!config.switches.commercial) {
            return;
        }

        if (config.page.isDev) {
            guardian.adBlockers.onDetect.push(function (isInUse) {
                var needsMessage = isInUse && window.console && window.console.warn;
                var message = 'Do you have an adblocker enabled? Commercial features might fail to run, or throw exceptions.';
                if (needsMessage) {
                    window.console.warn(message);
                }
            });
        }

        userTiming.mark('commerical request');
        robust.catchErrorsAndLog('ga-user-timing-commercial-request', function () {
            ga.trackPerformance('Javascript Load', 'commericalRequest', 'Commerical request time');
        });

        return promiseRequire(['bootstraps/commercial'])
            .then(raven.wrap(
                    { tags: { feature: 'commercial' } },
                    function (commercial) {
                        userTiming.mark('commerical boot');
                        robust.catchErrorsAndLog('ga-user-timing-commercial-boot', function () {
                            ga.trackPerformance('Javascript Load', 'commericalBoot', 'Commerical boot time');
                        });
                        commercial.init();
                    }
                )
            );
    };

    var bootEnhanced = function () {
        if (guardian.isEnhanced) {
            userTiming.mark('enhanced request');
            robust.catchErrorsAndLog('ga-user-timing-enhanced-request', function () {
                ga.trackPerformance('Javascript Load', 'enhancedRequest', 'Enhanced request time');
            });

            return promiseRequire(['bootstraps/enhanced/main'])
                .then(function (boot) {
                    userTiming.mark('enhanced boot');
                    robust.catchErrorsAndLog('ga-user-timing-enhanced-boot', function () {
                        ga.trackPerformance('Javascript Load', 'enhancedBoot', 'Enhanced boot time');
                    });
                    boot();
                });
        }
    };

    domReadyPromise
        .then(bootStandard)
        .then(bootCommercial)
        .then(bootEnhanced);
});
