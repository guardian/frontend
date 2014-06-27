/*global guardian:true */
require([
    'core',
    'bootstraps/app',
    'domReady!'
], function (core, bootstrap) {
    if (guardian.isModernBrowser) {
        bootstrap.go();
    }
});