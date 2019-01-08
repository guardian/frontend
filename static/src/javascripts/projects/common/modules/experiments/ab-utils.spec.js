// @flow
import {
    getRunnableAbTestWhereControlIsRunnable,
    getRunnableAbTestWhereVariantIsRunnable
} from './__fixtures__/ab-test';
import { runnableTestsToParticipations } from './ab-utils';

describe('A/B utils', () => {
    describe('runnableTestsToParticipations', () => {
        it('should set the runnable variant in the participations', () => {
            expect(
                runnableTestsToParticipations([
                    getRunnableAbTestWhereControlIsRunnable('a'),
                    getRunnableAbTestWhereControlIsRunnable('b'),
                ])
            ).toEqual({
                a: {variant: 'control'},
                b: {variant: 'control'},
            });
        });

        it('should filter out non-runnable tests', () => {
            expect(
                runnableTestsToParticipations([
                    getRunnableAbTestWhereControlIsRunnable('c'),
                    getRunnableAbTestWhereVariantIsRunnable('d'),
                ])
            ).toEqual({
                c: {variant: 'control'},
                d: {variant: 'variant'},
            });

        });
    })
});
