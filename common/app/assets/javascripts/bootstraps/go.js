/*global guardian:true */
require([
    'core',
    'domReady!'
], function (core) {

    require(['bootstraps/app'], function(bootstrap) {
        if (guardian.isModernBrowser) {
            bootstrap.go();
        }
    });
});