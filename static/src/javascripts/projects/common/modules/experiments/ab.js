// @flow

import {variantFor} from "common/modules/experiments/segment-util";

const runTest = (test: ABTest): void => {
    const variant = variantFor(test);

    if (variant) {
        variant.test(variant.options || {});
    }
};

export const run = (tests: $ReadOnlyArray<ABTest>) => tests.forEach(runTest);
