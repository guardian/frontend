import { genAbTest, genVariant } from '../__fixtures__/ab-test';

export const concurrentTests = [
	genAbTest('DummyTest'),
	genAbTest('DummyTest2'),
	genAbTest('DummyTest3CanRunIsFalse', false),
	genAbTest('DummyTest4ControlCanRunIsFalse', true, '9999-01-01', [
		genVariant('control', false),
		genVariant('variant', true),
	]),
];
export const epicTests = [genAbTest('EpicTest'), genAbTest('EpicTest2')];
export const engagementBannerTests = [
	genAbTest('BannerTest'),
	genAbTest('BannerTest2'),
];

export const priorityEpicTest = genAbTest('PriorityEpicTest');
