/**
 * A regionalised container for all the commercial tags.
 */
define([
    'Promise',
    'common/utils/config',
    'common/utils/mediator',
    'common/modules/commercial/third-party-tags/audience-science',
    'common/modules/commercial/third-party-tags/audience-science-gateway',
    'common/modules/commercial/third-party-tags/criteo',
    'common/modules/commercial/third-party-tags/imr-worldwide',
    'common/modules/commercial/third-party-tags/remarketing',
    'common/modules/commercial/third-party-tags/krux',
    'common/modules/commercial/third-party-tags/outbrain'
], function (
    Promise,
    config,
    mediator,
    audienceScience,
    audienceScienceGateway,
    criteo,
    imrWorldwide,
    remarketing,
    krux,
    outbrain
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

        audienceScience.load();
        criteo.load();
        imrWorldwide.load();
        remarketing.load();
        krux.load();

        mediator.once('modules:commercial:dfp:alladsrendered', function () {
            loadLater();
        });

        return Promise.resolve(null);
    }

    function loadLater() {
        outbrain.load();
    }

    return {
        init: init
    };
});
