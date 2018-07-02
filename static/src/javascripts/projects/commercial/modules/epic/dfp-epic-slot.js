// @flow

import { variantFor } from 'common/modules/experiments/segment-util';
import { getActiveTests } from 'common/modules/experiments/ab-tests';
import { displayDFPEpic } from 'commercial/modules/epic/dfp-epic-slot-utils';
import {
    displayControlEpic,
    trackEpic,
} from 'common/modules/commercial/epic-utils';
import { dfpVariant } from 'common/modules/experiments/tests/acquisitions-epic-native-vs-dfp-v3';

const shouldDisplayDFPEpic = (): boolean => {
    const tests = getActiveTests();
    const dfpTest = tests.find(test => test.id === dfpVariant.name);
    if (dfpTest) {
        const variant = variantFor(dfpTest);
        if (variant) {
            return variant.id === dfpVariant.variant;
        }
    }
    return false;
};

export const initDFPEpicSlot = (): void => {
    if (shouldDisplayDFPEpic()) {
        displayDFPEpic(4000)
            .catch(() => displayControlEpic(dfpVariant))
            .then(trackEpic);
    }
};
