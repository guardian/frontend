require([
    'common/utils/ajax',
    'admin/bootstraps/abtests',
    'admin/bootstraps/adunitapproval',
    'admin/bootstraps/browserstats',
    'admin/bootstraps/radiator',
    'admin/bootstraps/commercial'
], function (
    ajax,
    abTests,
    adunitapproval,
    browserstats,
    radiator,
    commercial
) {
    require(['domReady!'], function () {

        var config = {
            page: {
                edition: '',
                ajaxUrl: ''
            }
        };

        ajax.init(config);

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
        }
    });
});
