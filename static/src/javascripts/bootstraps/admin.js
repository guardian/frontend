define([
    'admin/bootstraps/abtests',
    'admin/bootstraps/radiator',
    'domReady'
], function (
    abTests,
    radiator,
    domReady
) {
    domReady(function () {
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
