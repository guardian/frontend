// @flow
import type { GuAdSize } from 'commercial/types';

const getAdSize = (width: number, height: number): GuAdSize => {
    const toString = (): string =>
        width === height && height === 0 ? 'fluid' : `${width},${height}`;

    return Object.freeze({
        width,
        height,
        toString,
    });
};

const adSizes: Object = {
    // standard ad sizes
    billboard: getAdSize(970, 250),
    leaderboard: getAdSize(728, 90),
    mpu: getAdSize(300, 250),
    halfPage: getAdSize(300, 600),
    portrait: getAdSize(300, 1050),
    skyscraper: getAdSize(160, 600),
    mobilesticky: getAdSize(320, 50),

    // dfp proprietary ad sizes
    fluid: getAdSize(0, 0),
    outOfPage: getAdSize(1, 1),
    googleCard: getAdSize(300, 274),

    // guardian proprietary ad sizes
    video: getAdSize(620, 1),
    outstreamDesktop: getAdSize(620, 350),
    outstreamMobile: getAdSize(300, 197),
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
adSizes['160x600'] = adSizes.skyscraper;

export { adSizes };
