require([
    'domReady',
    'bootstraps/abtests'
], function(
    domReady,
    abTests
) {
    domReady(function() {
        if (document.title === "A/B Tests") {
            abTests.init();
        }
    });
});