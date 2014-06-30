/*global guardian:true */
require([
    'core',
    'domReady!'
], function () {

    require(['bootstraps/commercial'], function(commercial) {
        commercial.init();
    });

    require(['bootstraps/app'], function(bootstrap) {
        if (guardian.isModernBrowser) {
            bootstrap.go();
        }
    });
});
