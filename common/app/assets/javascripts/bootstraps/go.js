/*global guardian:true */
require([
    'bootstraps/app'
], function(
    bootstrap
) {
    bootstrap.go(guardian.config);
});
