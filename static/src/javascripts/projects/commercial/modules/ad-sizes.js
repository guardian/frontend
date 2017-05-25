// @flow
import type { GuAdSize, SwitchUnitId } from 'commercial/types';
import {
    mpuUnitId,
    leaderboardUnitId,
    billboardUnitId,
} from 'commercial/types';

const getAdSize = (
    width: number,
    height: number,
    switchUnitId: ?SwitchUnitId
): GuAdSize => {
    const toString = (): string =>
        width === height && height === 0 ? 'fluid' : `${width},${height}`;

    return Object.freeze({
        width,
        height,
        switchUnitId,
        toString,
    });
};

const adSizes: Object = {
    // standard ad sizes
    billboard: getAdSize(970, 250, billboardUnitId),
    leaderboard: getAdSize(728, 90, leaderboardUnitId),
    mpu: getAdSize(300, 250, mpuUnitId),
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
