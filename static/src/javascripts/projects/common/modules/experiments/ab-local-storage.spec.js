// @flow

import { arrayToParticipations } from 'common/modules/experiments/ab-local-storage';

describe('A/B local storage', () => {
    test('arrayToParticipations should correctly convert array to object', () => {
        expect(
            arrayToParticipations([
                { testId: 't', variantId: 'v' },
                { testId: 'j', variantId: 'g' },
            ])
        ).toEqual({
            t: { variant: 'v' },
            j: { variant: 'g' },
        });

        expect(
            arrayToParticipations([
                { testId: 't', variantId: 'v' },
                { testId: 't', variantId: 'w' },
            ])
        ).toEqual({
            t: { variant: 'w' },
        });

        expect(arrayToParticipations([])).toEqual({});
    });
});
