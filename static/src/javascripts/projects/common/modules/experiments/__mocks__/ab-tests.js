// @flow
import { genAbTest } from '../__fixtures__/ab-test';

export const concurrentTests = [genAbTest('DummyTest'), genAbTest('DummyTest2')];
export const epicTests = [genAbTest('EpicTest'), genAbTest('EpicTest2')];
export const engagementBannerTests = [genAbTest('BannerTest'), genAbTest('BannerTest2')];
