import { getForcedParticipationsFromUrl } from 'common/modules/experiments/ab-url';

describe('A/B URL', () => {
    test('getForcedParticipationsFromUrl should correctly get participations from URL', () => {
        window.location.hash = '#ab-Test=Variant,Test2=Variant2';

        expect(getForcedParticipationsFromUrl()).toEqual({
            Test: { variant: 'Variant' },
            Test2: { variant: 'Variant2' },
        });
    });
});
