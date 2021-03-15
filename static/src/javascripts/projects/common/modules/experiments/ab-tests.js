import { signInGateMainVariant } from 'common/modules/experiments/tests/sign-in-gate-main-variant';
import { signInGateMainControl } from 'common/modules/experiments/tests/sign-in-gate-main-control';
import {signInGateMandoryTest} from "common/modules/experiments/tests/sign-in-gate-mandatory";

export const concurrentTests = [
    signInGateMainVariant,
    signInGateMainControl,
    signInGateMandoryTest
];
