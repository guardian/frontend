/*global guardian */
define(['common/bootstraps/app'], function(app) {
    if (guardian.isModernBrowser) {
        window.onload = function() {
            app.go();
        };
    }
});