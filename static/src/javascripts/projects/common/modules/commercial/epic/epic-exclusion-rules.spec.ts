import { isArticleWorthAnEpicImpression } from './epic-exclusion-rules';

describe('isArticleWorthAnEpicImpression', () => {
    describe('when an article matches section but not toneIds of an exclusion rule', () => {
        it('is worth an epic impression', () => {
            const isItWorthIt = isArticleWorthAnEpicImpression(
                { section: 'a', toneIds: 'tone/news', keywordIds: 'us-news' },
                [{ section: 'a', toneIds: ['tone/blah'] }]
            );
            expect(isItWorthIt).toBe(true);
        });
    });

    describe('when an article matches section but not keywordIds of an exclusion rule', () => {
        it('is worth an epic impression', () => {
            const isItWorthIt = isArticleWorthAnEpicImpression(
                { section: 'a', toneIds: 'tone/news', keywordIds: 'us-news' },
                [{ section: 'a', keywordIds: ['us-news', 'something-else'] }]
            );
            expect(isItWorthIt).toBe(true);
        });
    });

    describe('when an article matches toneIds but not section of an exclusion rule', () => {
        it('is worth an epic impression', () => {
            const isItWorthIt = isArticleWorthAnEpicImpression(
                { section: 'a', toneIds: 'tone/news', keywordIds: 'us-news' },
                [{ section: 'b', toneIds: ['tone/news'] }]
            );
            expect(isItWorthIt).toBe(true);
        });
    });

    describe('when an article matches section, all toneIds, but just some of the keywordIds of an exclusion rule', () => {
        it('is worth an epic impression', () => {
            const isItWorthIt = isArticleWorthAnEpicImpression(
                {
                    section: 'a',
                    toneIds: 'tone/whatevs,tone/blah,tone/something',
                    keywordIds: 'trump,us-news',
                },
                [
                    {
                        section: 'a',
                        toneIds: ['tone/something', 'tone/whatevs'],
                        keywordIds: ['us-news', 'clinton'],
                    },
                ]
            );
            expect(isItWorthIt).toBe(true);
        });
    });

    describe('when an article matches toneIds of an exclusion rule which has no section or keywordIds', () => {
        it('is not worth an epic impression', () => {
            const isItWorthIt = isArticleWorthAnEpicImpression(
                {
                    section: 'a',
                    toneIds: 'tone/whatevs,tone/blah,tone/something',
                    keywordIds: 'us-news',
                },
                [{ toneIds: ['tone/blah'] }]
            );
            expect(isItWorthIt).toBe(false);
        });
    });

    describe('when an article matches keywordIds of an exclusion rule which has no section or keywordIds', () => {
        it('is not worth an epic impression', () => {
            const isItWorthIt = isArticleWorthAnEpicImpression(
                {
                    section: 'a',
                    toneIds: 'tone/whatevs,tone/blah,tone/something',
                    keywordIds: 'us-news',
                },
                [{ keywordIds: ['us-news'] }]
            );
            expect(isItWorthIt).toBe(false);
        });
    });

    describe('when an article matches keywordIds and toneIds of an exclusion rule which has no section', () => {
        it('is not worth an epic impression', () => {
            const isItWorthIt = isArticleWorthAnEpicImpression(
                {
                    section: 'a',
                    toneIds: 'tone/whatevs,tone/blah,tone/something',
                    keywordIds: 'trump,us-news',
                },
                [
                    {
                        toneIds: ['tone/something', 'tone/whatevs'],
                        keywordIds: ['us-news', 'trump'],
                    },
                ]
            );
            expect(isItWorthIt).toBe(false);
        });
    });
    describe('when an article matches keywordIds, toneIds and section of an exclusion rule', () => {
        it('is not worth an epic impression', () => {
            const isItWorthIt = isArticleWorthAnEpicImpression(
                {
                    section: 'a',
                    toneIds: 'tone/whatevs,tone/blah,tone/something',
                    keywordIds: 'trump,us-news,blah',
                },
                [
                    {
                        section: 'a',
                        toneIds: ['tone/blah', 'tone/whatevs'],
                        keywordIds: ['blah', 'trump'],
                    },
                ]
            );
            expect(isItWorthIt).toBe(false);
        });
    });
});
