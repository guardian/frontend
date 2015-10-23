define([
    'common/utils/ajax',
    'admin/bootstraps/abtests',
    'admin/bootstraps/adunitapproval',
    'admin/bootstraps/browserstats',
    'admin/bootstraps/radiator',
    'admin/bootstraps/commercial',
    'admin/bootstraps/commercial/adTests'
], function (
    ajax,
    abTests,
    adunitapproval,
    browserstats,
    radiator,
    commercial,
    adTests
) {

    require(['domReady!'], function () {
        ajax.setHost('');

        switch (window.location.pathname) {
            case '/analytics/abtests':
                abTests.init();
                break;

            case '/analytics/browsers':
                browserstats.init();
                break;

            case '/analytics/commercial':
                commercial.init();
                break;

            case '/radiator':
                radiator.init();
                break;

            case '/commercialtools/adunits/toapprove':
                adunitapproval.init();
                break;

            case '/analytics/commercial/adtests':
                adTests.init();
                break;
        }
    });
});
