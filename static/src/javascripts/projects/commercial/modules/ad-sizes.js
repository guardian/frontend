// @flow

type AdSize = {
    width: number,
    height: number,
    switchUnitId: ?number,
    toString: (_: void) => string,
};

const getAdSize = (
    width: number,
    height: number,
    switchUnitId: ?number
): AdSize => {
    const toString = (): string =>
        width === height && height === 0 ? 'fluid' : `${width},${height}`;

    return Object.freeze({
        width,
        height,
        switchUnitId,
        toString,
    });
};

type SwitchUnitId = {
    mpu: number,
    leaderboard: number,
    billboard: number,
};

const switchUnitId: SwitchUnitId = {
    mpu: 228,
    leaderboard: 229,
    billboard: 229,
};

const adSizes: Object = {
    // standard ad sizes
    billboard: getAdSize(970, 250, switchUnitId.billboard),
    leaderboard: getAdSize(728, 90, switchUnitId.leaderboard),
    mpu: getAdSize(300, 250, switchUnitId.mpu),
    halfPage: getAdSize(300, 600),
    portrait: getAdSize(300, 1050),

    // dfp proprietary ad sizes
    fluid: getAdSize(0, 0),
    outOfPage: getAdSize(1, 1),

    // guardian proprietary ad sizes
    video: getAdSize(620, 1),
    video2: getAdSize(620, 350),
    merchandisingHighAdFeature: getAdSize(88, 89),
    merchandisingHigh: getAdSize(88, 87),
    merchandising: getAdSize(88, 88),
    inlineMerchandising: getAdSize(88, 85),
    fabric: getAdSize(88, 71),
    empty: getAdSize(2, 2),
};

adSizes['970x250'] = adSizes.billboard;
adSizes['728x90'] = adSizes.leaderboard;
adSizes['300x250'] = adSizes.mpu;
adSizes['300x600'] = adSizes.halfPage;
adSizes['300x1050'] = adSizes.portrait;

export default adSizes;
