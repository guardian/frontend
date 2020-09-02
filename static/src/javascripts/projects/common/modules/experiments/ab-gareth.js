// @flow
import { AB as _AB } from '@guardian/ab-core';
import {
    getMvtNumValues,
    getMvtValue,
} from 'common/modules/analytics/mvt-cookie';
import config from 'lib/config';
import { local } from 'lib/storage';

const getForcedParticipationsFromUrl = (
    windowHash: string,
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

const getForcedParticipationsFromLocalStorage = (): Participations | {} => {
    const key = 'gu.ab.participations';
    return local.get(key)
}

export type ABType = {
    runnableTest: <T: ABTest>(T) => ?Runnable<T>,
    allRunnableTests: <T: ABTest>($ReadOnlyArray<T>) => $ReadOnlyArray<Runnable<T>>,
    firstRunnableTest: <T: ABTest>($ReadOnlyArray<T>) => ?Runnable<T>,
    isUserInVariant: (string, string) => boolean,
    // TODO add OphanAPI too (https://github.com/guardian/ab-testing/blob/main/packages/ab-core/src/types.ts#L36)
}

export type Config = {
    mvtMaxValue?: number;
    mvtId: number;
    pageIsSensitive: boolean;
    // abTestSwitches start with ab with test ID: abTestIAmRunning
    abTestSwitches: { [string]: boolean};
    forcedTestVariants?: Participations;
    forcedTestException?: string, // ABTest['id'];
    arrayOfTestObjects: $ReadOnlyArray<ABTest>;
}

export const AB = (c: Config): ABType => new _AB(c)

// TODO move out?
export const testConfig = (tests: $ReadOnlyArray<ABTest>): Config => {
    const forced = {
        ...getForcedParticipationsFromLocalStorage(),
        ...getForcedParticipationsFromUrl(window.location.hash)
    };

    return {
        mvtMaxValue: getMvtNumValues(),
        mvtId: getMvtValue(),
        pageIsSensitive: config.get('page.isSensitive'),
        abTestSwitches: config.get("switches"),
        forcedTestVariants: forced,
        forcedTestException: undefined, // unsupported for now
        arrayOfTestObjects: tests,
    };
}
