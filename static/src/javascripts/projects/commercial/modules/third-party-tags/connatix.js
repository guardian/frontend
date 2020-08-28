// @flow

import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { connatixTest } from 'common/modules/experiments/tests/connatix-ab-test';

export const connatix: ThirdPartyTag = {
    shouldRun: isInVariantSynchronous(connatixTest, 'variant'),
    url: '//cdn.connatix.com/min/connatix.renderer.infeed.min.js',
    attrs: [
        {
            name: 'data-connatix-token',
            value: '4b6c17d3-68f9-4019-a202-42d8480f08f3',
        },
    ],
    async: true,
};
