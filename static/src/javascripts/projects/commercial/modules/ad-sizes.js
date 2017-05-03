var switchUnitId = {
    mpu: 228,
    leaderboard: 229,
    billboard: 229
};
var adSizes = {
    // standard ad sizes
    billboard: AdSize(970, 250, switchUnitId.billboard),
    leaderboard: AdSize(728, 90, switchUnitId.leaderboard),
    mpu: AdSize(300, 250, switchUnitId.mpu),
    halfPage: AdSize(300, 600),
    portrait: AdSize(300, 1050),

    // dfp proprietary ad sizes
    fluid: AdSize(0, 0),
    outOfPage: AdSize(1, 1),

    // guardian proprietary ad sizes
    video: AdSize(620, 1),
    video2: AdSize(620, 350),
    merchandisingHighAdFeature: AdSize(88, 89),
    merchandisingHigh: AdSize(88, 87),
    merchandising: AdSize(88, 88),
    inlineMerchandising: AdSize(88, 85),
    fabric: AdSize(88, 71),
    empty: AdSize(2, 2)
};
adSizes['970x250'] = adSizes.billboard;
adSizes['728x90'] = adSizes.leaderboard;
adSizes['300x250'] = adSizes.mpu;
adSizes['300x600'] = adSizes.halfPage;
adSizes['300x1050'] = adSizes.portrait;

export default adSizes;

function AdSize(width, height, switchUnitId) {
    function toString() {
        return width === height && height === 0 ? 'fluid' : width + ',' + height;
    }

    return Object.freeze({
        width: width,
        height: height,
        switchUnitId: switchUnitId,
        toString: toString
    });
}
