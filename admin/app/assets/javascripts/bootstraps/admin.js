require([
    'domReady',
    'common/utils/ajax',
    'bootstraps/abtests',
    'bootstraps/browserstats',
    'bootstraps/radiator',
    'bootstraps/commercial'
], function(
    domReady,
    ajax,
    abTests,
    browserstats,
    radiator,
    commercial
) {
    var config = {
        page: {
            edition: "",
            ajaxUrl: ""
        }
    };

    ajax.init(config);

    domReady(function() {
        switch(window.location.pathname) {
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
        }
    });

});
