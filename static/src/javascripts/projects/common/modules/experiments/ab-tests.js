import { signInGateMainVariant } from 'common/modules/experiments/tests/sign-in-gate-main-variant';
import { signInGateMainControl } from 'common/modules/experiments/tests/sign-in-gate-main-control';
import { signInGateCopyOpt } from 'common/modules/experiments/tests/sign-in-gate-copy-opt';
import { curatedContentCarouselTest } from 'common/modules/experiments/tests/curated-content-carousel-test';

export const concurrentTests = [
    signInGateMainVariant,
    signInGateMainControl,
    signInGateCopyOpt,
    curatedContentCarouselTest
];
