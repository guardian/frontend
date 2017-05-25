// @flow
import { genAbTest } from '../__fixtures__/ab-test';

export const TESTS = [genAbTest('DummyTest'), genAbTest('DummyTest2')];

export const getActiveTests = () => TESTS;
