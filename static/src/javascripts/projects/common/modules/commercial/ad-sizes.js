define(function () {
    var adSizes = {
        // standard ad sizes
        billboard:              AdSize(970, 250),
        leaderboard:            AdSize(728, 90),
        mpu:                    AdSize(300, 250),
        halfPage:               AdSize(300, 600),
        portrait:               AdSize(300, 1050),

        // dfp proprietary ad sizes
        fluid:                  AdSize(0, 0),

        // guardian proprietary ad sizes
        badge:                  AdSize(140, 90),
        merchandisingHigh:      AdSize(88, 87),
        merchandising:          AdSize(88, 88),
        inlineMerchandising:    AdSize(88, 85),
        fabric:                 AdSize(88, 71),
        fluid250:               AdSize(88, 70),
        outOfPage:              AdSize(1, 1)
    };
    adSizes['970x250'] = adSizes.billboard;
    adSizes['728x90'] = adSizes.leaderboard;
    adSizes['300x250'] = adSizes.mpu;
    adSizes['300x600'] = adSizes.halfPage;
    adSizes['300x1050'] = adSizes.portrait;

    return adSizes;

    function AdSize(width, height) {
        function toString() {
            return width === height && height === 0 ? 'fluid' : width + ',' + height;
        }

        return Object.freeze({
            width: width,
            height: height,
            toString: toString
        });
    }
});
