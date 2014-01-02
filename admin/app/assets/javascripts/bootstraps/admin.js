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
        if (document.title === "A/B Tests") {
            abTests.init();
        }
        if (document.title === "Browsers") {
            browserstats.init();
        }
        if (document.title === "theguardian.com radiator") {
            radiator.init();
        }
    });
});