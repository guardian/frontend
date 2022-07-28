import {
    genAbTest,
    genVariant,
} from 'common/modules/experiments/__fixtures__/ab-test';
import { runnableTest } from 'common/modules/experiments/ab-core';
import {
    clearParticipations,
    setParticipationsInLocalStorage,
} from 'common/modules/experiments/ab-local-storage';
import { _, getMvtValue } from '../analytics/mvt-cookie';
import { runnableTestsToParticipations } from 'common/modules/experiments/ab-utils';

const { overwriteMvtCookie } = _

jest.mock('common/modules/experiments/ab-tests');

jest.mock('common/modules/experiments/ab', () => ({
    logAutomatEvent: () => {},
}));

/* eslint guardian-frontend/global-config: "off" */
/* eslint guardian-frontend/no-direct-access-config: "off" */
const cfg = window.guardian.config;

describe('A/B tests', () => {
    beforeEach(() => {
        cfg.page = {};
        cfg.page.isSensitive = false;
        cfg.switches = {
            abDummyTest: true,
        };
        overwriteMvtCookie(1234);
        window.location.hash = '';
        setParticipationsInLocalStorage({});
    });

    describe('runnableTest', () => {
        test('should return null for an expired test', () => {
            const expiredTest = genAbTest('DummyTest', true, '2000-01-01');
            expect(runnableTest(expiredTest)).toEqual(null);
        });

        test('should return null for a test which is switched off', () => {
            cfg.switches.abDummyTest = false;
            const test = genAbTest('DummyTest');
            const rt = runnableTest(test);
            expect(rt).toBeNull();
        });

        test('should return null if the test cannot be run', () => {
            const test = genAbTest('DummyTest', false);
            expect(runnableTest(test)).toBeNull();
        });

        test('should return null if the test can be run but the variant cannot', () => {
            const test = genAbTest('DummyTest', true, '9999-12-12', [
                genVariant('control', false),
            ]);
            expect(runnableTest(test)).toBeNull();
        });

        test('should return a different variantToRun if the MVT cookie is different and localStorage is cleared', () => {
            const test = genAbTest('DummyTest');
            const rt = runnableTest(test);
            expect(rt).not.toBeNull();
            if (rt) {
                expect(rt.variantToRun).toHaveProperty('id', 'control');
                setParticipationsInLocalStorage(
                    runnableTestsToParticipations([rt])
                );
            }

            clearParticipations();
            overwriteMvtCookie(1235);

            const rt2 = runnableTest(test);
            expect(rt2).not.toBeNull();
            if (rt2) {
                expect(rt2.variantToRun).toHaveProperty('id', 'variant');
            }
        });

        test('should return the same variantToRun if the MVT cookie is different but the localStorage participations are preserved', () => {
            const test = genAbTest('DummyTest');
            const rt = runnableTest(test);
            expect(rt).not.toBeNull();
            if (rt) {
                expect(rt.variantToRun).toHaveProperty('id', 'control');
                setParticipationsInLocalStorage(
                    runnableTestsToParticipations([rt])
                );
            }

            overwriteMvtCookie(1235);

            const rt2 = runnableTest(test);
            expect(rt2).not.toBeNull();
            if (rt2) {
                expect(rt2.variantToRun).toHaveProperty('id', 'control');
            }
        });

        test('should return the variantToRun specified by the URL, overriding localStorage and cookie', () => {
            window.location.hash = '#ab-DummyTest=variant';
            setParticipationsInLocalStorage({
                DummyTest: { variant: 'control' },
            });

            const test = genAbTest('DummyTest');
            const rt = runnableTest(test);
            expect(rt).not.toBeNull();
            if (rt) {
                expect(rt.variantToRun).toHaveProperty('id', 'variant');
            }
        });

        test('should return the variantToRun specified by localStorage, overriding cookie', () => {
            setParticipationsInLocalStorage({
                DummyTest: { variant: 'variant' },
            });

            const test = genAbTest('DummyTest');
            const rt = runnableTest(test);
            expect(rt).not.toBeNull();
            if (rt) {
                expect(rt.variantToRun).toHaveProperty('id', 'variant');
            }
        });

        test('should return the variantToRun specified by the cookie, iff URL and localStorage are absent', () => {
            const test = genAbTest('DummyTest');
            const rt = runnableTest(test);
            expect(rt).not.toBeNull();
            if (rt) {
                expect(rt.variantToRun).toHaveProperty('id', 'control');
            }
        });

        test('should return null if notintest is specified in the URL hash', () => {
            window.location.hash = '#ab-DummyTest=notintest';

            const test = genAbTest('DummyTest');
            const rt = runnableTest(test);
            expect(rt).toBeNull();
        });

        test('should return null if notintest is specified in localStorage', () => {
            setParticipationsInLocalStorage({
                DummyTest: { variant: 'notintest' },
            });

            const test = genAbTest('DummyTest');
            const rt = runnableTest(test);
            expect(rt).toBeNull();
        });
    });
});
