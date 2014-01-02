require([
    'domReady',
    'bootstraps/abtests',
    'bootstraps/browserstats'
], function(
    domReady,
    abTests,
    browserstats
) {
    domReady(function() {
        if (document.title === "A/B Tests") {
            abTests.init();
        }
        if (document.title === "Browsers") {
            browserstats.init();
        }
    });
});