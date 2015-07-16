define([
    'common/utils/_',
    'bean',
    'bonzo',
    'fastdom',
    'Promise',
    'qwery'
], function (
    _,
    bean,
    bonzo,
    fastdom,
    Promise,
    qwery
) {
    var keyPressHistory = [],
        cheatCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65],
        tones = _.map([
            "special-report",
            "live",
            "dead",
            "feature",
            "editorial",
            "comment",
            "podcast",
            "media",
            "analysis",
            "review",
            "letters",
            "external",
            "news"
        ], function (tone) {
            return "tone-" + tone + "--item";
        });

    function listenForCheatCode() {
        return new Promise(function (resolve) {
            var onKeyDown = function (event) {
                keyPressHistory.push(event.keyCode);

                if (_.isEqual(cheatCode.slice(0, keyPressHistory.length), keyPressHistory)) {
                    if (keyPressHistory.length === cheatCode.length) {
                        resolve();
                        bean.off(document, 'keydown', onKeyDown);
                    }
                } else {
                    keyPressHistory = [];
                }
            };

            bean.on(document, 'keydown', onKeyDown);
        });
    }

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function randomTone() {
        return tones[randomInt(0, tones.length - 1)];
    }

    function startToneDisco() {
        var $items = _.map(qwery('.js-fc-item'), bonzo);
        console.log("PPPOOOOWWWWWEEEERRRRING UP!!!!");

        setInterval(function () {
            fastdom.write(function () {
                $items.forEach(function ($item) {
                    tones.forEach(function (tone) {
                        $item.removeClass(tone);
                    });

                    $item.addClass(randomTone());
                });
            });
        }, 1000);
    }

    return function () {
        listenForCheatCode().then(startToneDisco);
    };
});