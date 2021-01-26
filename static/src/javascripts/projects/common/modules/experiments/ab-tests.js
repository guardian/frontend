import { signInGateMainVariant } from 'common/modules/experiments/tests/sign-in-gate-main-variant';
import { signInGateMainControl } from 'common/modules/experiments/tests/sign-in-gate-main-control';
import { signInGateDesignOpt } from 'common/modules/experiments/tests/sign-in-gate-design-opt';
import { globalEoyHeaderTest } from 'common/modules/experiments/tests/global-eoy-header-test';

export const concurrentTests = [
    signInGateMainVariant,
    signInGateMainControl,
    signInGateDesignOpt,
    globalEoyHeaderTest,
];
