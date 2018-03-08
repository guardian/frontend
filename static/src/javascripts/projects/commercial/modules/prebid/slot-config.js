// @flow

import type { PrebidSlot } from 'commercial/modules/prebid/types';

export const slots: PrebidSlot[] = [
    {
        key: 'top-above-nav',
        sizes: [[728, 90], [970, 250]],
        labelAll: ['desktop'],
    },
    {
        key: 'right',
        sizes: [[300, 250], [300, 600]],
        labelAny: ['mobile', 'tablet', 'desktop'],
    },
    {
        key: 'inline',
        sizes: [[300, 250]],
        labelAny: ['mobile', 'tablet', 'desktop'],
    },
    {
        key: 'mostpop',
        sizes: [[300, 250]],
        labelAny: ['mobile', 'tablet', 'desktop'],
    },
];
