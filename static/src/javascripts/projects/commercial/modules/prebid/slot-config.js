// @flow

import type { PrebidSlot } from 'commercial/modules/prebid/types';

export const slots: PrebidSlot[] = [
    {
        key: 'top-above-nav',
        sizes: [[728, 90], [970, 250]],
        labelAll: ['desktop'],
    },
    {
        key: 'top-above-nav',
        sizes: [[728, 90]],
        labelAll: ['tablet'],
    },
    {
        key: 'top-above-nav',
        sizes: [[300, 250]],
        labelAll: ['mobile'],
    },
    {
        key: 'right',
        sizes: [[300, 250], [300, 600]],
        labelAny: ['mobile', 'tablet', 'desktop'],
    },
    {
        key: 'inline1',
        sizes: [[300, 250]],
        labelAny: ['mobile', 'tablet', 'desktop'],
    },
    {
        key: 'inline',
        sizes: [[300, 250], [300, 600]],
        labelAll: ['desktop', 'article'],
    },
    {
        key: 'inline',
        sizes: [[300, 250]],
        labelAll: ['desktop', 'non-article'],
    },
    // following won't work yet because of https://github.com/prebid/Prebid.js/issues/2263
    // {
    //     key: 'inline',
    //     sizes: [[300, 250]],
    //     labelAny: ['tablet', 'mobile'],
    // },
    {
        key: 'inline',
        sizes: [[300, 250]],
        labelAll: ['tablet'],
    },
    {
        key: 'inline',
        sizes: [[300, 250]],
        labelAll: ['mobile'],
    },
    {
        key: 'mostpop',
        sizes: [[300, 250]],
        labelAny: ['mobile', 'tablet', 'desktop'],
    },
];
