/**
 * Third party tags that don't need to be run at the page load.
 */
define([
    'Promise',
    'common/utils/config',
    'common/modules/commercial/third-party-tags/outbrain'
], function (
    Promise,
    config,
    outbrain
) {

    function init() {
        if (config.page.contentType === 'Identity' || config.page.section === 'identity') {
            return false;
        }

        mediator.once('modules:commercial:dfp:rendered', function () {
            loadThirdParties();
        });
    }

    function loadThirdParties() {
        outbrain.load();
    }

    return {
        init: init
    };
});
