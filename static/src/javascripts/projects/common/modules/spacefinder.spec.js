// @flow

import { _ } from 'common/modules/spacefinder';

jest.mock('commercial/modules/dfp/track-ad-render', () =>
    Promise.resolve(true)
);

describe('spacefinder', () => {
    test('should test elements correctly', () => {
        const rules = { minAbove: 50, minBelow: 300 };
        const element = document.createElement('div');
        const para = { top: 200, bottom: 300, element };
        const others: Object[] = [
            {
                opponent: { top: 0, bottom: 100, element },
                expectedResult: true,
            }, // fine
            {
                opponent: { top: 600, bottom: 700, element },
                expectedResult: true,
            }, // fine
            {
                opponent: { top: 0, bottom: 151, element },
                expectedResult: false,
            }, // too close to top (49 < 50)
            {
                opponent: { top: 400, bottom: 500, element },
                expectedResult: false,
            }, // too close to bottom (200 < 300)
            {
                opponent: { top: 210, bottom: 290, element },
                expectedResult: false,
            }, // overlapping
            {
                opponent: { top: 0, bottom: 600, element },
                expectedResult: false,
            }, // overlapping
            {
                opponent: { top: 100, bottom: 250, element },
                expectedResult: false,
            }, // overlapping
        ];

        others.forEach(other => {
            expect(_.testCandidate(rules, para, other.opponent)).toBe(
                other.expectedResult
            );
        });

        expect(_.testCandidates(rules, para, others.map(x => x.opponent))).toBe(
            false
        );
        expect(
            _.testCandidates(
                rules,
                para,
                others.slice(0, 2).map(x => x.opponent)
            )
        ).toBe(true);
    });
});
