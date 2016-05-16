/*
This module is responsible for booting the application. It is concatenated with
curl and bootstraps/standard into app.js

Bundles we need to run: commercial + enhanced

Only if we detect we should run enhance.
 */

define(function () {
    var guardian = window.guardian;
    var config = guardian.config;

    var standardBootstrap = ['bootstraps/standard/main'];
    var commercialBootstrap = ['bootstraps/commercial'];
    var enhancedBootstrap = guardian.isEnhanced ? ['bootstraps/enhanced/main'] : [];

    // domReady! is a curl plugin
    require([standardBootstrap, 'domReady!'], function (bootStandard) {
        bootStandard();

        // 'raven' is included in standard already, but we need a reference to it
        require(['raven'].concat(commercialBootstrap, enhancedBootstrap), function (raven, commercialBootrstrap, bootEnhanced) {
            if (bootEnhanced) {
                bootEnhanced();
            }
            if (config.switches.commercial) {
                raven.wrap({tags: { feature: 'commercial' }}, function () {
                    commercialBootrstrap.init();
                });
            }
        })
    });
});
