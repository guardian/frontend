/*global guardian:true */
require([
    'common/bootstraps/app'
], function(
    bootstrap
) {
    if (guardian.isModernBrowser) {
        bootstrap.go();
    }
});
