// @flow
import { AB as _AB } from '@guardian/ab-core';
import {
    getMvtNumValues,
    getMvtValue,
} from 'common/modules/analytics/mvt-cookie';
import config from 'lib/config';

const getForcedParticipationsFromUrl = (
    windowHash: string
): Participations | {} => {
    if (windowHash.startsWith('#ab')) {
        const tokens = windowHash.replace('#ab-', '').split(',');
        return tokens.reduce((obj, token) => {
            const [testId, variantId] = token.split('=');

            if (testId && variantId) {
                return {
                    ...obj,
                    [testId]: { variant: variantId },
                };
            }

            return obj;
        }, {});
    }

    return {};
};

export type ABType = {
    runnableTest: <T: ABTest>(T) => ?Runnable<T>,
    allRunnableTests: <T: ABTest>(
        $ReadOnlyArray<T>
    ) => $ReadOnlyArray<Runnable<T>>,
    firstRunnableTest: <T: ABTest>($ReadOnlyArray<T>) => ?Runnable<T>,
    isUserInVariant: (string, string) => boolean,
    registerCompleteEvents: (tests: $ReadOnlyArray<Runnable<ABTest>>) => void,
    registerImpressionEvents: (tests: $ReadOnlyArray<Runnable<ABTest>>) => void,
    trackABTests: (tests: $ReadOnlyArray<Runnable<ABTest>>) => void
};

export type Config = {
    mvtMaxValue?: number,
    mvtId: number,
    pageIsSensitive: boolean,
    // abTestSwitches start with ab with test ID: abTestIAmRunning
    abTestSwitches: { [string]: boolean },
    forcedTestVariants?: Participations,
    forcedTestException?: string,
    arrayOfTestObjects: $ReadOnlyArray<ABTest>,
    serverSideTests?: { [string]: boolean },
    errorReporter?: (...args: mixed[]) => void,
    ophanRecord?: (send: {
        [key: string]: OphanABPayload;
    }) => void;
};

export const AB = (c: Config): ABType => new _AB(c);

// TODO move out?
export const testConfig = (tests: $ReadOnlyArray<ABTest>): Config => {
    const forced = {
        ...getForcedParticipationsFromUrl(window.location.hash),
    };

    const ophanRecord = window && window.guardian && window.guardian.ophan && window.guardian.ophan.record || undefined;
    const errorReporter = window && window.guardian && window.guardian.modules && window.guardian.modules.sentry && window.guardian.modules.sentry.reportError || undefined;

    return {
        mvtMaxValue: getMvtNumValues(),
        mvtId: getMvtValue(),
        pageIsSensitive: config.get('page.isSensitive'),
        abTestSwitches: config.get('switches'),
        forcedTestVariants: forced,
        forcedTestException: undefined, // unsupported for now
        arrayOfTestObjects: tests,
        serverSideTests: {},
        errorReporter,
        ophanRecord
    };
};
