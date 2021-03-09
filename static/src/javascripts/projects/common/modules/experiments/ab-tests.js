import { signInGateMainVariant } from 'common/modules/experiments/tests/sign-in-gate-main-variant';
import { signInGateMainControl } from 'common/modules/experiments/tests/sign-in-gate-main-control';
import { signInGateCopyOpt } from 'common/modules/experiments/tests/sign-in-gate-copy-opt';

export const concurrentTests = [
    signInGateMainVariant,
    signInGateMainControl,
    signInGateCopyOpt
];
