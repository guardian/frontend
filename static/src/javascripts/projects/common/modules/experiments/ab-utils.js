import config from 'lib/config';
import toPairs from 'lodash/toPairs';
import fromPairs from 'lodash/fromPairs';
import { NOT_IN_TEST, notInTestVariant } from './ab-constants';

export const testSwitchExists = (testId) =>
    config.get(`switches.ab${testId}`, 'NOT_FOUND') !== 'NOT_FOUND';

export const isTestSwitchedOn = (testId) =>
    config.get(`switches.ab${testId}`, false);

export const runnableTestsToParticipations = (
    runnableTests
) =>
    runnableTests.reduce(
        (participations, { id: testId, variantToRun }) => ({
            ...participations,
            ...{ [testId]: { variant: variantToRun.id } },
        }),
        {}
    );

export const testExclusionsWhoseSwitchExists = (
    participations
) => {
    const pairs = toPairs(
        participations
    ).filter(
        ([testId, { variant: variantId }]) =>
            variantId === NOT_IN_TEST && testSwitchExists(testId)
    );
    return fromPairs(pairs);
};

// If the given test has a 'notintest' participation, return the notintest variant.
// Or else, if the given test has a normal variant participation, return that variant.
export const testAndParticipationsToVariant = (
    test,
    participations
) => {
    const participation = participations[test.id];
    if (participation) {
        // We need to return something concrete here to ensure
        // that a notintest variant actually prevents other variants running.
        if (participation.variant === NOT_IN_TEST) {
            return notInTestVariant;
        }

        return test.variants.find(
            variant => variant.id === participation.variant
        );
    }

    return null;
};
