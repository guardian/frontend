import { signInGateMainVariant } from 'common/modules/experiments/tests/sign-in-gate-main-variant';
import { signInGateMainControl } from 'common/modules/experiments/tests/sign-in-gate-main-control';
import { signInGateDesignOpt } from 'common/modules/experiments/tests/sign-in-gate-design-opt';
import { xaxisPrebidTest } from 'common/modules/experiments/tests/updated-xaxis-prebid';

export const concurrentTests = [
    signInGateMainVariant,
    signInGateMainControl,
    signInGateDesignOpt,
    xaxisPrebidTest,
];
