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
        cascade:                AdSize(940, 230),
        superHeader:            AdSize(900, 250),
        stickyMpu:              AdSize(300, 251),
        badge:                  AdSize(140, 90),
        merchandising:          AdSize(88, 88),
        inlineMerchandising:    AdSize(88, 85),
        fabric:                 AdSize(88, 71),
        fluid250:               AdSize(88, 70),
        outOfPage:              AdSize(1, 1),

        // api
        find: find
    };

    return adSizes;

    function AdSize(width, height) {
        function toString() {
            return width === height && height === 0 ? 'fluid' : width + ',' + height;
        }

        return Object.freeze({
            width,
            height,
            toString
        });
    }
})
