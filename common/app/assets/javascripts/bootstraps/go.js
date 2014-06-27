/*global guardian, redefine, modules*/
redefine(modules);
require([
    'common/bootstraps/app',
    'domReady!'
], function(
    bootstrap
) {
    if (guardian.isModernBrowser) {
        bootstrap.go();
    }
});
