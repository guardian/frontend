define([
    'bonzo',
    'common/utils/$'
], function (
    bonzo,
    $
) {
    var deactivateCallbacks = [];

    function dataLinkName(elem) {
        var iterate = function (elem, nameSoFar) {
            if (elem === document.body || !elem) {
                return nameSoFar;
            } else {
                var thisDataLinkName = bonzo(elem).attr('data-link-name');

                if (thisDataLinkName) {
                    return iterate(
                        elem.parentNode,
                        !nameSoFar ? thisDataLinkName : thisDataLinkName + ' | ' + nameSoFar
                    );
                } else {
                    return iterate(
                        elem.parentNode,
                        nameSoFar
                    );
                }
            }
        };

        return iterate(elem, null);
    }

    function activate() {
        $('a').each(function (elem) {
            var $elem = bonzo(elem),
                oldTitle = $elem.attr('title'),
                linkName = dataLinkName(elem);

            if (linkName) {
                $elem.attr('title', linkName);
                deactivateCallbacks.push(function () {
                    $elem.attr('title', oldTitle || "");
                });
            }
        });
    }

    function deactivate() {
        deactivateCallbacks.forEach(function (callback) {
            callback();
        });
    }

    return {
        activate: activate,
        deactivate: deactivate
    };
});
