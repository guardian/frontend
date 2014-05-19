/*global guardian:true */
require([
    'common/utils/config',
    'common/utils/mediator',
    'common/modules/analytics/errors',
    'common/utils/polyfill',
    'common/bootstraps/app'
], function(
    config,
    mediator,
    Errors,
    polyfills,
    bootstrap
) {

    var attachGlobalErrorHandler = function (config) {
        if (!config.switches.clientSideErrors) {
            return false;
        }
        var e = new Errors({
            isDev: config.page.isDev,
            buildNumber: config.page.buildNumber
        });
        e.init();
        mediator.on('module:error', e.log);
    };


    if (guardian.isModernBrowser) {
        attachGlobalErrorHandler(config);
        polyfills.load();
        bootstrap.go();
    }
});
