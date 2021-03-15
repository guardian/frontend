import { signInGateMainVariant } from 'common/modules/experiments/tests/sign-in-gate-main-variant';
import { signInGateMainControl } from 'common/modules/experiments/tests/sign-in-gate-main-control';

export const concurrentTests = [
    signInGateMainVariant,
    signInGateMainControl
];
