// @flow

import type { PrebidSlot } from 'commercial/modules/prebid/types';

export const slots: PrebidSlot[] = [
    {
        key: 'top-above-nav',
        sizes: [[970, 250], [728, 90]],
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
        sizes: [[300, 600], [300, 250]],
        labelAny: ['mobile', 'tablet', 'desktop'],
    },
    {
        key: 'inline1',
        sizes: [[300, 250]],
        labelAny: ['mobile', 'tablet', 'desktop'],
    },
    {
        key: 'inline',
        sizes: [[300, 600], [300, 250]],
        labelAll: ['desktop', 'article'],
    },
    {
        key: 'inline',
        sizes: [[300, 250]],
        labelAll: ['desktop', 'non-article'],
    },
    {
        key: 'inline',
        sizes: [[300, 250]],
        labelAny: ['tablet', 'mobile'],
    },
    {
        key: 'mostpop',
        sizes: [[300, 250]],
        labelAny: ['mobile', 'tablet', 'desktop'],
    },
];
