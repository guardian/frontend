import {
    genAbTest,
    genRunnableAbTestWhereControlIsRunnable,
    genRunnableAbTestWhereVariantIsRunnable,
    genVariant,
} from './__fixtures__/ab-test';
import {
    runnableTestsToParticipations,
    testAndParticipationsToVariant,
    testExclusionsWhoseSwitchExists,
} from './ab-utils';
import { NOT_IN_TEST } from './ab-constants';

describe('A/B utils', () => {
    describe('runnableTestsToParticipations', () => {
        it('should set the runnable variant in the participations', () => {
            expect(
                runnableTestsToParticipations([
                    genRunnableAbTestWhereControlIsRunnable('a'),
                    genRunnableAbTestWhereControlIsRunnable('b'),
                ])
            ).toEqual({
                a: { variant: 'control' },
                b: { variant: 'control' },
            });

            expect(
                runnableTestsToParticipations([
                    genRunnableAbTestWhereControlIsRunnable('c'),
                    genRunnableAbTestWhereVariantIsRunnable('d'),
                ])
            ).toEqual({
                c: { variant: 'control' },
                d: { variant: 'variant' },
            });
        });
    });

    describe('testExclusionsWhoseSwitchExists', () => {
        /* eslint guardian-frontend/global-config: "off" */
        /* eslint guardian-frontend/no-direct-access-config: "off" */
        beforeEach(() => {
            window.guardian.config.switches = {};
        });
        it('should filter out non-NOT_IN_TEST variants', () => {
            window.guardian.config.switches.abSwitchExists = false;
            window.guardian.config.switches.abSwitchExists2 = true;

            expect(
                testExclusionsWhoseSwitchExists({
                    SwitchExists: { variant: NOT_IN_TEST },
                    SwitchExists2: { variant: NOT_IN_TEST },
                    SwitchExists3: { variant: 'real' },
                })
            ).toEqual({
                SwitchExists: { variant: NOT_IN_TEST },
                SwitchExists2: { variant: NOT_IN_TEST },
            });
        });

        it('should exclude NOT_IN_TEST variants whose switch does not exist', () => {
            expect(
                testExclusionsWhoseSwitchExists({
                    SwitchExists: { variant: NOT_IN_TEST },
                    SwitchExists2: { variant: NOT_IN_TEST },
                    SwitchExists3: { variant: 'real' },
                })
            ).toEqual({});
        });
    });

    describe('testAndParticipationsToVariant', () => {
        it('should return the NOT_IN_TEST variant if present', () => {
            const notInTestVariant = genVariant(NOT_IN_TEST);
            expect(
                testAndParticipationsToVariant(
                    genAbTest('a', true, '9999-12-12', [
                        genVariant('control'),
                        notInTestVariant,
                    ]),
                    {
                        a: { variant: NOT_IN_TEST },
                        b: { variant: 'hey' },
                    }
                )
            ).toHaveProperty('id', NOT_IN_TEST);
        });

        it('should return a normal variant if no NOT_IN_TEST variant present', () => {
            const variant = genVariant('Variant');
            expect(
                testAndParticipationsToVariant(
                    genAbTest('b', true, '9999-12-12', [
                        genVariant('control'),
                        variant,
                    ]),
                    {
                        a: { variant: 'hey' },
                        b: { variant: 'Variant' },
                    }
                )
            ).toEqual(variant);
        });
    });
});
