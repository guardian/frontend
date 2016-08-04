define([
    'common/utils/ajax',
    'admin/bootstraps/abtests',
    'admin/bootstraps/radiator',
    'domReady'
], function (
    ajax,
    abTests,
    adunitapproval,
    radiator,
    domReady
) {

    domReady(function () {
        ajax.setHost('');

        switch (window.location.pathname) {
            case '/analytics/abtests':
                abTests.init();
                break;

            case '/radiator':
                radiator.init();
                break;
        }
    });
});
