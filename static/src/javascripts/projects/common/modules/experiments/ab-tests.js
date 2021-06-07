import { signInGateMainVariant } from 'common/modules/experiments/tests/sign-in-gate-main-variant';
import { signInGateMainControl } from 'common/modules/experiments/tests/sign-in-gate-main-control';
import { puzzlesBanner } from 'common/modules/experiments/tests/puzzles-banner';
import { remoteRRHeaderLinksTest } from 'common/modules/experiments/tests/remote-header-test';

export const concurrentTests = [
    signInGateMainVariant,
    signInGateMainControl,
    puzzlesBanner,
    remoteRRHeaderLinksTest,
];
