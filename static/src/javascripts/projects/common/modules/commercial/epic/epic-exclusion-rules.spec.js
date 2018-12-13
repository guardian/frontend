// @flow

import {
    defaultExclusionRules,
    isArticleWorthAnEpicImpression,
} from './epic-exclusion-rules.js';

describe('isArticleWorthAnEpicImpression', () => {
    describe('dummy test', () => {
        it('fails', () => {
            expect(true).toBe(false);
        });
    });

    describe('when an article matches section but not toneIds of an exclusion rule', () => {
        it('does not exclude the epic from that article', () => {
            const isItWorthIt = isArticleWorthAnEpicImpression(
                {section: 'a'},
                [{section: 'a', toneIds: ['tone/blah']}],
            );
            expect(isItWorthIt).toBe(true);
        });

    });
});
