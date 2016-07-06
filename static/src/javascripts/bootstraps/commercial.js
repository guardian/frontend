define([
    'Promise',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/robust',
    'common/utils/user-timing',
    'common/modules/commercial/article-aside-adverts',
    'common/modules/commercial/article-body-adverts',
    'common/modules/commercial/badges',
    'common/modules/commercial/close-disabled-slots',
    'common/modules/commercial/dfp/init',
    'common/modules/commercial/dfp/load',
    'common/modules/commercial/dfp/sponsorships',
    'common/modules/commercial/front-commercial-components',
    'common/modules/commercial/hosted-video',
    'common/modules/commercial/hosted-gallery',
    'common/modules/commercial/slice-adverts',
    'common/modules/commercial/third-party-tags',
    'common/modules/commercial/paidfor-band',
    'common/modules/commercial/paid-containers',
    'common/modules/commercial/dfp/private/ophan-tracking'
], function (
    Promise,
    config,
    mediator,
    robust,
    userTiming,
    articleAsideAdverts,
    articleBodyAdverts,
    badges,
    closeDisabledSlots,
    dfpInit,
    dfpLoad,
    sponsorships,
    frontCommercialComponents,
    hostedVideo,
    hostedGallery,
    sliceAdverts,
    thirdPartyTags,
    paidforBand,
    paidContainers,
    ophanTracking
) {
    var primaryModules = [
        ['cm-init', dfpInit],
        ['cm-articleAsideAdverts', articleAsideAdverts.init],
        ['cm-articleBodyAdverts', articleBodyAdverts.init],
        ['cm-sliceAdverts', sliceAdverts.init],
        ['cm-frontCommercialComponents', frontCommercialComponents.init],
        ['cm-closeDisabledSlots', closeDisabledSlots.init]
    ];

    var secondaryModules = [
        ['cm-load', dfpLoad],
        ['cm-thirdPartyTags', thirdPartyTags.init],
        ['cm-sponsorships', sponsorships.init],
        ['cm-hostedVideo', hostedVideo.init],
        ['cm-hostedGallery', hostedGallery.init],
        ['cm-paidforBand', paidforBand.init],
        ['cm-paidContainers', paidContainers.init],
        ['cm-ready', function () {
            mediator.emit('page:commercial:ready');
            userTiming.mark('commercial end');
            return Promise.resolve();
        }]
    ];

    if (!(config.switches.staticBadges && config.switches.staticContainerBadges)) {
        primaryModules.push(['cm-badges', badges.init]);
    }

    return {
        init: function () {
            if (!config.switches.commercial) {
                return;
            }

            userTiming.mark('commercial start');
            ophanTracking.addBaseline('start');

            var modulePromises = [];

            primaryModules.forEach(function (pair) {

                var moduleName = pair[0];

                robust.catchErrorsAndLog(moduleName, function () {
                    var modulePromise = pair[1]();
                    modulePromise.then(function(){

                        ophanTracking.checkpoint(moduleName, 'start');
                    });

                    modulePromises.push(modulePromise);
                });
            });

            Promise.all(modulePromises).then(function () {
                ophanTracking.addBaseline('secondary');

                secondaryModules.forEach(function (pair) {
                    var moduleName = pair[0];

                    robust.catchErrorsAndLog(moduleName, function () {
                        var modulePromise = pair[1]();

                        modulePromise.then(function(){
                            var timer = new Date().getTime();
                            ophanTracking.checkpoint(moduleName, 'secondary');
                        });
                    });
                });
            });
        }
    };

});
