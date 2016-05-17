/*
This module is responsible for booting the application. It is concatenated with
curl and bootstraps/standard into app.js

Bundles we need to run: commercial + enhanced

Only if we detect we should run enhance.
 */

define([
    'domReady'
], function (
    domReady
) {
    var guardian = window.guardian;
    var config = guardian.config;

    var enhancedBootstrap = guardian.isEnhanced ? ['bootstraps/enhanced/main'] : [];

    domReady(function () {
        require(['bootstraps/standard/main'], function (bootStandard) {
            bootStandard();

            // 'raven' is included in standard already, but we need a reference to it
            require(['raven', 'bootstraps/commercial'].concat(enhancedBootstrap), function (raven, commercialBootstrap, bootEnhanced) {
                if (bootEnhanced) {
                    bootEnhanced();
                }
                if (config.switches.commercial) {
                    raven.context({tags: { feature: 'commercial' }}, commercialBootstrap.init);
                }
            });
        });
    });
});
