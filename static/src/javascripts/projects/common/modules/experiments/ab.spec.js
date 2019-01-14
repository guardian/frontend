// @flow

import { genAbTest, genVariant } from 'common/modules/experiments/__fixtures__/ab-test';
import { runnableTest } from 'common/modules/experiments/ab-core';
import {
    clearParticipations,
    getParticipationsFromLocalStorage,
    setParticipationsInLocalStorage
} from 'common/modules/experiments/ab-local-storage';
import { overwriteMvtCookie } from 'common/modules/analytics/mvt-cookie';
import { runnableTestsToParticipations } from 'common/modules/experiments/ab-utils';
import { runAndTrackAbTests } from 'common/modules/experiments/ab';

jest.mock('common/modules/analytics/mvt-cookie');
jest.mock('common/modules/experiments/ab-tests');

/* eslint guardian-frontend/global-config: "off" */
/* eslint guardian-frontend/no-direct-access-config: "off" */
const cfg = window.guardian.config;

describe('A/B', () => {
    beforeEach(() => {
        cfg.page = {};
        cfg.page.isSensitive = false;
        cfg.switches = {
            abDummyTest: true
        };
        overwriteMvtCookie(1234);
        window.location.hash = '';
        setParticipationsInLocalStorage({});
    });

    afterEach(() => {
    });

    describe('runAndTrackAbTests', () => {
        test('renamed/deleted tests should be removed from localStorage', () => {
            setParticipationsInLocalStorage({noTestSwitchForThisOne: {variant: 'Control'}});
            runAndTrackAbTests();
            expect(getParticipationsFromLocalStorage()).toEqual({});
        });

        test('tests with notintest participations should not run, but this should be persisted to localStorage', () => {
            setParticipationsInLocalStorage({abDummyTest: {variant: 'notintest'}});
            runAndTrackAbTests();
            expect(getParticipationsFromLocalStorage()).toEqual({});
        });

        test('URL participations for non-existent variants that are not notintest should not be persisted to localStorage', () => {

        });

        test('URL participations for variants which cannot be run on this pageview should not be persisted to localStorage', () => {

        });

        test('localStorage participations for non-existent variants that are not notintest should not be preserved in localStorage', () => {

        });

        test('localStorage participations for variants which cannot be run should not be preserved in localStorage', () => {
            // Set participation via URL. preserved in localStorage
            // on next pageview test cannot be run
            // on pageview after that, it's gone from localStorage
        });
    });

    describe('getParticipations', () => {
        test('should give the same result whether called before or after runAndTrackAbTests', () => {
            // Change to localStorage:
            // Add new test from cookie
            // Change existing test from URL
            // Remove test which has no switch
            runAndTrackAbTests();
        });
    })
});
