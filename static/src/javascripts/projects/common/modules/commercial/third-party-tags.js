/**
 * A regionalised container for all the commercial tags.
 */
define([
    'Promise',
    'common/utils/config',
    'common/utils/mediator',
    'common/modules/commercial/third-party-tags/audience-science',
    'common/modules/commercial/third-party-tags/audience-science-gateway',
    'common/modules/commercial/third-party-tags/imr-worldwide',
    'common/modules/commercial/third-party-tags/remarketing',
    'common/modules/commercial/third-party-tags/krux',
    'common/modules/commercial/third-party-tags/outbrain',
    'common/modules/commercial/third-party-tags/pointroll-resp-lib'
], function (
    Promise,
    config,
    mediator,
    audienceScience,
    audienceScienceGateway,
    imrWorldwide,
    remarketing,
    krux,
    outbrain,
    pointroll
) {

    function init() {

        if (config.page.contentType === 'Identity' || config.page.section === 'identity') {
            return false;
        }

        switch (config.page.edition.toLowerCase()) {
            case 'uk':
                audienceScienceGateway.load();
                break;
        }

        if (config.switch.thirdPartiesLaterSwitch) {
            mediator.once('modules:commercial:dfp:alladsrendered', function () {
                loadOther();
            });
        } else {
            pointroll.load();
            loadOther();
        }

        return Promise.resolve(null);
    }

    function loadOther() {
        outbrain.load();
        audienceScience.load();
        imrWorldwide.load();
        remarketing.load();
        krux.load();
    }

    return {
        init: init
    };
});
