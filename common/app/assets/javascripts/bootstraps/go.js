/*global guardian:true */
require([
    'common/utils/config',
    'common/modules/analytics/errors',
    'common/utils/polyfill',
    'common/bootstraps/app'
], function(
    config,
    errors,
    polyfills,
    bootstrap
) {

    var attachGlobalErrorHandler = function (config) {
        if (!config.switches.clientSideErrors) {
            return false;
        }
        errors.init({
            isDev: config.page.isDev,
            buildNumber: config.page.buildNumber
        });
    };

    if (guardian.isModernBrowser) {
        attachGlobalErrorHandler(config);
        polyfills.load();
        bootstrap.go();
    }
});
