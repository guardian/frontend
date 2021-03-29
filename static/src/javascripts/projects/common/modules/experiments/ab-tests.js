import { signInGateMainVariant } from 'common/modules/experiments/tests/sign-in-gate-main-variant';
import { signInGateMainControl } from 'common/modules/experiments/tests/sign-in-gate-main-control';
import { puzzlesBanner } from 'common/modules/experiments/tests/puzzles-banner';

export const concurrentTests = [
    signInGateMainVariant,
    signInGateMainControl,
    puzzlesBanner
];
