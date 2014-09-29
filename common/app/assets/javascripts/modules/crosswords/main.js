define([
    'common/utils/$'
], function (
    $
) {
    return function () {
        $('.js-crossword').each(function (element) {
            if (element.hasAttribute('data-crossword-data')) {
                var crosswordData = JSON.parse(element.getAttribute('data-crossword-data'));

                console.log("Found crossword data for " + crosswordData.name);
            } else {
                console.warn("JavaScript crossword without associated data", element);
            }
        });
    };
});
