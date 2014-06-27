/*global guardian:true */
require([
    'core',
    'domReady!'
], function () {

    require(['bootstraps/app'], function(bootstrap) {
        if (guardian.isModernBrowser) {
            bootstrap.go();
        }
    });
});