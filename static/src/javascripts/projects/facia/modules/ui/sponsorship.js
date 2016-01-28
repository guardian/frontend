define([
    'bean',
    'bonzo',
    'fastdom',
    'Promise',
    'qwery',
    'lodash/collections/map',
    'lodash/objects/isEqual'
], function (
    bean,
    bonzo,
    fastdom,
    Promise,
    qwery,
    map,
    isEqual
) {
    var keyPressHistory = [],
        cheatCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65],
        tones = map([
            'special-report',
            'live',
            'dead',
            'feature',
            'editorial',
            'comment',
            'podcast',
            'media',
            'analysis',
            'review',
            'letters',
            'external',
            'news'
        ], function (tone) {
            return 'tone-' + tone + '--item';
        });

    function listenForCheatCode() {
        return new Promise(function (resolve) {
            var onKeyDown = function (event) {
                keyPressHistory.push(event.keyCode);

                if (isEqual(cheatCode.slice(0, keyPressHistory.length), keyPressHistory)) {
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
        var $items = map(qwery('.js-fc-item'), bonzo);
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
