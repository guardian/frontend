require([
    'domReady',
    'common/utils/ajax',
    'bootstraps/abtests',
    'bootstraps/browserstats',
    'bootstraps/radiator'
], function(
    domReady,
    ajax,
    abTests,
    browserstats,
    radiator
) {
    var config = {
        page: {
            edition: "",
            ajaxUrl: ""
        }
    };

    ajax.init(config);

    domReady(function() {
        var location = window.location.pathname;

        if (location === "/analytics/abtests") {
            abTests.init();
        }
        if (location === "/analytics/browsers") {
            browserstats.init();
        }
        if (location === "/radiator") {
            radiator.init();
        }
    });
});