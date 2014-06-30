/*global guardian:true */
require([
    'core',
    'domReady!'
], function () {

    require(['bootstraps/app'], function(bootstrap) {

        bootstrap.commercial();

        if (guardian.isModernBrowser) {
            bootstrap.go();
        }
    });
});
